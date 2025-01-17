import { Request, Response, NextFunction } from "express";

export function userAuthorization(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user!;

    if (!roles.includes(role)) {
      return res.status(404).json({ message: "Unauthorized" });
    }

    return next();
  };
}
