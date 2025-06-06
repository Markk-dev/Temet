import { Hono } from "hono";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { loginSchema, registerSchema } from "../scheme";


const app = new Hono()
    .post("/login",
        zValidator("json", loginSchema),
        async (c) => {
            const {email, password} = c.req.valid("json");

            console.log({email, password});
            return c.json({email, password});
        }
    )
    .post("/register",
        zValidator("json", registerSchema),
        async (c) => {
            const { name, email, password} = c.req.valid("json");

            console.log({name, email, password});
            return c.json({name, email, password});
        }
    )
        
export default app;