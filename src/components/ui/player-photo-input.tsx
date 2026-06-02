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
  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <PlayerPhoto name={name} photoUrl={defaultValue} size="lg" />

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">URL da foto</span>
        <input
          name="photoUrl"
          defaultValue={defaultValue ?? ""}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
          placeholder="https://..."
        />
        {error ? <span className="text-xs text-red-300">{error}</span> : null}
      </label>
    </div>
  );
}
