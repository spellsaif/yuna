import http from "http";
import { CookieOptions } from "./cookie";

/**
 * Context interface bundles everything like:
 * - Request: The node.js request
 * - Response: The node.js response
 * - Params: The route parameters
 * - body: parsed data from request body 
 * - state: a place to store extra data you want to share or pass around
 */

// Context Interface
export interface Context {
    method: string;
    url: string;
    headers: http.IncomingHttpHeaders;
    params: Record<string, string>;
    query: Record<string, string | string[]>; 
    body?: any;
    state: Record<string, any>;

    // flag to check if response is sent already
    whispered?: boolean;

    //Helper methods
    status:(code: number) => Context;
    set:(filed: string, value: string) => Context;
    json:(data: unknown) => void;
    text:(data:string) => void;
    
    //for sending any response to client
    messageBack:(data:unknown) => void;
    
    //for redirecting
    fateShift:(url:string, code?: number) => void;

    //Cookies API
    cookies: {
        get:(name:string) => string | undefined;
        set:(name:string, value:string, options?: CookieOptions) => void; 
    }

    //Optionally exposing req, res objects if needed
    req: http.IncomingMessage;
    res: http.ServerResponse;


}


export type Next = () => void;

/**
 * Middleware functions receives the context(ctx) and Next function.
 * It can be used to perform tasks before sending repsonse to client like Logging, Parsing, etc.
 */
export type Middleware = (ctx: Context, next: Next) => void;

/**
 * Route handler function receives the context(ctx) and should return a response.
 */

export type RouteHandler = (ctx: Context) => void;
