"use client";

import { useMemo, useState, useTransition } from "react";
import type { Game, GameItem, GameItemType, Player } from "@prisma/client";
import { CheckCircle2, ClipboardPlus, Loader2 } from "lucide-react";
import { createMatchAction, type MatchFormState } from "@/app/matches/actions";
import { PlayerPhoto } from "@/components/ui/player-photo";

type MatchFormProps = {
  games: Game[];
  players: Player[];
  items: GameItem[];
};

type PlayerDraft = {
  playerId: string;
  selectedItemId?: string;
  mapItemId?: string;
  classItemId?: string;
  teamName?: string;
  result?: "win" | "loss" | "draw";
  score?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  goals?: number;
  knifeKills?: number;
  headshots?: number;
};

const gameLabels: Record<string, string> = {
  pes: "PES",
  "mortal-kombat": "Mortal Kombat",
  "cs-go": "CS:GO",
  "cs-go-cs2": "CS:GO",
  battlefield: "Battlefield",
};

function getItemTypes(slug: string): GameItemType[] {
  if (slug === "pes") return ["team"];
  if (slug === "mortal-kombat") return ["character"];
  if (slug === "cs-go" || slug === "cs-go-cs2") return ["map"];
  if (slug === "battlefield") return ["map", "class"];
  return ["other"];
}

