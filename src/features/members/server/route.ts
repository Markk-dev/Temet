import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { SessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { getMembers } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { Member, MemberRole } from "../types";
import { pusher } from "@/lib/pusher";

const app = new Hono()
.get(
    "/",
    SessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.valid("query");

        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if(!member){
            return c.json({ error: "Unauthorized" }, 401);
        };

        const members = await databases.listDocuments<Member>(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId)]
        );

        const populatedMembers = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);

                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                };
            }),
        );
    
        return c.json({
            data: {
                ...members,
                documents: populatedMembers,
            },
        })
    }
)
.get(
    "/current-member/:workspaceId",
    SessionMiddleware,
    async (c) => {
        const { workspaceId } = c.req.param();
        const user = c.get("user");
        const databases = c.get("databases");
        
        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Member not found" }, 404);
        }

        return c.json({ data: member });
    }
)
.delete(
    "/:memberId",
    SessionMiddleware,
    async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");
        const databases = c.get("databases");
        
        const memberToDelete = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        const allMembersInWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", memberToDelete.workspaceId)]
        );

        const member = await getMembers({
            databases,
            workspaceId: memberToDelete.workspaceId,
            userId: user.$id,
        });

        if(!member || member.role !== MemberRole.ADMIN){
            return c.json({ error: "Unauthorized" }, 401);
        };

        if(allMembersInWorkspace.total === 1){
            return c.json({ error: "Cannot delete the last member" }, 400);
        };

        await databases.deleteDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        await pusher.trigger("members", "member-deleted", { memberId });

        return c.json({ "data": { $id: memberToDelete.$id}})
    },
)
.patch(
    "/:memberId",   
    SessionMiddleware,
    zValidator("json", z.object({role: z.nativeEnum(MemberRole)})),
    async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");
        const { role } = c.req.valid("json");
        const databases = c.get("databases");
        
        const memberToUpdate = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        const allMembersInWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", memberToUpdate.workspaceId)]
        );

        const member = await getMembers({
            databases,
            workspaceId: memberToUpdate.workspaceId,
            userId: user.$id,
        });

        if(!member || member.role !== MemberRole.ADMIN){
            return c.json({ error: "Unauthorized" }, 401);
        };
        
        if(allMembersInWorkspace.total === 1){
            return c.json({ error: "Cannot downgrade the last member" }, 400);
        };

        await databases.updateDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
            {
                role,
            }
        );

        await pusher.trigger("members", "member-updated", { memberId, role });

        return c.json({ "data": { $id: memberToUpdate.$id}})
    },
)

export default app;