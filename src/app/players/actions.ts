"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  updatePlayer,
} from "@/lib/db/players";
import { playerIdSchema, playerSchema } from "@/lib/validations/player";

export type PlayerFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    name?: string[];
    nickname?: string[];
    age?: string[];
    photoUrl?: string[];
    coverUrl?: string[];
    photoFile?: string[];
    coverFile?: string[];
  };
};

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function saveImageUpload(value: FormDataEntryValue | null, folder: string) {
  if (!(value instanceof File) || value.size === 0) {
    return { url: undefined as string | undefined };
  }

  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    return { error: "Envie uma imagem JPG, PNG, WebP ou GIF." };
  }

  if (value.size > MAX_IMAGE_SIZE) {
    return { error: "A imagem deve ter no maximo 4 MB." };
  }

  const extension = value.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  const fileName = `${randomUUID()}.${safeExtension}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await value.arrayBuffer()));

  return { url: `/uploads/${folder}/${fileName}` };
}

async function parsePlayerForm(formData: FormData) {
  const photoUpload = await saveImageUpload(formData.get("photoFile"), "players");
  const coverUpload = await saveImageUpload(formData.get("coverFile"), "covers");

  const parsed = playerSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    age: formData.get("age"),
    photoUrl: photoUpload.url || formData.get("photoUrl"),
    coverUrl: coverUpload.url || formData.get("coverUrl"),
  });

  return {
    parsed,
    fileErrors: {
      photoFile: photoUpload.error ? [photoUpload.error] : undefined,
      coverFile: coverUpload.error ? [coverUpload.error] : undefined,
    },
  };
}

export async function createPlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const { parsed, fileErrors } = await parsePlayerForm(formData);
  const hasFileErrors = Boolean(fileErrors.photoFile || fileErrors.coverFile);

  if (!parsed.success || hasFileErrors) {
    return {
      status: "error",
      message: "Revise os campos do jogador.",
      fieldErrors: {
        ...(parsed.success ? {} : parsed.error.flatten().fieldErrors),
        ...fileErrors,
      },
    };
  }

  await createPlayer(parsed.data);
  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");

  return {
    status: "success",
    message: "Jogador cadastrado com sucesso.",
  };
}

export async function updatePlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const parsedId = playerIdSchema.safeParse({
    id: formData.get("id"),
  });
  const { parsed: parsedPlayer, fileErrors } = await parsePlayerForm(formData);
  const hasFileErrors = Boolean(fileErrors.photoFile || fileErrors.coverFile);

  if (!parsedId.success || !parsedPlayer.success || hasFileErrors) {
    return {
      status: "error",
      message: "Revise os campos do jogador.",
      fieldErrors: {
        ...(parsedPlayer.success ? {} : parsedPlayer.error.flatten().fieldErrors),
        ...fileErrors,
      },
    };
  }

  const player = await getPlayerById(parsedId.data.id);

  if (!player) {
    return {
      status: "error",
      message: "Jogador nao encontrado no grupo padrao.",
    };
  }

  await updatePlayer(parsedId.data.id, parsedPlayer.data);
  revalidatePath("/players");
  revalidatePath(`/players/${parsedId.data.id}`);
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");

  return {
    status: "success",
    message: "Jogador atualizado com sucesso.",
  };
}

export async function deletePlayerAction(formData: FormData) {
  const parsed = playerIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return;
  }

  const player = await getPlayerById(parsed.data.id);

  if (!player) {
    return;
  }

  await deletePlayer(parsed.data.id);
  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");
}
