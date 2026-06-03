import { z } from "zod";
import { ALL_PERMISSIONS } from "@/lib/auth/permissions";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe a senha."),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres."),
  role: z.enum(["admin", "user"], { error: "Selecione o perfil." }),
  active: z.boolean().default(true),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).default([]),
});

export const userIdSchema = z.object({
  id: z.string().trim().min(1, "Usuario invalido."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
