import "dotenv/config";
import { z } from "zod";

const bodySchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["dev", "test", "production"]).default("production"),
  SECRET: z.string().trim().default("default"),
});

const _env = bodySchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Variables environment error ❌");
  throw new Error("Variables environment error ❌", _env.error);
}

export const env = _env.data;
