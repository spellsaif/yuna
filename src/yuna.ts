/**
 * This is core file for Yuna. It contains the main class that will be used to create the app.
 */

import http from "http";
import { Context, Middleware, RouteHandler } from "./types";
import { assembleRouter } from "./router";
import { MethodType } from "./enums";

/**
 * Route type holds method, path, handler and compiled regex for the dynamic route.
 */

interface Route {
    method: string;
    path: string;
    handler: RouteHandler;
    regex: RegExp;
    keys: string[];
}

export class Yuna {
    // Array to store middleware functions
    private middlewares: Middleware[] = [];
    
    //Array to store routes definitions
    private routes: Route[] = [];

    //Register middleware that will run on every request
    summon(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Register GET Route
     */

    get(path: string, handler: RouteHandler) {
        this.addRoute(MethodType.GET, path, handler)
    }

    /**
     * Register POST Route
     */

    post(path: string, handler: RouteHandler) {
          this.addRoute(MethodType.POST, path, handler);
    }


        /**
     * Register DELETE Route
     */

        delete(path: string, handler: RouteHandler) {
            this.addRoute(MethodType.DELETE, path, handler);
      }

          /**
     * Register PUT Route
     */

    put(path: string, handler: RouteHandler) {
        this.addRoute(MethodType.PUT, path, handler);
  }

      /**
     * Register PATCH Route
     */

      patch(path: string, handler: RouteHandler) {
        this.addRoute(MethodType.PATCH, path, handler);
  }


    /**
     * Helper method to add route
     */

    private addRoute(method: string, path: string, handler: RouteHandler) {
        const {regex, keys} = assembleRouter(path);

        this.routes.push({
            method,
            path,
            handler,
            regex,
            keys
        });
    }

    /**
     * Create unified method to handle all requests
     */

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {

        //Building context object
        const ctx: Context = {
            req,
            res,
            params: {},
            state: {},
            whispered: false,
            whisper: () => {} //tempory placeholder, will be replaced later
        };


        //Attach whisper method to context
        ctx.whisper = (data: string | object, options?: {contextType?:string, statusCode?: number}) => {
            
            if (ctx.whispered) return;
            ctx.whispered = true; // mark as whispered

            //set status code
            if(options?.statusCode) {
                res.statusCode = options.statusCode;
            }

            // check type of the data
            if (typeof data === 'object') {
                // if object then stringify it
                res.setHeader('Content-Type', options?.contextType || 'application/json');
                res.end(JSON.stringify(data));
            } else {

                // otherwise, send it as text
                res.setHeader('Content-Type', options?.contextType || 'text/plain');
                res.end(data);
            }

        }

            // run middleware function one by one
        let index = 0;
        const runMiddleware = () => {
            // Stop processing if the response has already been sent.
            if (ctx.whispered) return;
            if(index < this.middlewares.length) {
                try {
                    this.middlewares[index++](ctx, runMiddleware);
                } catch(err) {
                    console.error("Middleware Error:", err);
                    if (!ctx.whispered) {
                        ctx.whisper!("Internal Server Error", {statusCode: 500});
                    }
                }
            } else {
                //Once all middleware functions are executed, we will handle the route
                if(!ctx.whispered) {
                    this.handleRoute(ctx);
                }
            }
        }

        runMiddleware();

    }

    /**
     * Method to handle route
     * Loops through all routes and check if the request method and path matches the route
     * If match is found then extract dynamic parameters and call the handler
     */

    private handleRoute(ctx: Context) {
        const method = ctx.req.method || '';
        const url = ctx.req.url || '';

        for(const route of this.routes) {
            if(route.method === method) {
                const match = route.regex.exec(url);
                if(match) {
                    //Map each captured group to its paramter name
                    route.keys.forEach((key, index) => {
                        ctx.params![key] = match[index + 1];
                    })

                    //call the route hanlder passing the context
                    return route.handler(ctx);
                }
            }
        }

        // if route is not found then return 404
        ctx.res.statusCode = 404;
        ctx.res.end('404 - Not Found');
    }

    /**
     * start http server on specified port
     */

    serve(port: number, callback?: () => void): void {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        server.listen(port, callback);
    }

}

export default function createYuna() {
    return new Yuna();
}
