"use client";

import { ImageUp, Upload } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { PlayerPhoto } from "@/components/ui/player-photo";

type PlayerPhotoInputProps = {
  name?: string;
  defaultValue?: string | null;
  error?: string;
};

export function PlayerPhotoInput({
  name = "Jogador",
  defaultValue,
  error,
}: PlayerPhotoInputProps) {
  const [previewUrl, setPreviewUrl] = useState(defaultValue ?? "");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl(defaultValue ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <PlayerPhoto name={name} photoUrl={previewUrl} size="lg" />

      <div className="grid gap-3 text-sm">
        <span className="font-medium text-neutral-200">Foto do jogador</span>
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 bg-neutral-950 px-4 py-5 text-center text-neutral-300 transition hover:border-emerald-400/70 hover:bg-emerald-500/5">
          <Upload size={20} className="text-emerald-300" />
          <span className="text-sm font-medium">Escolher foto do computador</span>
          <span className="text-xs text-neutral-500">JPG, PNG, WebP ou GIF ate 4 MB</span>
          <input
            name="photoFile"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        <input
          name="photoUrl"
          defaultValue={defaultValue ?? ""}
          onChange={(event) => setPreviewUrl(event.target.value)}
          className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="Ou cole uma URL externa"
        />
        {error ? <span className="text-xs text-red-300">{error}</span> : null}
      </div>
    </div>
  );
}

type PlayerCoverInputProps = {
  defaultValue?: string | null;
  error?: string;
};

export function PlayerCoverInput({ defaultValue, error }: PlayerCoverInputProps) {
  const [previewUrl, setPreviewUrl] = useState(defaultValue ?? "");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl(defaultValue ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
      <span className="font-medium text-neutral-200">Capa do perfil</span>
      <label className="relative flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-white/15 bg-neutral-950 px-4 py-5 text-center text-neutral-300 transition hover:border-emerald-400/70 hover:bg-emerald-500/5">
        {previewUrl ? (
          <span
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />
        ) : null}
        <span className="relative grid size-10 place-items-center rounded-md border border-white/10 bg-neutral-900">
          <ImageUp size={19} className="text-emerald-300" />
        </span>
        <span className="relative text-sm font-medium">Escolher capa do computador</span>
        <span className="relative text-xs text-neutral-500">Imagem horizontal funciona melhor</span>
        <input
          name="coverFile"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
      <input
        name="coverUrl"
        defaultValue={defaultValue ?? ""}
        onChange={(event) => setPreviewUrl(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
        placeholder="Ou cole uma URL externa para a capa"
      />
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </div>
  );
}
