//Type Definition and Context Interface


import {IncomingMessage, ServerResponse} from "http";

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
    req: IncomingMessage;
    res: ServerResponse;
    params?: Record<string, string>
    body?: any;
    state?: Record<string, any>;

    // flag to check if response is sent already
    replied?: boolean;

    // reply method which sends plain string or object and sets content type and status code to json if not provided
    reply: (data: string | object, options?: { contentType?: string, statusCode?: number}) => void;
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

