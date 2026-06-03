import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/permissions";
import { signAuthToken } from "@/lib/auth/jwt";
import { AUTH_SESSION_MAX_AGE } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getUserForLogin, updateLastLogin } from "@/lib/db/users";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revise os dados de acesso." }, { status: 400 });
  }

  const user = await getUserForLogin(parsed.data.email);
  const passwordMatches = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches || !user.active) {
    return NextResponse.json({ message: "E-mail ou senha invalidos." }, { status: 401 });
  }

  const token = await signAuthToken(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions.map((item) => item.permission),
    },
    AUTH_SESSION_MAX_AGE,
  );
  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://"),
    maxAge: AUTH_SESSION_MAX_AGE,
    path: "/",
  });

  await updateLastLogin(user.id);

  return response;
}
