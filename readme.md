# Building a Simple Backend REST API with Yuna.js

Welcome to this guide on how to build a simple REST API using **Yuna.js**—a lightweight, middleware-based framework. In this tutorial, you'll learn how to create your backend API, integrate the anime-inspired **NekoTrace** middleware for stylish logging, and test your endpoints.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Example](#example)

---

## Introduction

Yuna.js is designed to be simple yet powerful by using middleware to handle HTTP requests. One of its strengths is the ability to plug in custom middleware such as **NekoTrace**, which logs requests and responses in a fun, anime-inspired way using colors and emojis.

In this guide, we'll set up a basic API with two endpoints:
- **GET** `/hello` — returns a greeting message.
- **POST** `/data` — accepts JSON data and echoes it back.

---

## Example

```ts import { createApp, Middleware } from "yuna-framework"; // Import the framework
import { Yuna } from "yuna.js";
import { nekoTrace, kamiJson } from "yuna.js/middlewares";    // Import the nekoTrace, kamiJson middlewares

// Create an instance of the app
const app = new Yuna();

// Use NekoTrace middleware for logging.
app.summon(nekoTrace());

//Use kamiJson for parsing json from sent by client
app.summon(kamiJson);

// Define a simple GET endpoint
app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello, world!" });
});

// Define a POST endpoint that echoes back the received JSON data
app.post("/data", (req: Request, res: Response) => {
  const data = req.body;
  res.json({ received: data });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```