
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
export const kamiJson: Middleware = (ctx, next) => {
    let data = '';
    ctx.req.on('data', chunk => {
        data += chunk.toString();
    });

    //after data is received completely, we need to parse it
    const contentType = ctx.req.headers['content-type'] || '';

    if(contentType.includes('application/json')) { 
        // logging raw data for debugging
        console.log("Received Json Body", data);
        try {
            // if data is empty after trimming, we will set it to empty object
            if(data.trim() === '') {
                ctx.body = {};
            } else {
                ctx.body = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error Parsing JSON", error);
            ctx.body = {};
        }
    } else {
        ctx.body = {};
    }

    next();
}
