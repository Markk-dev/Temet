import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMembers } from "@/features/members/utils";
import { createCommentSchema, updateCommentSchema } from "../schemas";
import { DATABASE_ID } from "@/config";
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
        "68667b13001e69e4bf4f", 
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
        "comments",
        [
          Query.equal("taskId", taskId),
          Query.equal("workspaceId", task.workspaceId),
          Query.orderDesc("$createdAt"),
        ],
      );

      
      const { users } = await createAdminClient();
      const commentsWithAuthors = await Promise.all(
        comments.documents.map(async (comment: any) => {
          try {
            const author = await users.get(comment.authorId);
            
            // Parse pinnedFieldValues if it exists
            let parsedPinnedFieldValues = null;
            if (comment.pinnedFieldValues) {
              try {
                parsedPinnedFieldValues = JSON.parse(comment.pinnedFieldValues);
              } catch (e) {
                // If parsing fails, keep the original value
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
          } catch (error) {
            return {
              ...comment,
              author: {
                name: "Unknown User",
                email: "unknown@example.com",
              },
            };
          }
        })
      );

      
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

      // Use admin client to create the comment
      const { databases: adminDatabases, users } = await createAdminClient();
      
      const comment = await adminDatabases.createDocument(
        DATABASE_ID,
        "comments",
        ID.unique(),
        {
          taskId,
          workspaceId,
          content,
          authorId: user.$id,
          parentId: parentId || null,
          priority: priority || null,
          pinnedFields: pinnedFields || [],
          pinnedFieldValues: pinnedFieldValues ? JSON.stringify(pinnedFieldValues) : null,
          mentions: mentions || [],
        }
      );

      // Get author details
      const author = await users.get(user.$id);

      const commentWithAuthor = {
        ...comment,
        author: {
          name: author.name || author.email,
          email: author.email,
        },
        replies: [],
      };

      // Trigger real-time event for new comment (non-blocking)
      pusherServer.trigger(
        getCommentsChannel(taskId),
        COMMENT_EVENTS.CREATED,
        commentWithAuthor
      ).catch(console.error); // Handle errors silently

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

      // Use admin client for update operations
      const { databases: adminDatabases } = await createAdminClient();

      const comment = await adminDatabases.getDocument(
        DATABASE_ID,
        "comments",
        commentId,
      );

      if (comment.authorId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { content, priority, pinnedFields, pinnedFieldValues } = updateData;

      const updatedComment = await adminDatabases.updateDocument(
        DATABASE_ID,
        "comments",
        commentId,
        {
          content: content || comment.content,
          priority: priority || comment.priority,
          pinnedFields: pinnedFields || comment.pinnedFields,
          pinnedFieldValues: pinnedFieldValues ? JSON.stringify(pinnedFieldValues) : comment.pinnedFieldValues,
        },
      );

      // Trigger real-time event for updated comment (non-blocking)
      pusherServer.trigger(
        getCommentsChannel(comment.taskId),
        COMMENT_EVENTS.UPDATED,
        updatedComment
      ).catch(console.error); // Handle errors silently

      return c.json({ data: updatedComment });
    }
  )
  .delete(
    "/:commentId",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { commentId } = c.req.param();

      // Use admin client for deletion
      const { databases: adminDatabases } = await createAdminClient();

      const comment = await adminDatabases.getDocument(
        DATABASE_ID,
        "comments",
        commentId,
      );

      if (comment.authorId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Delete replies first
      const replies = await adminDatabases.listDocuments(
        DATABASE_ID,
        "comments",
        [Query.equal("parentId", commentId)],
      );

      // Collect all reply IDs that will be deleted
      const deletedReplyIds: string[] = [];
      
      // Delete all replies
      for (const reply of replies.documents) {
        deletedReplyIds.push(reply.$id);
        await adminDatabases.deleteDocument(DATABASE_ID, "comments", reply.$id);
      }

      // Delete the main comment
      await adminDatabases.deleteDocument(DATABASE_ID, "comments", commentId);

      // Trigger real-time event for deleted comment with cascade info
      pusherServer.trigger(
        getCommentsChannel(comment.taskId),
        COMMENT_EVENTS.DELETED,
        { 
          commentId,
          deletedReplyIds 
        }
      ).catch(console.error); // Handle errors silently

      return c.json({ success: true });
    }
  );

export default app; 