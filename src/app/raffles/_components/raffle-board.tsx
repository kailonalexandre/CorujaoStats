"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { GameItemType } from "@prisma/client";
import { CheckCircle2, Dices, Layers2, Loader2, Save, Trophy, Users } from "lucide-react";
import {
  createPesRaffleAction,
  saveRaffleHistoryAction,
  type SaveRaffleHistoryState,
} from "@/app/raffles/actions";
import { PlayerPhoto } from "@/components/ui/player-photo";
import type { SaveRaffleHistoryInput } from "@/lib/validations/raffle";

type Player = {
  id: string;
  name: string;
  nickname: string | null;
  photoUrl: string | null;
};

type Game = {
  id: string;
  name: string;
  slug: string;
};

type GameItem = {
  id: string;
  gameId: string;
  name: string;
  type: GameItemType;
  groupName: string | null;
  imageUrl: string | null;
};

type RaffleBoardProps = {
  players: Player[];
  games: Game[];
  items: GameItem[];
};

type Assignment = {
  player: Player;
  item?: GameItem;
  teamName?: string;
};

type RaffleResult =
  | {
      mode: "individual";
      game: Game;
      assignments: Assignment[];
      selectedTypes?: GameItemType[];
    }
  | {
      mode: "teams";
      game: Game;
      map: GameItem;
      teamA: Assignment[];
      teamB: Assignment[];
    };

const gameRules: Record<
  string,
  {
    title: string;
    itemTypes: GameItemType[];
    mode: "individual" | "teams";
    availableLabel: string;
    shortageLabel: string;
  }
> = {
  pes: {
    title: "PES",
    itemTypes: ["team"],
    mode: "individual",
    availableLabel: "times ativos",
    shortageLabel: "times ativos",
  },
  "mortal-kombat": {
    title: "Mortal Kombat",
    itemTypes: ["character"],
    mode: "individual",
    availableLabel: "personagens ativos",
    shortageLabel: "personagens ativos",
  },
  "cs-go": {
    title: "CS:GO",
    itemTypes: ["map"],
    mode: "teams",
    availableLabel: "mapas ativos",
    shortageLabel: "mapas ativos",
  },
  "cs-go-cs2": {
    title: "CS:GO",
    itemTypes: ["map"],
    mode: "teams",
    availableLabel: "mapas ativos",
    shortageLabel: "mapas ativos",
  },
  battlefield: {
    title: "Battlefield",
    itemTypes: ["map", "class", "weapon", "other"],
    mode: "individual",
    availableLabel: "itens ativos",
    shortageLabel: "itens ativos",
  },
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getGameRule(slug: string) {
  return (
    gameRules[slug] ?? {
      title: slug,
      itemTypes: ["other"],
      mode: "individual" as const,
      availableLabel: "itens ativos",
      shortageLabel: "itens ativos",
    }
  );
}

function typeLabel(type: GameItemType) {
  const labels: Record<GameItemType, string> = {
    team: "time",
    character: "personagem",
    map: "mapa",
    class: "classe",
    weapon: "arma",
    other: "item",
  };

  return labels[type];
}

function getPesTeamGroupName(item: GameItem) {
  return item.groupName?.trim() || "Sem grupo";
}

function buildHistoryPayload(result: RaffleResult): SaveRaffleHistoryInput {
  if (result.mode === "teams") {
    return {
      entries: [
        ...result.teamA.map((assignment) => ({
          gameId: result.game.id,
          playerId: assignment.player.id,
          itemId: result.map.id,
          groupName: "Time A",
        })),
        ...result.teamB.map((assignment) => ({
          gameId: result.game.id,
          playerId: assignment.player.id,
          itemId: result.map.id,
          groupName: "Time B",
        })),
      ],
    };
  }

  return {
    entries: result.assignments.map((assignment) => ({
      gameId: result.game.id,
      playerId: assignment.player.id,
      itemId: assignment.item?.id,
      groupName: assignment.teamName,
    })),
  };
}

function PesAssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-950/55 px-3 py-2 transition hover:border-emerald-400/30">
      <div className="flex min-w-0 items-center gap-3">
        <PlayerPhoto
          name={assignment.player.name}
          photoUrl={assignment.player.photoUrl}
          size="sm"
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">
            {assignment.player.name}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {assignment.player.nickname || "Sem apelido"}
          </span>
        </span>
      </div>
      <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
        {assignment.item?.name ?? assignment.teamName ?? "Sem time"}
      </span>
    </div>
  );
}

