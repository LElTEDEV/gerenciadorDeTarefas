import { Request, Response } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "@/prisma";
import { authConfig } from "@/configs/auth";

export class SessionsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "E-mail or password invalid." });
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      return res.status(404).json({ message: "E-mail or password invalid." });
    }

    const { expiresIn, secret } = authConfig.jwt;

    const token = sign(
      {
        role: user.role,
      },
      secret,
      {
        expiresIn,
        subject: user.id,
      }
    );

    return res.status(201).json(token);
  }
}
