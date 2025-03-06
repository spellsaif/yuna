
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
// src/middleware.ts

export const kamiJson: Middleware = (ctx, next) => {
  // Only attempt to parse body for methods that typically send a body.
  if (['POST', 'PUT', 'PATCH'].includes(ctx.req.method || '')) {
    const contentType = ctx.req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      let data = '';

      // Listen for data chunks
      ctx.req.on('data', (chunk) => {
        data += chunk;
      });

      // Use .once('end') so the callback is only fired one time.
      ctx.req.once('end', () => {
        
        // Check if data is empty after trimming.
        if (data.trim() === '') {
          ctx.body = {};
        } else {
          try {
            ctx.body = JSON.parse(data);
          } catch (error) {
            console.error('JSON parsing error:', error, 'Raw data:', data);
            ctx.body = {};
          }
        }
        next();
      });

      // Also handle errors on the request stream.
      ctx.req.once('error', (error) => {
        console.error('Error reading request:', error);
        ctx.body = {};
        next();
      });
    } else {
      // If Content-Type is not JSON, simply proceed.
      next();
    }
  } else {
    // For GET or other methods that do not send a body, proceed directly.
    next();
  }
};
