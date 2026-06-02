type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 rounded-lg border border-white/10 bg-neutral-900/80 p-5 shadow-sm shadow-black/20 sm:flex sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">{description}</p>
      </div>
      {action ? <div className="mt-4 shrink-0 sm:mt-0">{action}</div> : null}
    </header>
  );
}
