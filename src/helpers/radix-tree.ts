 
 //RadixTree (Compressed Trie) for handling dynamic routes efficiently.

import { RouteHandler } from "../types";

 class RadixTreeNode {
    children: Map<string, RadixTreeNode> = new Map();
    //storing methods for different handlers
    handlers: Partial<Record<string, RouteHandler>> = {};
    //stores param key for dynamic routes
    paramKey:  string | null = null;
 }

 export default class RadixTree {
    root: RadixTreeNode = new RadixTreeNode();

    insert(method: string, path:string, handler: RouteHandler) {
        let node = this.root;
        const parts = path.split("/").filter(Boolean);

        for (const part of parts) {
            if(part.startsWith(":") ) {
                //Handling Dynamic Routes
                if(!node.paramKey) node.paramKey = part.slice(1);
                if(!node.children.has(":")) node.children.set(":", new RadixTreeNode());
                node = node.children.get(":")!;
            } else {
                //Handling static routes 
                if(!node.children.has(part)) node.children.set(part, new RadixTreeNode());
                node = node.children.get(part)!;
            }
        }

        node.handlers[method] = handler;
    }

    match(method: string, path: string): { handler?: RouteHandler, params: Record<string, string> } {
        let node = this.root;
        const params: Record<string, string> = {};
        const parts = path.split('/').filter(Boolean);
    
        for (const part of parts) {
            if (node.children.has(part)) {
                node = node.children.get(part)!;
            } else {
                // Match dynamic segment (":name")
                let dynamicNode: RadixNode | undefined;
                for (const [key, child] of node.children.entries()) {
                    if (key.startsWith(":")) {  // Dynamic param found
                        dynamicNode = child;
                        
                        if (key.length > 1) { // Ensure key isn't empty
                            const paramKey = key.slice(1); // Remove `:` to get "name"
                            params[paramKey] = part; // Store correctly as { name: 'saif' }
                        }
                        break;
                    }
                }
                if (!dynamicNode) return { handler: undefined, params: {} };
                node = dynamicNode;
            }
        }
    
        return { handler: node.handlers[method], params }; // Ensure correct params
    }
    
    
 }