import type { PlayerFormState } from "@/app/players/actions";
import { PlayerPhotoInput } from "@/components/ui/player-photo-input";

type PlayerFormFieldsProps = {
  state: PlayerFormState;
  defaultValues?: {
    name?: string;
    nickname?: string | null;
    photoUrl?: string | null;
  };
};

export function PlayerFormFields({ state, defaultValues }: PlayerFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Nome</span>
        <input
          name="name"
          defaultValue={defaultValues?.name ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="Ex: Kyle"
        />
        {state.fieldErrors?.name ? (
          <span className="text-xs text-red-300">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Apelido</span>
        <input
          name="nickname"
          defaultValue={defaultValues?.nickname ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="Ex: Kylao"
        />
        {state.fieldErrors?.nickname ? (
          <span className="text-xs text-red-300">{state.fieldErrors.nickname[0]}</span>
        ) : null}
      </label>

      <PlayerPhotoInput
        name={defaultValues?.name || "Jogador"}
        defaultValue={defaultValues?.photoUrl}
        error={state.fieldErrors?.photoUrl?.[0]}
      />
    </div>
  );
}