function PesAssignments({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {assignments.map((assignment) => (
        <PesAssignmentCard key={assignment.player.id} assignment={assignment} />
      ))}
    </div>
  );
}

export function RaffleBoard({ players, games, items }: RaffleBoardProps) {
  const defaultGameId = games.find((game) => game.slug === "pes")?.id ?? games[0]?.id ?? "";
  const [activeGameId, setActiveGameId] = useState(defaultGameId);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [battlefieldTypes, setBattlefieldTypes] = useState<GameItemType[]>([
    "map",
    "class",
    "weapon",
    "other",
  ]);
  const [pesNumberOfGroups, setPesNumberOfGroups] = useState(2);
  const [selectedPesTeamGroups, setSelectedPesTeamGroups] = useState<string[]>([]);
  const [result, setResult] = useState<RaffleResult | null>(null);
  const [message, setMessage] = useState<SaveRaffleHistoryState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDrawingPending, startDrawingTransition] = useTransition();

  const activeGame = games.find((game) => game.id === activeGameId) ?? games[0];
  const activeRule = activeGame ? getGameRule(activeGame.slug) : null;
  const activeItemTypes =
    activeGame?.slug === "battlefield" && activeRule ? battlefieldTypes : activeRule?.itemTypes;
  const pesTeamGroups = useMemo(() => {
    if (activeGame?.slug !== "pes") {
      return [];
    }

    const groups = items
      .filter((item) => item.gameId === activeGame.id && item.type === "team")
      .reduce<Map<string, number>>((accumulator, item) => {
        const groupName = getPesTeamGroupName(item);
        accumulator.set(groupName, (accumulator.get(groupName) ?? 0) + 1);
        return accumulator;
      }, new Map());

    return Array.from(groups.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [activeGame, items]);
  const selectedPesTeamGroupNames = useMemo(() => {
    const availableGroupNames = pesTeamGroups.map((group) => group.name);
    const validSelection = selectedPesTeamGroups.filter((groupName) =>
      availableGroupNames.includes(groupName),
    );

    return validSelection.length > 0 ? validSelection : availableGroupNames;
  }, [pesTeamGroups, selectedPesTeamGroups]);

  const activeItems = useMemo(() => {
    if (!activeGame || !activeRule) {
      return [];
    }

    return items.filter((item) => {
      const matchesGameAndType =
        item.gameId === activeGame.id && (activeItemTypes ?? []).includes(item.type);

      if (!matchesGameAndType) {
        return false;
      }

      if (activeGame.slug !== "pes" || item.type !== "team" || pesTeamGroups.length === 0) {
        return true;
      }

      return selectedPesTeamGroupNames.includes(getPesTeamGroupName(item));
    });
  }, [activeGame, activeItemTypes, activeRule, items, pesTeamGroups.length, selectedPesTeamGroupNames]);
  const selectedPlayers = players.filter((player) => selectedPlayerIds.includes(player.id));
  const canSaveResult = Boolean(result) && !isPending;

  function togglePlayer(playerId: string) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
    setMessage(null);
  }

  function togglePesTeamGroup(groupName: string) {
    const availableGroupNames = pesTeamGroups.map((group) => group.name);

    setSelectedPesTeamGroups((current) => {
      if (current.length === 0) {
        return [groupName];
      }

      const nextSelection = current.includes(groupName)
        ? current.filter((selectedGroupName) => selectedGroupName !== groupName)
        : [...current, groupName];

      return nextSelection.length === availableGroupNames.length ? [] : nextSelection;
    });
    setResult(null);
    setMessage(null);
  }

  function runRaffle() {
    setMessage(null);

    if (!activeGame || !activeRule) {
      setMessage({ status: "error", message: "Selecione um jogo para sortear." });
      return;
    }

    if (selectedPlayers.length === 0) {
      setMessage({ status: "error", message: "Selecione pelo menos um jogador." });
      return;
    }

    if (activeGame.slug === "battlefield" && battlefieldTypes.length === 0) {
      setMessage({
        status: "error",
        message: "Selecione pelo menos um tipo de item para sortear no Battlefield.",
      });
      return;
    }

    if (activeGame.slug === "pes") {
      if (!Number.isInteger(pesNumberOfGroups) || pesNumberOfGroups < 1) {
        setMessage({ status: "error", message: "Informe uma quantidade valida de grupos para o PES." });
        return;
      }

      if (selectedPlayers.length < pesNumberOfGroups) {
        setMessage({
          status: "error",
          message: "A quantidade de grupos nao pode ser maior que a quantidade de jogadores.",
        });
        return;
      }
    }

    if ((activeGame.slug === "cs-go" || activeGame.slug === "cs-go-cs2") && selectedPlayers.length < 2) {
      setMessage({
        status: "error",
        message: "Selecione pelo menos 2 jogadores para dividir Time A e Time B no CS:GO.",
      });
      return;
    }

    if (activeItems.length === 0) {
      setMessage({
        status: "error",
        message:
          activeGame.slug === "pes"
            ? "Nao ha times ativos cadastrados para PES. Cadastre ou reative times em Configuracoes."
            : activeGame.slug === "mortal-kombat"
              ? "Nao ha personagens ativos cadastrados para Mortal Kombat. Cadastre ou reative personagens em Configuracoes."
              : activeGame.slug === "cs-go" || activeGame.slug === "cs-go-cs2"
                ? "Nao ha mapas ativos cadastrados para CS:GO. Cadastre ou reative mapas em Configuracoes."
                : activeGame.slug === "battlefield"
                  ? "Nao ha itens ativos do tipo selecionado para Battlefield. Cadastre, reative ou selecione outros tipos."
            : `Nao ha ${activeRule.availableLabel} cadastrados para este jogo.`,
      });
      return;
    }

    if (activeRule.mode === "teams") {
      const shuffledPlayers = shuffle(selectedPlayers);
      const [map] = shuffle(activeItems);
      const teamA = shuffledPlayers
        .filter((_, index) => index % 2 === 0)
        .map((player) => ({ player, item: map, teamName: "Time A" }));
      const teamB = shuffledPlayers
        .filter((_, index) => index % 2 === 1)
        .map((player) => ({ player, item: map, teamName: "Time B" }));

      setResult({
        mode: "teams",
        game: activeGame,
        map,
        teamA,
        teamB,
      });
      return;
    }

    if (activeItems.length < selectedPlayers.length) {
      setMessage({
        status: "error",
        message:
          activeGame.slug === "pes"
            ? `PES tem ${activeItems.length} times ativos para ${selectedPlayers.length} jogadores. Reduza os participantes ou cadastre mais times para sortear sem repetir.`
            : activeGame.slug === "mortal-kombat"
              ? `Mortal Kombat tem ${activeItems.length} personagens ativos para ${selectedPlayers.length} jogadores. Reduza os participantes ou cadastre mais personagens para sortear sem repetir.`
              : activeGame.slug === "battlefield"
                ? `Battlefield tem ${activeItems.length} itens ativos nos tipos selecionados para ${selectedPlayers.length} jogadores. Reduza os participantes, cadastre mais itens ou selecione mais tipos.`
            : `Nao ha ${activeRule.shortageLabel} suficientes para sortear sem repetir.`,
      });
      return;
    }

    if (activeGame.slug === "pes") {
      startDrawingTransition(async () => {
        const response = await createPesRaffleAction({
          playerIds: selectedPlayers.map((player) => player.id),
          numberOfGroups: pesNumberOfGroups,
          teamGroups: pesTeamGroups.length > 0 ? selectedPesTeamGroupNames : undefined,
        });

        setMessage({
          status: response.status,
          message: response.message,
        });

        if (response.status !== "success" || !response.game) {
          return;
        }

        setResult({
          mode: "individual",
          game: activeGame,
          selectedTypes: activeItemTypes,
          assignments: response.game.groupData.flatMap((group) =>
            group.players.map((player) => ({
              player: {
                id: player.id,
                name: player.name,
                nickname: player.nickname ?? null,
                photoUrl: player.photoUrl ?? null,
              },
              item: activeItems.find((item) => item.id === player.teamId),
              teamName: player.teamName ?? undefined,
            })),
          ),
        });
      });
      return;
    }

    const shuffledItems = shuffle(activeItems);

    setResult({
      mode: "individual",
      game: activeGame,
      selectedTypes: activeItemTypes,
      assignments: shuffle(selectedPlayers).map((player, index) => ({
        player,
        item: shuffledItems[index],
      })),
    });
  }

  function saveResult() {
    if (!result) {
      setMessage({ status: "error", message: "Realize um sorteio antes de salvar." });
      return;
    }

    startTransition(async () => {
      const response = await saveRaffleHistoryAction(buildHistoryPayload(result));
      setMessage(response);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => {
          const rule = getGameRule(game.slug);
          const gameItemCount = items.filter(
            (item) => item.gameId === game.id && rule.itemTypes.includes(item.type),
          ).length;
          const selected = activeGame?.id === game.id;

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setActiveGameId(game.id);
                setResult(null);
                setMessage(null);
              }}
              className={[
                "group min-h-32 rounded-lg border p-4 text-left transition",
                selected
                  ? "border-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-950/30"
                  : "border-white/10 bg-neutral-900/85 hover:border-white/25 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-base font-semibold text-white">{rule.title}</span>
                  <span className="mt-2 block text-sm text-neutral-400">
                    {rule.mode === "teams" ? "Times e mapa" : "Sorteio individual"}
                  </span>
                </span>
                <span
                  className={[
                    "rounded-md px-2 py-1 text-xs font-semibold",
                    selected ? "bg-emerald-500 text-neutral-950" : "bg-white/8 text-neutral-300",
                  ].join(" ")}
                >
                  {gameItemCount}
                </span>
              </span>
              {game.slug === "pes" ? (
                <span className="mt-3 block text-xs text-emerald-200">
                  Gera grupos e confrontos
                </span>
              ) : null}
              {game.slug === "mortal-kombat" ? (
                <span className="mt-3 block text-xs text-emerald-200">
                  Personagens ativos do banco
                </span>
              ) : null}
              {game.slug === "cs-go" || game.slug === "cs-go-cs2" ? (
                <span className="mt-3 block text-xs text-emerald-200">
                  Times equilibrados e mapa ativo
                </span>
              ) : null}
              {game.slug === "battlefield" ? (
                <span className="mt-3 block text-xs text-emerald-200">
                  Mapas, classes, armas e outros
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-sm shadow-black/30">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Participantes</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Selecione os jogadores que entram no sorteio.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-300">
              <Users size={15} />
              {selectedPlayers.length}/{players.length}
            </span>
          </div>

          {activeGame?.slug === "battlefield" && activeRule ? (
            <div className="mb-5 rounded-lg border border-white/10 bg-neutral-950/55 p-4">
              <h3 className="text-sm font-semibold text-white">Tipos para Battlefield</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Escolha quais tipos configurados no banco entram neste sorteio.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeRule.itemTypes.map((type) => {
                  const selected = battlefieldTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setBattlefieldTypes((current) =>
                          selected ? current.filter((itemType) => itemType !== type) : [...current, type],
                        );
                        setResult(null);
                        setMessage(null);
                      }}
                      className={[
                        "h-8 rounded-md px-3 text-xs font-semibold transition",
                        selected
                          ? "bg-emerald-500 text-neutral-950"
                          : "bg-white/8 text-neutral-300 hover:bg-white/12",
                      ].join(" ")}
                    >
                      {typeLabel(type)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeGame?.slug === "pes" && pesTeamGroups.length > 0 ? (
            <div className="mb-5 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.04] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Layers2 size={16} className="text-emerald-300" />
                    Grupos de times do PES
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Marque as ligas que podem aparecer neste sorteio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPesTeamGroups([]);
                    setResult(null);
                    setMessage(null);
                  }}
                  className="h-8 rounded-md border border-emerald-400/30 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/10"
                >
                  Todos
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {pesTeamGroups.map((group) => {
                  const selected = selectedPesTeamGroupNames.includes(group.name);

                  return (
                    <button
                      key={group.name}
                      type="button"
                      onClick={() => togglePesTeamGroup(group.name)}
                      className={[
                        "flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs transition",
                        selected
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-neutral-950/60 text-neutral-300 hover:bg-white/8",
                      ].join(" ")}
                    >
                      <span className="font-semibold">{group.name}</span>
                      <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] text-neutral-300">
                        {group.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeGame?.slug === "pes" ? (
            <div className="mb-5 rounded-lg border border-white/10 bg-neutral-950/55 p-4">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-white">Quantidade de grupos</span>
                <span className="text-xs leading-5 text-neutral-500">
                  O sorteio cria as chaves, a classificacao e os confrontos em Partidas.
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, selectedPlayers.length)}
                  step={1}
                  value={pesNumberOfGroups}
                  onChange={(event) => {
                    setPesNumberOfGroups(Number(event.target.value));
                    setResult(null);
                    setMessage(null);
                  }}
                  className="h-11 rounded-md border border-white/10 bg-neutral-900 px-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>
          ) : null}

          {players.length === 0 ? (
            <p className="text-sm text-neutral-400">Cadastre jogadores antes de sortear.</p>
          ) : (
            <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
              {players.map((player) => {
                const selected = selectedPlayerIds.includes(player.id);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player.id)}
                    className={[
                      "flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left transition",
                      selected
                        ? "border-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-950/30"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/8",
                    ].join(" ")}
                  >
                    <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{player.name}</span>
                      <span className="block truncate text-xs text-neutral-500">
                        {player.nickname || "Sem apelido"}
                      </span>
                    </span>
                    {selected ? <CheckCircle2 size={18} className="text-emerald-300" /> : null}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={runRaffle}
              disabled={isDrawingPending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
            >
              {isDrawingPending ? <Loader2 size={17} className="animate-spin" /> : <Dices size={17} />}
              Sortear
            </button>
            <button
              type="button"
              onClick={saveResult}
              disabled={!canSaveResult}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
            >
              {isPending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Salvar historico
            </button>
          </div>

          {message ? (
            <p
              className={[
                "mt-4 rounded-md px-3 py-2 text-sm",
                message.status === "success"
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "bg-red-500/10 text-red-200",
              ].join(" ")}
            >
              {message.message}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-sm shadow-black/30">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Resultado</h2>
              <p className="mt-1 text-sm text-neutral-400">
                {activeGame && activeRule
                  ? `${activeGame.name}: ${activeItems.length} ${activeRule.availableLabel} disponiveis`
                  : "Selecione um jogo para iniciar."}
              </p>
            </div>
            {activeRule ? (
              <span className="w-fit rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-xs uppercase text-neutral-400">
                {(activeItemTypes ?? activeRule.itemTypes).map(typeLabel).join(", ")}
              </span>
            ) : null}
          </div>

          {!result ? (
            <div className="rounded-lg border border-dashed border-white/12 bg-neutral-950/60 p-8 text-center">
              <h3 className="text-lg font-semibold text-white">Nenhum sorteio realizado</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-400">
                Selecione jogadores, confira os itens ativos do banco e clique em sortear.
              </p>
            </div>
          ) : result.mode === "teams" ? (
            <div className="grid gap-4">
              <div className="rounded-md bg-white/[0.04] p-4">
                <p className="text-xs uppercase text-neutral-500">Mapa sorteado do banco</p>
                <p className="mt-2 text-2xl font-semibold text-white">{result.map.name}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  ["Time A", result.teamA],
                  ["Time B", result.teamB],
                ].map(([teamName, assignments]) => (
                  <div key={teamName as string} className="rounded-md bg-white/[0.04] p-4">
                    <h3 className="text-base font-semibold text-white">{teamName as string}</h3>
                    <div className="mt-3 grid gap-3">
                      {(assignments as Assignment[]).map((assignment) => (
                        <div key={assignment.player.id} className="flex items-center gap-3">
                          <PlayerPhoto
                            name={assignment.player.name}
                            photoUrl={assignment.player.photoUrl}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-white">{assignment.player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : result.game.slug === "pes" ? (
            <div className="grid gap-4">
              <div className="flex flex-col gap-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-emerald-500 text-neutral-950">
                    <Trophy size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Fase de grupos criada</h3>
                    <p className="text-xs text-emerald-100/80">
                      Abra Partidas para preencher placares.
                    </p>
                  </div>
                </div>
                <Link
                  href="/matches"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-xs font-semibold text-neutral-950 transition hover:bg-emerald-100"
                >
                  Abrir Partidas
                </Link>
              </div>
              <PesAssignments assignments={result.assignments} />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {result.assignments.map((assignment) => (
                <div
                  key={assignment.player.id}
                  className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <PlayerPhoto
                      name={assignment.player.name}
                      photoUrl={assignment.player.photoUrl}
                      size="sm"
                    />
                    <span className="truncate text-sm font-medium text-white">{assignment.player.name}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-200">
                    {activeGame?.slug === "mortal-kombat"
                      ? `Personagem: ${assignment.item?.name}`
                      : activeGame?.slug === "battlefield"
                        ? `${typeLabel(assignment.item?.type ?? "other")}: ${assignment.item?.name}`
                      : assignment.item?.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

