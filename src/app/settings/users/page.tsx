import { LockKeyhole, ShieldCheck } from "lucide-react";
import { CreateUserForm } from "@/app/settings/users/_components/create-user-form";
import {
  toggleUserActiveAction,
  updateUserPermissionsAction,
} from "@/app/settings/users/actions";
import { ALL_PERMISSIONS, permissionLabels } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getUsers } from "@/lib/db/users";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function SettingsUsersPage() {
  await requirePermission("manage_users");
  const users = await getUsers();

  return (
    <div>
      <PageHeader
        title="Usuarios e permissoes"
        description="Controle quem acessa o sistema e quais modulos cada usuario pode operar."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <CreateUserForm />

        <section className="grid content-start gap-4">
          {users.length === 0 ? (
            <EmptyState
              title="Nenhum usuario cadastrado"
              description="Rode o seed ou cadastre um administrador para liberar o acesso."
            />
          ) : (
            users.map((user) => (
              <article key={user.id} className="rounded-lg border border-white/10 bg-neutral-900 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-white">{user.name}</h2>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-200">
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </span>
                      <span
                        className={[
                          "rounded-full border px-2 py-1 text-xs font-medium",
                          user.active
                            ? "border-white/10 bg-white/5 text-neutral-300"
                            : "border-red-400/20 bg-red-500/10 text-red-200",
                        ].join(" ")}
                      >
                        {user.active ? "Ativo" : "Bloqueado"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-400">{user.email}</p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Ultimo acesso: {user.lastLoginAt ? user.lastLoginAt.toLocaleString("pt-BR") : "Nunca"}
                    </p>
                  </div>

                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="active" value={String(!user.active)} />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-neutral-200 transition hover:bg-white/8"
                    >
                      {user.active ? <LockKeyhole size={16} /> : <ShieldCheck size={16} />}
                      {user.active ? "Bloquear" : "Ativar"}
                    </button>
                  </form>
                </div>

                <form action={updateUserPermissionsAction} className="mt-5 grid gap-3">
                  <input type="hidden" name="id" value={user.id} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ALL_PERMISSIONS.map((permission) => (
                      <label key={permission} className="flex items-center gap-3 rounded-md border border-white/10 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission}
                          defaultChecked={user.role === "admin" || user.permissions.some((item) => item.permission === permission)}
                          disabled={user.role === "admin"}
                          className="size-4 accent-emerald-400 disabled:opacity-60"
                        />
                        {permissionLabels[permission]}
                      </label>
                    ))}
                  </div>
                  {user.role === "user" ? (
                    <div>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200"
                      >
                        Salvar permissoes
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">
                      Administradores possuem todas as permissoes automaticamente.
                    </p>
                  )}
                </form>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
