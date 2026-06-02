"use client";

import { Ban, CheckCircle2 } from "lucide-react";
import { toggleGameItemActiveAction } from "@/app/settings/items/actions";

type ToggleGameItemActiveButtonProps = {
  itemId: string;
  active: boolean;
};

export function ToggleGameItemActiveButton({ itemId, active }: ToggleGameItemActiveButtonProps) {
  return (
    <form action={toggleGameItemActiveAction}>
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button
        type="submit"
        className={[
          "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
          active
            ? "border-red-400/30 text-red-200 hover:bg-red-500/10"
            : "border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/10",
        ].join(" ")}
      >
        {active ? <Ban size={16} /> : <CheckCircle2 size={16} />}
        {active ? "Desativar" : "Reativar"}
      </button>
    </form>
  );
}
