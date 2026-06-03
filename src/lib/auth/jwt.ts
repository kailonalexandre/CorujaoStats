import type { UserPermissionType, UserRole } from "@prisma/client";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermissionType[];
  exp: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_JWT_SECRET precisa estar configurado em producao.");
  }

  return "development-only-change-me";
}

export async function signAuthToken(payload: Omit<AuthTokenPayload, "exp">, maxAgeSeconds: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const unsigned = [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify({ ...payload, exp })),
  ].join(".");
  const signature = await crypto.subtle.sign("HMAC", await importKey(getJwtSecret()), encoder.encode(unsigned));

  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyAuthToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = Uint8Array.from(
    atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/").padEnd(encodedSignature.length + ((4 - (encodedSignature.length % 4)) % 4), "=")),
    (character) => character.charCodeAt(0),
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    await importKey(getJwtSecret()),
    signature,
    encoder.encode(unsigned),
  );

  if (!isValid) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
