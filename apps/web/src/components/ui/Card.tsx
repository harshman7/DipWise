import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Subtle lift + shadow on hover (use on dashboard-style panels). */
  interactive?: boolean;
}

export default function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        interactive &&
          "transition-all duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
