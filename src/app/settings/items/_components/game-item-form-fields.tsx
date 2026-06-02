import type { Game, GameItemType } from "@prisma/client";
import type { GameItemFormState } from "@/app/settings/items/actions";

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
  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Jogo</span>
        <select
          name="gameId"
          defaultValue={defaultValues?.gameId ?? games[0]?.id ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
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
        <span className="font-medium text-neutral-200">Nome do item</span>
        <input
          name="name"
          defaultValue={defaultValues?.name ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="Ex: Inferno"
        />
        {state.fieldErrors?.name ? (
          <span className="text-xs text-red-300">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Tipo</span>
        <select
          name="type"
          defaultValue={defaultValues?.type ?? "other"}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {state.fieldErrors?.type ? (
          <span className="text-xs text-red-300">{state.fieldErrors.type[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">URL da imagem</span>
        <input
          name="imageUrl"
          defaultValue={defaultValues?.imageUrl ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="https://..."
        />
        {state.fieldErrors?.imageUrl ? (
          <span className="text-xs text-red-300">{state.fieldErrors.imageUrl[0]}</span>
        ) : null}
      </label>

      <input type="hidden" name="active" value={defaultValues?.active === false ? "false" : "true"} />
    </div>
  );
}
