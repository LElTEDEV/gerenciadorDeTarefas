import { Request, Response } from "express";
import { string, z } from "zod";
import { hash } from "bcryptjs";

import { prisma } from "@/prisma";

export class UsersController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.string().trim().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "member"]).nullish().default("member"),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(404).json({ message: "E-mail already exists." });
    }

    const password_hash = await hash(password, 6);

    await prisma.user.create({
      data: {
        name,
        email,
        password: password_hash,
      },
    });

    return res.status(201).json();
  }

  async index(req: Request, res: Response) {
    const { id, role } = req.user;

    let users;

    if (role === "user") {
      users = await prisma.user.findUnique({
        where: { id },
      });

      const team = await prisma.teamMember.findFirst({
        where: { user_id: id },
      });

      console.log(team);

      const tasks = await prisma.task.findMany({
        where: { team_id: team?.team_id },
      });

      return res.status(200).json({ users, tasks });
    }

    users = await prisma.user.findMany({ include: { tasks: true } });

    return res.status(200).json(users);
  }

  async update(req: Request, res: Response) {
    const paramSchema = z.object({
      id: string().uuid(),
    });

    const bodySchema = z.object({
      name: z.string().min(3),
      email: z.string().trim().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "user"]).nullish().default("user"),
    });

    const { id } = paramSchema.parse(req.params);
    const { name, email, password, role } = bodySchema.parse(req.body);

    const emailAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailAlreadyExists?.id !== id) {
      return res.status(404).json({ message: "E-mail already exists." });
    }

    const password_hash = await hash(password, 6);

    await prisma.user.update({
      data: { name, email, password: password_hash, role },
      where: { id },
    });

    return res.status(200).json({ message: "User updated." });
  }
}
