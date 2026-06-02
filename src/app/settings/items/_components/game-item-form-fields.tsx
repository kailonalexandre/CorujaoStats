"use client";

import type { Game, GameItemType } from "@prisma/client";
import { useState } from "react";
import type { GameItemFormState } from "@/app/settings/items/actions";
import { gameItemTypeDescriptions, getGameItemTypeLabel } from "@/lib/game-item-labels";

type GameItemFormFieldsProps = {
  games: Game[];
  types: GameItemType[];
  state: GameItemFormState;
  defaultValues?: {
    gameId?: string;
    name?: string;
    type?: GameItemType;
    imageUrl?: string | null;
    active?: boolean;
  };
};

export function GameItemFormFields({
  games,
  types,
  state,
  defaultValues,
}: GameItemFormFieldsProps) {
  const [selectedType, setSelectedType] = useState<GameItemType>(defaultValues?.type ?? "other");
  const selectedGame = games.find((game) => game.id === defaultValues?.gameId) ?? games[0];

  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-100">1. Escolha o jogo</span>
        <span className="text-xs leading-5 text-neutral-500">
          O item vai aparecer nos sorteios e estatisticas desse jogo.
        </span>
        <select
          name="gameId"
          defaultValue={defaultValues?.gameId ?? games[0]?.id ?? ""}
          className="h-12 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.gameId ? (
          <span className="text-xs text-red-300">{state.fieldErrors.gameId[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-100">2. Nome que sera sorteado</span>
        <span className="text-xs leading-5 text-neutral-500">
          Exemplos: Corinthians, Inferno, Sub-Zero, Medico, AK-47.
        </span>
        <input
          name="name"
          defaultValue={defaultValues?.name ?? ""}
          className="h-12 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder={selectedGame?.slug === "pes" ? "Ex: Corinthians" : "Ex: Inferno"}
        />
        {state.fieldErrors?.name ? (
          <span className="text-xs text-red-300">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-100">3. O que esse item representa?</span>
        <span className="text-xs leading-5 text-neutral-500">
          Isso ajuda o sistema a separar times, mapas, personagens e outros grupos.
        </span>
        <select
          name="type"
          defaultValue={defaultValues?.type ?? "other"}
          onChange={(event) => setSelectedType(event.target.value as GameItemType)}
          className="h-12 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {getGameItemTypeLabel(type)}
            </option>
          ))}
        </select>
        <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-neutral-400">
          {gameItemTypeDescriptions[selectedType]}
        </span>
        {state.fieldErrors?.type ? (
          <span className="text-xs text-red-300">{state.fieldErrors.type[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-100">Imagem do item</span>
        <span className="text-xs leading-5 text-neutral-500">
          Opcional. Cole um link de imagem para deixar cards e sorteios mais visuais.
        </span>
        <input
          name="imageUrl"
          defaultValue={defaultValues?.imageUrl ?? ""}
          className="h-12 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="https://site.com/imagem.jpg"
        />
        {state.fieldErrors?.imageUrl ? (
          <span className="text-xs text-red-300">{state.fieldErrors.imageUrl[0]}</span>
        ) : null}
      </label>

      <input type="hidden" name="active" value={defaultValues?.active === false ? "false" : "true"} />
    </div>
  );
}
