import { prisma } from "@/prisma";

export async function teamAlreadyExists(team: string) {
  const teamExists = await prisma.team.findFirst({ where: { name: team } });

  if (teamExists) {
    throw new Error("Team already Exists");
  }

  return false;
}
