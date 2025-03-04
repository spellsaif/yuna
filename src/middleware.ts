
import { Middleware } from "./types";

/**
 * Middleware to log the request method and url
*/

export const log: Middleware = (ctx, next) => {
    console.log(`${ctx.req.method} ${ctx.req.url}`);
    next();
}


/**
 * Json parser middleware to parse the request body
 */
export const jsonParser: Middleware = (ctx, next) => {
    let data = '';
    ctx.req.on('data', chunk => {
        data += chunk.toString();
    });

    //after data is received completely, we need to parse it
    try {
        ctx.req.on('end', () => {
            ctx.body = JSON.parse(data);
        })
    }catch(err) {
        ctx.body = data;
    }

    next();
}
