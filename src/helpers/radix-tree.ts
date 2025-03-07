 
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

    match(method: string, path: string): {hanlder?: RouteHandler, params: Record<string, string>} {
        let node = this.root;
        const params: Record<string, string> = {};
        const parts = path.split("/").filter(Boolean);

        for (const part of parts) {
            if(node.children.has(part)) {
                node = node.children.get(part)!;
            }else if (node.children.has(":")) {
                node = node.children.get(":")!;
                params[node.paramKey!] = part;
            } else {
                return {hanlder: undefined, params: {}};
            }
        }

        return {hanlder: node.handlers[method], params};
    }
 }