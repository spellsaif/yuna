# yuna.js

yuna.js is a lightweight, Express-like web framework built with Node.js and TypeScript. It features a unified context for handling HTTP requests/responses, a flexible middleware (or plugin) system using `wield` to register middleware, dynamic routing with automatic parameter and query parsing, and a convenient `reply` method for sending responses.

## Features

- **Unified Context:** Every request comes with a `ctx` object that bundles the HTTP request, response, route parameters (`ctx.params`), query parameters (`ctx.query`), request body (`ctx.body`), and custom state (`ctx.state`).
- **Middleware & Plugin System:** Extend your app with middleware or plugins. Register middleware using the `wield` method.
- **Dynamic Routing:** Define routes with dynamic parameters (e.g. `/about/:name`) that are automatically parsed into `ctx.params`.
- **Query Parsing:** Automatic parsing of URL query strings into `ctx.query` using the WHATWG URL API.
- **Reply Method:** Use `ctx.reply` to easily send plain text or JSON responses with proper header management.
- **TypeScript-Powered:** Fully typed for early error detection and improved development experience.

## Installation

You can install yuna.js via npm:

```bash
npm install yuna.js
