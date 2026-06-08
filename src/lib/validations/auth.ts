import { z } from "zod";
import { ALL_PERMISSIONS } from "@/lib/auth/permissions";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe a senha."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome."),
    email: z.string().trim().email("Informe um e-mail valido."),
    password: z.string().min(8, "Use pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });

export const userSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres."),
  role: z.enum(["admin", "user"], { error: "Selecione o perfil." }),
  playerId: z.string().trim().optional().transform((value) => value || null),
  active: z.boolean().default(true),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).default([]),
});

export const userIdSchema = z.object({
  id: z.string().trim().min(1, "Usuario invalido."),
});

export const updateUserAccessSchema = z.object({
  id: z.string().trim().min(1, "Usuario invalido."),
  role: z.enum(["admin", "user"], { error: "Selecione o perfil." }),
  playerId: z.string().trim().optional().transform((value) => value || null),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;
