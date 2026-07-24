export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}
