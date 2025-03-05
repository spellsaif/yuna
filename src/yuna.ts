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
    use(middleware: Middleware) {
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
        };

            // run middleware function one by one
        let index = 0;
        const runMiddleware = () => {
            if(index < this.middlewares.length) {
                this.middlewares[index++](ctx, runMiddleware);
            } else {
                //Once all middleware functions are executed, we will handle the route
                this.handleRoute(ctx);
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
