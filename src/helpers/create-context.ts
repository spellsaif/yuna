import http from "http";

import { Context } from "../types";
import {parseCookies} from "./parse-cookie";
import { CookieOptions } from "../types";

/**
 * Create a unified context that flattens request properties, 
 * exposes useful response helpers, and adds cookie support.
 */
function createContext(req: http.IncomingMessage, res: http.ServerResponse): Context {
    // Parse the URL for query parameters.
    const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
    
    // Convert query parameters to a plain object.
    const query: Record<string, string> = {};
    parsedUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });
  
    // Parse cookies from the request header.
    const parsedCookies = parseCookies(req.headers.cookie);
  
    // Prepare a placeholder context object (we'll fill in methods shortly).
    const ctx: Partial<Context> = {};
  
    // Define the cookie API.
    const cookies = {
      get: (name: string): string | undefined => {
        return parsedCookies[name];
      },
      set: (name: string, value: string, options?: CookieOptions): void => {
        // Build the cookie string.
        let cookieStr = `${name}=${encodeURIComponent(value)}`;
        if (options?.expires) cookieStr += `; Expires=${options.expires.toUTCString()}`;
        if (options?.path) cookieStr += `; Path=${options.path}`;
        if (options?.domain) cookieStr += `; Domain=${options.domain}`;
        if (options?.secure) cookieStr += `; Secure`;
        if (options?.httpOnly) cookieStr += `; HttpOnly`;
        if (options?.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
        
        // Retrieve any existing Set-Cookie header.
        const existing = res.getHeader("Set-Cookie");
        if (existing) {
          if (Array.isArray(existing)) {
            res.setHeader("Set-Cookie", [...existing, cookieStr]);
          } else {
            res.setHeader("Set-Cookie", [existing as string, cookieStr]);
          }
        } else {
          res.setHeader("Set-Cookie", cookieStr);
        }
      }
    };
  
    // Create the final flattened context.
    const finalCtx: Context = {
      method: req.method || "",
      url: parsedUrl.pathname,
      headers: req.headers,
      query,
      params: {},
      state: {},
      req,
      res,
      cookies,
      
      // Helper method: set the HTTP status code and return ctx for chaining.
      status(code: number) {
        res.statusCode = code;
        return finalCtx;
      },
      // Helper method: set a header.
      set(field: string, value: string) {
        res.setHeader(field, value);
        return finalCtx;
      },
      // Helper method: send JSON response.
      json(data: unknown) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      },
      // Helper method: send plain text response.
      text(data: string) {
        res.setHeader("Content-Type", "text/plain");
        res.end(data);
      },
      // Helper method: automatically choose between json/text.
      messageBack(data: unknown) {
        if (typeof data === "object") {
          finalCtx.json(data);
        } else {
          finalCtx.text(String(data));
        }
      },
      // Helper method: perform a redirect.
      fateShift(url: string, code: number = 302) {
        res.statusCode = code;
        res.setHeader("Location", url);
        res.end();
      }
    };
  
    return finalCtx;
  }
  
  export { createContext };

