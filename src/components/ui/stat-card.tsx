type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex min-h-[148px] flex-col justify-between rounded-lg border border-white/10 bg-neutral-900/85 p-5 shadow-sm shadow-black/30">
      <div>
        <p className="text-sm leading-5 text-neutral-400">{label}</p>
        <p className="mt-3 break-words text-3xl font-semibold tabular-nums text-white">{value}</p>
      </div>
      <div className="mt-5 h-1 rounded-full bg-white/8">
        <div className="h-1 w-12 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}
