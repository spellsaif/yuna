
import chalk from "chalk";
import { Middleware } from "./types";

/**
 * Middleware to log the request method and url
*/

// export const nekoTrace: Middleware = (ctx, next) => {
//     console.log(`Method:${ctx.req.method}  Url: ${ctx.req.url}`);
//     next();
// }

interface NekoTraceOptions {
  logRequest?: boolean;
  logResponse?: boolean;
  customPrefix?: string;
}

const defaultOption: NekoTraceOptions = {
  logRequest: true,
  logResponse: true,
  customPrefix: 'NekoTrace'
}


export const nekoTrace = (options: NekoTraceOptions  = {}): Middleware => {
  const config = {...defaultOption, ...options};
  return (ctx, next) => {
    const prefix = config.customPrefix;
    if (config.logRequest) {
      console.log(`${chalk.gray(new Date().toISOString())} ${chalk.blue("[INFO]")} ✨ ${chalk.magenta(`[${prefix}]`)} Incoming request: ${ctx.req.method} ${ctx.req.url}`);
    }

    const result: any = next(); 

    if (result && typeof result.then === "function") {
      return result.then(() => {
        if (config.logResponse) {
          console.log(
            `${chalk.gray(new Date().toISOString())} ${chalk.green("[SUCCESS]")} 🎉 ${chalk.magenta(
              `[${prefix}]`
            )} Response sent with status: ${ctx.res.statusCode}`
          );
        }
      });
    }

    if (config.logResponse) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.green("[SUCCESS]")} 🎉 ${chalk.magenta(
          `[${prefix}]`
        )} Response sent with status: ${ctx.res.statusCode}`
      );
    }

    return result;

  }
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
