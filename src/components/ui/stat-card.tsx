type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-sm shadow-black/30">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <div className="mt-4 h-1 rounded-full bg-white/8">
        <div className="h-1 w-10 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}
