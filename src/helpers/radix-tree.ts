 
 //RadixTree (Compressed Trie) for handling dynamic routes efficiently.

import { RouteHandler } from "../types";

class RadixTreeNode {
    // Children are stored in a Map where keys are the literal path segment.
    // We'll reserve the special key ':' for dynamic segments.
    children: Map<string, RadixTreeNode> = new Map();
    // Handlers is a record mapping HTTP methods (GET, POST, etc.) to the route handler.
    handlers: Partial<Record<string, RouteHandler>> = {};
    // If this node is a dynamic segment, store the parameter name (without the colon)
    paramKey: string | null = null;
  }
  
  export default class RadixTree {
    root: RadixTreeNode = new RadixTreeNode();
  
    /**
     * Inserts a new route into the radix tree.
     * If a path segment starts with ':' it is considered dynamic.
     */
    insert(method: string, path: string, handler: RouteHandler) {
      let node = this.root;
      // Split the path into parts and filter out any empty parts.
      const parts = path.split('/').filter(Boolean);
  
      for (const part of parts) {
        if (part.startsWith(':')) {
          // For dynamic segments, we use the special key ':'.
          if (!node.children.has(':')) {
            const dynamicNode = new RadixTreeNode();
            // Store the parameter name without the colon (e.g., "name" for ":name")
            dynamicNode.paramKey = part.substring(1);
            node.children.set(':', dynamicNode);
          }
          node = node.children.get(':')!;
        } else {
          // For static segments, use the segment value as the key.
          if (!node.children.has(part)) {
            node.children.set(part, new RadixTreeNode());
          }
          node = node.children.get(part)!;
        }
      }
      // Finally, assign the handler for this method at the terminal node.
      node.handlers[method] = handler;
    }
  
    /**
     * Matches a given method and path to a route handler.
     * It also extracts dynamic parameters into a params object.
     */
    match(method: string, path: string): { handler?: RouteHandler; params: Record<string, string> } {
      let node = this.root;
      const params: Record<string, string> = {};
      const parts = path.split('/').filter(Boolean);
  
      for (const part of parts) {
        if (node.children.has(part)) {
          // Match a static segment.
          node = node.children.get(part)!;
        } else if (node.children.has(':')) {
          // Otherwise, if a dynamic segment exists, use it.
          node = node.children.get(':')!;
          // Use the stored paramKey to assign the value.
          if (node.paramKey) {
            params[node.paramKey] = part;
          }
        } else {
          // No match found.
          return { handler: undefined, params: {} };
        }
      }
      return { handler: node.handlers[method], params };
    }
  }