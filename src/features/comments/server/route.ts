import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMembers } from "@/features/members/utils";
import { createCommentSchema, updateCommentSchema } from "../schemas";
import { DATABASE_ID, TASKS_ID, COMMENTS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { SessionMiddleware } from "@/lib/session-middleware";
import { pusherServer, getCommentsChannel, COMMENT_EVENTS } from "@/lib/pusher";
import { Comment } from "../types";

const app = new Hono()
  .get(
    "/:taskId",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      const task = await databases.getDocument(
        DATABASE_ID,
        "6875b24d002cfb61b81b", 
        taskId,
      );

      const member = await getMembers({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { databases: adminDatabases } = await createAdminClient();
      
      const comments = await adminDatabases.listDocuments(
        DATABASE_ID,
        COMMENTS_ID,
        [
          Query.equal("taskId", taskId),
          Query.equal("workspaceId", task.workspaceId),
          Query.orderDesc("$createdAt"),
        ],
      );

      
      const uniqueAuthorIds = [...new Set(comments.documents.map(comment => comment.authorId))];
      
      
      const { users } = await createAdminClient();
      const authorsMap = new Map();
      
      if (uniqueAuthorIds.length > 0) {
        
        const authorPromises = uniqueAuthorIds.map(async (authorId) => {
          try {
            const author = await users.get(authorId);
            return [authorId, author];
          } catch (error) {
            return [authorId, { name: "Unknown User", email: "unknown@example.com" }];
          }
        });
        
        const authorResults = await Promise.allSettled(authorPromises);
        authorResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            const [authorId, author] = result.value;
            authorsMap.set(authorId, author);
          }
        });
      }

      
      const commentsWithAuthors = comments.documents.map((comment: any) => {
        const author = authorsMap.get(comment.authorId) || { 
          name: "Unknown User", 
          email: "unknown@example.com" 
        };
        
        
        let parsedPinnedFieldValues = null;
        if (comment.pinnedFieldValues) {
          try {
            parsedPinnedFieldValues = JSON.parse(comment.pinnedFieldValues);
          } catch (e) {
            parsedPinnedFieldValues = comment.pinnedFieldValues;
          }
        }
        
        return {
          ...comment,
          pinnedFieldValues: parsedPinnedFieldValues,
          author: {
            name: author.name || author.email,
            email: author.email,
          },
        };
      });

      
      const commentMap = new Map<string, Comment & { replies: Comment[] }>();
      const rootComments: (Comment & { replies: Comment[] })[] = [];

      commentsWithAuthors.forEach((comment: any) => {
        commentMap.set(comment.$id, { ...comment, replies: [] });
      });

      commentsWithAuthors.forEach((comment: any) => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentMap.get(comment.$id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.$id)!);
        }
      });

      return c.json({ data: rootComments });
    }
  )
  .post(
    "/",
    SessionMiddleware,
    zValidator("json", createCommentSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId, workspaceId, content, parentId, priority, pinnedFields, pinnedFieldValues, mentions } = c.req.valid("json");

      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      
      const { databases: adminDatabases, users } = await createAdminClient();
      
      const comment = await adminDatabases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          taskId,
          workspaceId,
          content,
          authorId: user.$id,
          parentId: parentId || null,
          priority: priority || null,
          pinnedFields: pinnedFields || [],
          pinnedFieldValues: pinnedFieldValues ? 
            JSON.stringify(pinnedFieldValues).substring(0, 1000) : null,
          mentions: mentions || [],
        }
      );

      
      const author = await users.get(user.$id);

      const commentWithAuthor = {
        ...comment,
        author: {
          name: author.name || author.email,
          email: author.email,
        },
        replies: [],
      };

      
      pusherServer.trigger(
        getCommentsChannel(taskId),
        COMMENT_EVENTS.CREATED,
        commentWithAuthor
      ).catch(console.error); 

      return c.json({ data: commentWithAuthor });
    }
  )
  .patch(
    "/:commentId",
    SessionMiddleware,
    zValidator("json", updateCommentSchema),
    async (c) => {
      const user = c.get("user");
      const { commentId } = c.req.param();
      const updateData = c.req.valid("json");

      
      const { databases: adminDatabases } = await createAdminClient();

      const comment = await adminDatabases.getDocument(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      if (comment.authorId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { content, priority, pinnedFields, pinnedFieldValues } = updateData;

      const updatedComment = await adminDatabases.updateDocument(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
        {
          content: content || comment.content,
          priority: priority || comment.priority,
          pinnedFields: pinnedFields || comment.pinnedFields,
          pinnedFieldValues: pinnedFieldValues ? 
            JSON.stringify(pinnedFieldValues).substring(0, 1000) : comment.pinnedFieldValues,
        },
      );

      
      pusherServer.trigger(
        getCommentsChannel(comment.taskId),
        COMMENT_EVENTS.UPDATED,
        updatedComment
      ).catch(console.error); 

      return c.json({ data: updatedComment });
    }
  )
  .delete(
    "/:commentId",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { commentId } = c.req.param();

      
      const { databases: adminDatabases } = await createAdminClient();

      const comment = await adminDatabases.getDocument(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      if (comment.authorId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      
      const replies = await adminDatabases.listDocuments(
        DATABASE_ID,
        COMMENTS_ID,
        [Query.equal("parentId", commentId)],
      );

      
      const deletedReplyIds: string[] = [];
      
      
      for (const reply of replies.documents) {
        deletedReplyIds.push(reply.$id);
        await adminDatabases.deleteDocument(DATABASE_ID, COMMENTS_ID, reply.$id);
      }

      
      await adminDatabases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

      
      pusherServer.trigger(
        getCommentsChannel(comment.taskId),
        COMMENT_EVENTS.DELETED,
        { 
          commentId,
          deletedReplyIds 
        }
      ).catch(console.error); 

      return c.json({ success: true });
    }
  );

export default app; 