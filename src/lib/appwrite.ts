import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/features/auth/constants";
import {Client, Account, Storage, Users, Databases} from "node-appwrite";

export async function createSessionClient(){
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const session = (await cookies()).get(AUTH_COOKIE);

        if(!session || !session.value) {
            throw new Error("Unauthorized")
        };

        client.setSession(session.value);

        return {
            get account(){
                return new Account(client);
            },

            get databases(){
                return new Databases(client);
            },
            get storage(){
                return new Storage(client);
            }
        }
};

export async function createAdminClient(){
    const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!)
    
    return {
        get account(){
            return new Account(client);
        },
        get users(){
            return new Users(client);
        },
        get storage(){
            return new Storage(client);
        }
    };
};