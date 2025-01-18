import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/prisma";
import { teamAlreadyExists } from "@/utils/teamAlreadyExists";

export class TeamsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      description: z.string().trim().min(3).nullish(),
    });

    const { name, description } = bodySchema.parse(req.body);

    try {
      await teamAlreadyExists(name);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    await prisma.team.create({ data: { name, description } });

    return res.status(201).json({ message: "Team Created! :)" });
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const bodySchema = z.object({
      name: z.string().trim().min(3).nullish(),
      description: z.string().trim().min(3).nullish(),
    });

    const { name, description } = bodySchema.parse(req.body);
    const { id } = paramsSchema.parse(req.params);

    const team = await prisma.team.findFirst({ where: { id } });
    const teamAlreadyExists = await prisma.team.findFirst({
      where: { name: name ?? team?.name },
    });

    if (team?.id !== teamAlreadyExists?.id) {
      return res.status(404).json({ message: "Team name already exists." });
    }

    await prisma.team.update({
      data: {
        name: name ?? team?.name,
        description: description ?? team?.description,
      },
      where: { id },
    });

    return res.status(200).json({ message: "Team updated." });
  }

  async index(req: Request, res: Response) {
    const teams = await prisma.team.findMany({ include: { tasks: true } });

    return res.status(200).json(teams);
  }

  async show(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().trim().uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      return res.status(404).json({ message: "Team not exists." });
    }

    return res.status(200).json(team);
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().trim().uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      return res.status(404).json({ message: "Team not exists." });
    }

    await prisma.team.delete({ where: { id } });

    return res.status(200).json({ message: "Team deleted." });
  }
}
