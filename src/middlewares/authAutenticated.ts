import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

import { authConfig } from "@/configs/auth";
import test from "node:test";

type RequestProps = {
  role: string;
  sub: string;
};

export function authAutenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(404).json({ message: "JWT Token undefined." });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(404).json({ message: "JWT Token invalid." });
  }

  const { secret } = authConfig.jwt;
  const { sub: user_id, role } = verify(token, secret) as RequestProps;

  req.user = {
    id: user_id,
    role,
  };

  return next();
}
