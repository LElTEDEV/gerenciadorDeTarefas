import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/prisma";

export class MembersController {
  async index(req: Request, res: Response) {
    const paramsSchema = z.object({
      team_id: z.string().uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);

    const teamMembers = await prisma.teamMember.findMany({
      where: { team_id },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tasks: true,
          },
        },
      },
    });

    if (!teamMembers) {
      return res.status(200).json({ message: "Team not exists" });
    }

    return res.status(200).json(teamMembers);
  }

  async create(req: Request, res: Response) {
    const paramsSchema = z.object({
      team_id: z.string().uuid(),
    });

    const bodyParams = z.object({
      user_id: z.string().uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);
    const { user_id } = bodyParams.parse(req.body);

    const team = await prisma.team.findUnique({ where: { id: team_id } });
    const user = await prisma.user.findUnique({ where: { id: user_id } });

    if (!team || !user) {
      return res.status(404).json({ message: "Please confirm the details" });
    }

    const userAlreadyExistsInTeam = await prisma.teamMember.findFirst({
      where: { user_id },
    });

    if (userAlreadyExistsInTeam) {
      return res.status(200).json({ message: "User already add in this team" });
    }

    await prisma.teamMember.create({ data: { user_id, team_id } });

    return res.status(201).json({ message: "User add successful" });
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({
      team_id: z.string().uuid(),
    });

    const bodyParams = z.object({
      user_id: z.string().uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);
    const { user_id } = bodyParams.parse(req.body);

    const team = await prisma.team.findUnique({ where: { id: team_id } });
    const user = await prisma.user.findUnique({ where: { id: user_id } });

    if (!team || !user) {
      return res.status(404).json({ message: "Please confirm the details" });
    }

    const dataTeamMembers = await prisma.teamMember.findFirst({
      where: { user_id, team_id },
    });

    if (!dataTeamMembers) {
      return res.status(404).json({ message: "User not in team" });
    }

    await prisma.teamMember.delete({ where: { id: dataTeamMembers.id } });

    return res.status(200).json({ message: "User removed for team" });
  }
}
