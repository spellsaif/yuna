/**
 * This is core file for Yuna. It contains the main class that will be used to create the app.
 */

import http from "http";
import { Context, Middleware, RouteHandler } from "./types";
import { assembleRouter } from "./router";
import { MethodType } from "./enums";
import { RadixTree } from "./helpers";

/**
 * Route type holds method, path, handler and compiled regex for the dynamic route.
 */

export default class Yuna {
    // Array to store middleware functions
    private middlewares: Middleware[] = [];
    
    //Radix Tree to store routes
    private routes = new RadixTree();

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
   * Route Grouping.
   * it helps to organize routes for specific endpoints
   */

    tribe(prefix:string, callback: (router: Yuna) => void) {
        const basePath = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

        // Create a proxy object that extends the current instance (`this`)
        const subRouter = Object.create(this);

        // Override the route methods to prepend the basePath
        subRouter.get = (path: string, handler: RouteHandler) => this.get(`${basePath}${path}`, handler);
        subRouter.post = (path: string, handler: RouteHandler) => this.post(`${basePath}${path}`, handler);
        subRouter.put = (path: string, handler: RouteHandler) => this.put(`${basePath}${path}`, handler);
        subRouter.delete = (path: string, handler: RouteHandler) => this.delete(`${basePath}${path}`, handler);
        subRouter.patch = (path: string, handler: RouteHandler) => this.patch(`${basePath}${path}`, handler);

        // Pass the modified instance to the callback
        callback(subRouter);

    }   


    /**
     * Helper method to add route
     */

    private addRoute(method: string, path: string, handler: RouteHandler) {

        this.routes.insert(
            method,
            path,
            handler
        );
    }

    /**
     * Create unified method to handle all requests
     */

    private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {

        const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
        const query: Record<string, string | string[]> = {};
        parsedUrl.searchParams.forEach((value, key) => {
            if (query[key]) {
                query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key] as string, value];
            } else {
                query[key] = value;
            }
         });

        //Building context object
        const ctx: Context = {
            req,
            res,
            params: {},
            state: {},
            query,
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
        const runMiddleware = async() => {
            // Stop processing if the response has already been sent.
            if (ctx.whispered) return;
            if(index < this.middlewares.length) {
                try {

                    const result: any = this.middlewares[index++](ctx, runMiddleware);
                    if (result instanceof Promise) {
                        await result;
                    }
                } catch(err) {
                    console.error("Middleware Error:", err);
                    if (!ctx.whispered) {
                        ctx.whisper!("Internal Server Error", {statusCode: 500});
                    }
                }
            } else {
                //Once all middleware functions are executed, we will handle the route
                if(!ctx.whispered) {
                    await this.handleRoute(ctx);
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

        const {handler, params} = this.routes.match(method, url);

        if(handler) {
            ctx.params = params;
            return handler(ctx);
        }

        ctx.res.statusCode = 400;
        ctx.res.end("404 - Not Found");


    }

    /**
     * start http server on specified port
     */

    serve(port: number, callback?: () => void): void {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        server.listen(port, callback);
    }

}

