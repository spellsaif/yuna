import chalk from "chalk";
import { Middleware } from "../types";



/**
 * Middleware to log beautiful logs for incoming request and response
*/

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


export default nekoTrace;