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

//Rotas relacionadas ao gerenciamento de times.
teamsRoutes.get("/", userAuthorization(["admin"]), teamsController.index);
teamsRoutes.get("/:id", userAuthorization(["admin"]), teamsController.show);
teamsRoutes.post("/", userAuthorization(["admin"]), teamsController.create);
teamsRoutes.put("/:id", userAuthorization(["admin"]), teamsController.update);
teamsRoutes.delete(
  "/:id",
  userAuthorization(["admin"]),
  teamsController.delete
);

// Rotas relacionadas ao gerenciamentos dos membros dos times.
teamsRoutes.get(
  "/:team_id/members",
  userAuthorization(["admin"]),
  membersController.index
);
teamsRoutes.post(
  "/:team_id/members",
  userAuthorization(["admin"]),
  membersController.create
);
teamsRoutes.delete(
  "/:team_id/members",
  userAuthorization(["admin"]),
  membersController.delete
);

// Rotas relacionadas as tarefas do time.
teamsRoutes.post(
  "/:team_id/tasks",
  userAuthorization(["admin"]),
  tasksController.create
);
teamsRoutes.put(
  "/:team_id/tasks/:task_id",
  userAuthorization(["admin"]),
  tasksController.update
);
teamsRoutes.get(
  "/:team_id/tasks",
  userAuthorization(["user", "admin"]),
  tasksController.index
);