function numberOrUndefined(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

export function MatchForm({ games, players, items }: MatchFormProps) {
  const defaultGameId = games.find((game) => game.slug === "pes")?.id ?? games[0]?.id ?? "";
  const [gameId, setGameId] = useState(defaultGameId);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [message, setMessage] = useState<MatchFormState | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeGame = games.find((game) => game.id === gameId) ?? games[0];
  const activeSlug = activeGame?.slug ?? "";
  const gameItems = useMemo(() => {
    const types = getItemTypes(activeSlug);
    return items.filter((item) => item.gameId === gameId && types.includes(item.type));
  }, [activeSlug, gameId, items]);
  const maps = gameItems.filter((item) => item.type === "map");
  const classes = gameItems.filter((item) => item.type === "class");
  const selectedPlayers = players.filter((player) => selectedPlayerIds.includes(player.id));

  function togglePlayer(playerId: string) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
    setMessage(null);
  }

  function onSubmit(formData: FormData) {
    if (!activeGame) return;

    const mapItemId = formData.get("mapItemId")?.toString() || undefined;
    const drafts: PlayerDraft[] = selectedPlayers.map((player) => {
      const prefix = `player-${player.id}`;

      return {
        playerId: player.id,
        selectedItemId: formData.get(`${prefix}-selectedItemId`)?.toString() || undefined,
        mapItemId,
        classItemId: formData.get(`${prefix}-classItemId`)?.toString() || undefined,
        teamName: formData.get(`${prefix}-teamName`)?.toString() || undefined,
        result: (formData.get(`${prefix}-result`)?.toString() || undefined) as PlayerDraft["result"],
        score: numberOrUndefined(formData.get(`${prefix}-score`)),
        goals: numberOrUndefined(formData.get(`${prefix}-goals`)),
        kills: numberOrUndefined(formData.get(`${prefix}-kills`)),
        deaths: numberOrUndefined(formData.get(`${prefix}-deaths`)),
        assists: numberOrUndefined(formData.get(`${prefix}-assists`)),
        headshots: numberOrUndefined(formData.get(`${prefix}-headshots`)),
        knifeKills: numberOrUndefined(formData.get(`${prefix}-knifeKills`)),
      };
    });

    startTransition(async () => {
      const response = await createMatchAction({
        gameId: activeGame.id,
        gameSlug: activeGame.slug,
        description: formData.get("description")?.toString() || undefined,
        players: drafts,
      });

      setMessage(response);

      if (response.status === "success") {
        setSelectedPlayerIds([]);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-6">
      <section className="rounded-lg border border-white/10 bg-neutral-900 p-5">
        <h2 className="text-base font-semibold text-white">Jogo</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setGameId(game.id);
                setMessage(null);
              }}
              className={[
                "rounded-lg border p-4 text-left transition",
                game.id === gameId
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/8",
              ].join(" ")}
            >
              <span className="font-semibold text-white">{gameLabels[game.slug] ?? game.name}</span>
              <span className="mt-1 block text-sm text-neutral-400">{game.description ?? "Registrar partida"}</span>
            </button>
          ))}
        </div>

        <label className="mt-4 grid gap-2 text-sm">
          <span className="font-medium text-neutral-200">Descricao opcional</span>
          <input
            name="description"
            className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
            placeholder="Ex: rodada de sabado"
          />
        </label>

        {(activeSlug === "cs-go" || activeSlug === "cs-go-cs2" || activeSlug === "battlefield") ? (
          <label className="mt-4 grid gap-2 text-sm">
            <span className="font-medium text-neutral-200">Mapa usado</span>
            <select
              name="mapItemId"
              className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
              defaultValue=""
            >
              <option value="">Selecione um mapa</option>
              {maps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="rounded-lg border border-white/10 bg-neutral-900 p-5">
        <h2 className="text-base font-semibold text-white">Jogadores</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => {
            const selected = selectedPlayerIds.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={[
                  "flex items-center gap-3 rounded-md border p-3 text-left transition",
                  selected
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/8",
                ].join(" ")}
              >
                <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{player.name}</span>
                  <span className="block truncate text-xs text-neutral-500">{player.nickname || "Sem apelido"}</span>
                </span>
                {selected ? <CheckCircle2 size={18} className="text-emerald-300" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-neutral-900 p-5">
        <h2 className="text-base font-semibold text-white">Dados por jogador</h2>
        {selectedPlayers.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">Selecione jogadores para preencher os dados.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {selectedPlayers.map((player) => {
              const prefix = `player-${player.id}`;

              return (
                <div key={player.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="sm" />
                    <h3 className="font-semibold text-white">{player.name}</h3>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {activeSlug === "pes" ? (
                      <>
                        <SelectField name={`${prefix}-selectedItemId`} label="Time usado" items={gameItems} />
                        <NumberField name={`${prefix}-goals`} label="Gols" />
                        <ResultField name={`${prefix}-result`} allowDraw />
                      </>
                    ) : null}

                    {activeSlug === "mortal-kombat" ? (
                      <>
                        <SelectField name={`${prefix}-selectedItemId`} label="Personagem usado" items={gameItems} />
                        <ResultField name={`${prefix}-result`} />
                        <NumberField name={`${prefix}-score`} label="Rounds vencidos" />
                      </>
                    ) : null}

                    {activeSlug === "cs-go" || activeSlug === "cs-go-cs2" ? (
                      <>
                        <TextField name={`${prefix}-teamName`} label="Time" placeholder="Time A" />
                        <ResultField name={`${prefix}-result`} allowDraw />
                        <NumberField name={`${prefix}-kills`} label="Kills" />
                        <NumberField name={`${prefix}-deaths`} label="Deaths" />
                        <NumberField name={`${prefix}-assists`} label="Assists" />
                        <NumberField name={`${prefix}-headshots`} label="Headshots" />
                        <NumberField name={`${prefix}-knifeKills`} label="KnifeKills" />
                      </>
                    ) : null}

                    {activeSlug === "battlefield" ? (
                      <>
                        <SelectField name={`${prefix}-classItemId`} label="Classe usada" items={classes} />
                        <ResultField name={`${prefix}-result`} allowDraw />
                        <NumberField name={`${prefix}-kills`} label="Kills" />
                        <NumberField name={`${prefix}-deaths`} label="Deaths" />
                        <NumberField name={`${prefix}-assists`} label="Assists" />
                        <NumberField name={`${prefix}-score`} label="Score" />
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {message ? (
        <p
          className={[
            "rounded-md px-3 py-2 text-sm",
            message.status === "success"
              ? "bg-emerald-500/10 text-emerald-200"
              : "bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          {message.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 size={17} className="animate-spin" /> : <ClipboardPlus size={17} />}
        Registrar partida
      </button>
    </form>
  );
}

function SelectField({ name, label, items }: { name: string; label: string; items: GameItem[] }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-neutral-200">{label}</span>
      <select
        name={name}
        className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
        defaultValue=""
      >
        <option value="">Selecione</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultField({ name, allowDraw = false }: { name: string; allowDraw?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-neutral-200">Resultado</span>
      <select
        name={name}
        className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition focus:border-emerald-400"
        defaultValue=""
      >
        <option value="">Selecione</option>
        <option value="win">win</option>
        <option value="loss">loss</option>
        {allowDraw ? <option value="draw">draw</option> : null}
      </select>
    </label>
  );
}

function NumberField({ name, label }: { name: string; label: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-neutral-200">{label}</span>
      <input
        name={name}
        type="number"
        min={0}
        step={1}
        className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
      />
    </label>
  );
}

function TextField({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-neutral-200">{label}</span>
      <input
        name={name}
        className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
        placeholder={placeholder}
      />
    </label>
  );
}

