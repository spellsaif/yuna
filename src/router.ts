

/**
 * @file router.ts
 * @description dynamic router
 * @version 1.0.0
 */

/**
 * assembleRouter takes a route string (e.g. /products/:id) and converts it to a RegExp.
 * It also extracts the route parameters so we can assigns values later.
 */

export function assembleRouter(route: string): {regex: RegExp, keys: string[]} {
    const keys: string[] = [];

    const regexString = route.replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
    });

    const regex = new RegExp(`^${regexString}$`);

    return {regex, keys};
}

