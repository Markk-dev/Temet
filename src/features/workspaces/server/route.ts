import { Hono } from 'hono'
import { ID } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, WORKSPACES_ID } from '@/config';

import { SessionMiddleware } from '@/lib/session-middleware';
import { createWorkspacesSchema } from '../schemas';



const app = new Hono()
    .post(
        "/",
        zValidator("json", createWorkspacesSchema),
        SessionMiddleware,
        async (c) => {
            const database = c.get("databases");
            const user = c.get("user");
            
            const {name} = c.req.valid("json");
            
            const workspace =  await database.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                }
            )
            return c.json(workspace);
        },
    );

export default app;