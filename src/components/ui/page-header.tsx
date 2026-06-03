type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-neutral-900/85 shadow-sm shadow-black/25">
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-400">{description}</p>
        </div>
        {action ? (
          <div className="shrink-0 [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
