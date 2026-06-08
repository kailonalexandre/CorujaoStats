import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, BASIC_USER_PERMISSIONS } from "@/lib/auth/permissions";
import { signAuthToken } from "@/lib/auth/jwt";
import { AUTH_SESSION_MAX_AGE } from "@/lib/auth/session";
import { createUser, updateLastLogin } from "@/lib/db/users";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Revise os dados do cadastro." },
      { status: 400 },
    );
  }

  try {
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "user",
      playerId: null,
      active: true,
      permissions: [...BASIC_USER_PERMISSIONS],
    });
    const token = await signAuthToken(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: [...BASIC_USER_PERMISSIONS],
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
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar a conta. Verifique se o e-mail ja existe." },
      { status: 409 },
    );
  }
}
