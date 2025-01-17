import { Router } from "express";

import { TeamsController } from "@/controllers/TeamsController";
import { authAutenticated } from "@/middlewares/authAutenticated";
import { userAuthorization } from "@/middlewares/userAuthorization";
import { MembersController } from "@/controllers/MembersController";
import { TasksController } from "@/controllers/TasksController";

export const teamsRoutes = Router();
const teamsController = new TeamsController();
const membersController = new MembersController();
const tasksController = new TasksController();

teamsRoutes.use(authAutenticated);
teamsRoutes.use(userAuthorization(["admin"]));

//Rotas relacionadas ao gerenciamento de times.
teamsRoutes.get("/", teamsController.index);
teamsRoutes.get("/:id", teamsController.show);
teamsRoutes.post("/", teamsController.create);
teamsRoutes.put("/:id", teamsController.update);
teamsRoutes.delete("/:id", teamsController.delete);

// Rotas relacionadas ao gerenciamentos dos membros dos times.
teamsRoutes.get("/:team_id/members", membersController.index);
teamsRoutes.post("/:team_id/members", membersController.create);
teamsRoutes.delete("/:team_id/members", membersController.delete);

// Rotas relacionadas as tarefas do time.
teamsRoutes.post("/:team_id/tasks", tasksController.create);
teamsRoutes.put("/:team_id/tasks/:task_id", tasksController.update);
