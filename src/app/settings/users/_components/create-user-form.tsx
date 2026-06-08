"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { createUserAction, type UserFormState } from "@/app/settings/users/actions";
import { BASIC_USER_PERMISSIONS, permissionLabels } from "@/lib/auth/permissions";
import type { getPlayersByDefaultGroup } from "@/lib/db/players";

const initialState: UserFormState = {
  status: "idle",
  message: "",
};

type PlayerOption = Awaited<ReturnType<typeof getPlayersByDefaultGroup>>[number];

export function CreateUserForm({ players }: { players: PlayerOption[] }) {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div>
        <h2 className="text-base font-semibold text-white">Novo usuario</h2>
        <p className="mt-1 text-sm leading-6 text-neutral-400">
          Crie uma conta para acessar o painel na VPS.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-neutral-200">
          Nome
        </label>
        <input id="name" name="name" className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white" />
        {state.fieldErrors?.name ? <p className="text-xs text-red-300">{state.fieldErrors.name[0]}</p> : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-200">
          E-mail
        </label>
        <input id="email" name="email" type="email" className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white" />
        {state.fieldErrors?.email ? <p className="text-xs text-red-300">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-200">
          Senha
        </label>
        <input id="password" name="password" type="password" className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white" />
        {state.fieldErrors?.password ? <p className="text-xs text-red-300">{state.fieldErrors.password[0]}</p> : null}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-neutral-200">
          Perfil
        </span>
        <input type="hidden" name="role" value="user" />
        <div className="flex min-h-10 items-center rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-neutral-300">
          Usuario
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="playerId" className="text-sm font-medium text-neutral-200">
          Player vinculado
        </label>
        <select id="playerId" name="playerId" defaultValue="" className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white">
          <option value="">Nenhum player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}{player.nickname ? ` (${player.nickname})` : ""}
            </option>
          ))}
        </select>
        {state.fieldErrors?.playerId ? <p className="text-xs text-red-300">{state.fieldErrors.playerId[0]}</p> : null}
      </div>

      <input type="hidden" name="active" value="true" />

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-neutral-200">Permissoes iniciais</legend>
        <div className="grid gap-2">
          {BASIC_USER_PERMISSIONS.map((permission) => (
            <label key={permission} className="flex items-center gap-3 rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                name="permissions"
                value={permission}
                defaultChecked
                disabled
                className="size-4 accent-emerald-400 disabled:opacity-80"
              />
              {permissionLabels[permission]}
            </label>
          ))}
        </div>
      </fieldset>

      {state.message ? (
        <div
          className={[
            "rounded-md border px-3 py-2 text-sm",
            state.status === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
              : "border-red-400/20 bg-red-500/10 text-red-100",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:opacity-70"
      >
        <UserPlus size={17} />
        Cadastrar usuario
      </button>
    </form>
  );
}
