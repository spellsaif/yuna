import http from "http";
import { Context, Middleware, RouteHandler } from "./types";
import { MethodType } from "./enums";
import { RadixTree } from "./helpers";

/**
 * Yuna is the core class for creating the app.
 * It registers middleware, routes, and starts the HTTP server.
 */
export default class Yuna {
  // Global middleware functions will run on every request.
  private middlewares: Middleware[] = [];
  // Use a RadixTree to store routes for fast lookup.
  private routes = new RadixTree();

  /**
   * Register a global middleware.
   * @param middleware - The middleware function.
   */
  public summon(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  // ------------------------------
  // Route registration methods
  // ------------------------------

  public get(path: string, handler: RouteHandler): void {
    this.addRoute(MethodType.GET, path, handler);
  }

  public post(path: string, handler: RouteHandler): void {
    this.addRoute(MethodType.POST, path, handler);
  }

  public delete(path: string, handler: RouteHandler): void {
    this.addRoute(MethodType.DELETE, path, handler);
  }

  public put(path: string, handler: RouteHandler): void {
    this.addRoute(MethodType.PUT, path, handler);
  }

  public patch(path: string, handler: RouteHandler): void {
    this.addRoute(MethodType.PATCH, path, handler);
  }

  /**
   * Route grouping: creates a sub-router with a common prefix.
   * @param prefix - The base path to group routes under.
   * @param callback - A function that receives the sub-router.
   */
  public tribe(prefix: string, callback: (router: Yuna) => void): void {
    // Remove trailing slash if present.
    const basePath = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

    // Create a sub-router by making a shallow copy of this instance.
    const subRouter = Object.create(this) as Yuna;

    // Override route methods to prepend the basePath.
    subRouter.get = (path: string, handler: RouteHandler) =>
      this.get(`${basePath}${path}`, handler);
    subRouter.post = (path: string, handler: RouteHandler) =>
      this.post(`${basePath}${path}`, handler);
    subRouter.put = (path: string, handler: RouteHandler) =>
      this.put(`${basePath}${path}`, handler);
    subRouter.delete = (path: string, handler: RouteHandler) =>
      this.delete(`${basePath}${path}`, handler);
    subRouter.patch = (path: string, handler: RouteHandler) =>
      this.patch(`${basePath}${path}`, handler);

    // Let the callback register routes on the sub-router.
    callback(subRouter);
  }

  /**
   * Helper method to add a route to the Radix Tree.
   * @param method - HTTP method.
   * @param path - The route path.
   * @param handler - The handler function.
   */
  private addRoute(method: string, path: string, handler: RouteHandler): void {
    this.routes.insert(method, path, handler);
  }

  // ------------------------------
  // Request Handling Helpers
  // ------------------------------

  /**
   * Build the query object from the URL.
   * @param parsedUrl - The parsed URL.
   * @returns An object mapping query keys to their values.
   */
  private buildQuery(parsedUrl: URL): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};
    parsedUrl.searchParams.forEach((value, key) => {
      if (query[key]) {
        query[key] = Array.isArray(query[key])
          ? [...query[key], value]
          : [query[key] as string, value];
      } else {
        query[key] = value;
      }
    });
    return query;
  }

  /**
   * Create a context for the request.
   * @param req - Incoming HTTP request.
   * @param res - HTTP response.
   * @param query - Parsed query object.
   * @returns A context object.
   */
  private createContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    query: Record<string, string | string[]>
  ): Context {
    const ctx: Context = {
      req,
      res,
      params: {},
      state: {},
      query,
      whispered: false,
      whisper: () => {} // temporary placeholder
    };

    // Attach a custom "whisper" method to handle responses.
    ctx.whisper = (data: string | object, options?: { contextType?: string; statusCode?: number }): void => {
      if (ctx.whispered) return;
      ctx.whispered = true;
      if (options?.statusCode) {
        res.statusCode = options.statusCode;
      }
      if (typeof data === 'object') {
        res.setHeader('Content-Type', options?.contextType || 'application/json');
        res.end(JSON.stringify(data));
      } else {
        res.setHeader('Content-Type', options?.contextType || 'text/plain');
        res.end(data);
      }
    };

    return ctx;
  }

  /**
   * Handles an incoming HTTP request.
   * Parses the URL, builds the context, runs middleware, and finally calls the route handler.
   * @param req - Incoming HTTP request.
   * @param res - HTTP response.
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // Parse the URL.
    const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
    const query = this.buildQuery(parsedUrl);
    // Create the context object.
    const ctx = this.createContext(req, res, query);
    // Execute middleware chain and finally handle the route.
    await this.runMiddlewares(ctx, async () => {
      if (!ctx.whispered) {
        await this.handleRoute(ctx);
      }
    });
  }

  /**
   * Executes all middleware functions in sequence.
   * @param ctx - The current request context.
   * @param finalHandler - Function to call after all middleware is done.
   */
  private async runMiddlewares(ctx: Context, finalHandler: () => Promise<void>): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (ctx.whispered) return;
      if (index < this.middlewares.length) {
        try {
          const middleware = this.middlewares[index++];
          await middleware(ctx, next);
        } catch (err) {
          console.error("Middleware Error:", err);
          if (!ctx.whispered) {
            ctx.whisper!("Internal Server Error", { statusCode: 500 });
          }
        }
      } else {
        // All middleware executed, run the final handler.
        await finalHandler();
      }
    };
    await next();
  }

  /**
   * Matches the request to a route and executes its handler.
   * @param ctx - The current request context.
   */
  private async handleRoute(ctx: Context): Promise<void> {
    const method = ctx.req.method || '';
    const url = ctx.req.url || '';
    // Use the Radix Tree to match the route and extract parameters.
    const { handler, params } = this.routes.match(method, url);
    if (handler) {
      ctx.params = params;
      await handler(ctx);
    } else {
      ctx.res.statusCode = 404;
      ctx.res.end("404 - Not Found");
    }
  }

  /**
   * Start the HTTP server on a specified port.
   * @param port - The port number.
   * @param callback - Optional callback after the server starts.
   */
  public serve(port: number, callback?: () => void): void {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    server.listen(port, callback);
  }
}
