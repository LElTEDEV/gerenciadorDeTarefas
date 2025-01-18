import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/prisma";

export class TasksController {
  async create(req: Request, res: Response) {
    const { id: user_id } = req.user;

    const bodySchema = z.object({
      title: z.string().trim().min(3),
      description: z.string().trim().min(3).nullish(),
      status: z
        .enum(["pending", "in_progress", "completed"])
        .default("pending")
        .nullish(),
      priority: z.enum(["low", "medium", "high"]).default("low").nullish(),
    });

    const paramsSchema = z.object({
      team_id: z.string().uuid(),
    });

    const { title, description, status, priority } = bodySchema.parse(req.body);
    const { team_id } = paramsSchema.parse(req.params);

    const team = await prisma.team.findUnique({ where: { id: team_id } });

    if (!team) {
      return res.status(404).json({ message: "Team not exists." });
    }

    const { id: task_id, status: newTaskStatus } = await prisma.task.create({
      data: {
        title,
        description: description ?? "Description empty :(",
        status: status ?? "pending",
        priority: priority ?? "low",
        assigned_to: user_id,
        team_id,
      },
    });

    await prisma.taskHistory.create({
      data: {
        old_status: newTaskStatus,
        new_status: newTaskStatus,
        task_id,
        changed_by: user_id,
      },
    });

    return res.status(201).json({ message: "Task created." });
  }

  async update(req: Request, res: Response) {
    const { id: user_id } = req.user;

    const paramsSchema = z.object({
      team_id: z.string().uuid(),
      task_id: z.string().uuid(),
    });

    const bodySchema = z.object({
      title: z.string().trim().min(3),
      description: z.string().trim().min(3).nullish(),
      status: z
        .enum(["pending", "in_progress", "completed"])
        .default("pending")
        .nullish(),
      priority: z.enum(["low", "medium", "high"]).default("low").nullish(),
    });

    const { task_id } = paramsSchema.parse(req.params);
    const { title, description, status, priority } = bodySchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: task_id } });

    if (!task) {
      return res.status(404).json({ message: "Task not exists." });
    }

    if (task.status === "completed") {
      return res.status(401).json({ message: "Task already completed." });
    }

    await prisma.task.update({
      where: { id: task_id },
      data: {
        title,
        description: description ?? task.description,
        status: status ?? task.status,
        priority: priority ?? task.priority,
      },
    });

    await prisma.taskHistory.create({
      data: {
        old_status: task.status,
        new_status: status ?? task.status,
        task_id,
        changed_by: user_id,
      },
    });

    return res.status(200).json({ message: "Task updated." });
  }

  async index(req: Request, res: Response) {
    const { id: user_id, role } = req.user;

    const paramsSchema = z.object({
      team_id: z.string().uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);
    const userTeam = await prisma.teamMember.findFirst({ where: { user_id } });

    let tasks;

    if (role === "user" && team_id === userTeam?.team_id) {
      tasks = await prisma.task.findMany({ where: { team_id } });
      return res.status(200).json(tasks);
    } else if (role === "admin") {
      tasks = await prisma.task.findMany({ include: { team: true } });
      return res.status(200).json(tasks);
    } else {
      return res.status(404).json({ message: "Unauthorized." });
    }
  }
}
