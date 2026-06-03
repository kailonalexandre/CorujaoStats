function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-neutral-900/85 p-5 shadow-sm shadow-black/25 sm:p-6">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <section
            key={index}
            className="min-h-[148px] rounded-lg border border-white/10 bg-neutral-900/85 p-5 shadow-sm shadow-black/30"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-5 h-9 w-20" />
            <SkeletonBlock className="mt-8 h-1 w-16" />
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-white/10 bg-neutral-900/85 p-5 shadow-sm shadow-black/30">
        <SkeletonBlock className="h-5 w-40" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-md border border-white/10 p-3">
              <SkeletonBlock className="size-11 rounded-full" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="mt-2 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
