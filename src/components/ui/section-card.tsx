type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-sm shadow-black/30">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
