import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-neutral-950/60 p-8 text-center">
      <span className="mx-auto mb-4 grid size-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-400">
        <Inbox size={21} />
      </span>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-400">{description}</p>
    </div>
  );
}
