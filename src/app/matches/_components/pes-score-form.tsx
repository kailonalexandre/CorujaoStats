"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  updatePesMatchScoreAction,
  type PesScoreFormState,
} from "@/app/matches/actions";
import type { PesUiMatch } from "@/modules/pes";

type PesScoreFormProps = {
  sessionId: string;
  match: PesUiMatch;
};

const initialState: PesScoreFormState = {
  status: "success",
  message: "",
};

export function PesScoreForm({ sessionId, match }: PesScoreFormProps) {
  const [state, formAction, isPending] = useActionState(updatePesMatchScoreAction, initialState);
  const isKnockout = match.stage !== "group";

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-neutral-900/70 p-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="matchId" value={match.id} />

      <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
        <span>Placar</span>
        <span>Gols</span>
      </div>

      <div className="grid grid-cols-[1fr_72px] items-center gap-3">
        <span className="min-w-0 truncate text-sm font-semibold text-white">{match.player1}</span>
        <input
          name="goals1"
          type="number"
          min={0}
          step={1}
          defaultValue={match.goals1 ?? 0}
          className="h-10 rounded-md border border-white/10 bg-neutral-950 px-2 text-center text-base font-black text-white outline-none transition focus:border-cyan-400"
        />
      </div>

      <div className="grid grid-cols-[1fr_72px] items-center gap-3">
        <span className="min-w-0 truncate text-sm font-semibold text-white">{match.player2}</span>
        <input
          name="goals2"
          type="number"
          min={0}
          step={1}
          defaultValue={match.goals2 ?? 0}
          disabled={match.player2 === "BYE"}
          className="h-10 rounded-md border border-white/10 bg-neutral-950 px-2 text-center text-base font-black text-white outline-none transition disabled:opacity-50 focus:border-cyan-400"
        />
      </div>

      {isKnockout ? (
        <div className="grid min-w-0 grid-cols-1 gap-2 rounded-md border border-amber-400/20 bg-amber-500/[0.04] p-2 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1 text-xs text-neutral-400">
            Penalti 1
            <input
              name="pen1"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={match.pen1 ?? ""}
              className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-neutral-950 px-2 text-center text-sm font-semibold text-white outline-none transition focus:border-amber-400"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs text-neutral-400">
            Penalti 2
            <input
              name="pen2"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={match.pen2 ?? ""}
              disabled={match.player2 === "BYE"}
              className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-neutral-950 px-2 text-center text-sm font-semibold text-white outline-none transition disabled:opacity-50 focus:border-amber-400"
            />
          </label>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || match.player2 === "BYE"}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 text-xs font-bold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Confirmar placar
      </button>

      {state.message ? (
        <p
          className={[
            "rounded-md px-2 py-1 text-xs",
            state.status === "success"
              ? "bg-emerald-500/10 text-emerald-200"
              : "bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
