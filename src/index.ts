import "express-async-errors";

import express, { NextFunction, Request, Response } from "express";
import { env } from "./env";
import { routes } from "./routes";

const app = express();
app.use(express.json());

app.use(routes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json(error.message);
});

app.listen(env.PORT, () => console.log("HTTP Server running! 🚀"));
