import { UsersController } from "@/controllers/UsersController";
import { authAutenticated } from "@/middlewares/authAutenticated";
import { userAuthorization } from "@/middlewares/userAuthorization";
import { Router } from "express";

export const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.get("/", authAutenticated, usersController.index);
usersRoutes.post("/", usersController.create);
usersRoutes.put(
  "/:id",
  authAutenticated,
  userAuthorization(["admin"]),
  usersController.update
);
