import "server-only";

import { 
    Account, 
    Client, 
    Databases, 
    Models, 
    Storage, 
    type Account as AccountType,
    type Databases as DatabasesType,
    type Users as UsersType,
    type Storage as StorageType,
} from "node-appwrite";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { BYPASS_AUTH, BYPASS_USER } from "@/ByPass";

type Context = {
    Variables: {
        account: AccountType;
        databases: DatabasesType;
        storage: StorageType;
        users: UsersType;
        user: Models.User<Models.Preferences>
    }
}
export const SessionMiddleware = createMiddleware<Context>(
    async (c, next) => {

// // TODO: REMOVE THIS IN DEVELOPMENT 
//         if (BYPASS_AUTH) {
//             c.set("user", BYPASS_USER);
//             c.set("databases", {} as unknown as DatabasesType);
//             c.set("account", {} as unknown as AccountType);
//             c.set("storage", {} as unknown as StorageType);
//             return next();
//         }

        const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const session = getCookie(c, AUTH_COOKIE);

        if(!session){
            return c.json({error: "Unauthorized"}, 401);
        }
        
        client.setSession(session);
        
        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);

        const user = await account.get();

        c.set("account", account);
        c.set("databases", databases);
        c.set("storage", storage);
        c.set("user", user);

        await next();
    }
)
