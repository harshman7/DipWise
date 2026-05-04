interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      {description && (
        <p className="max-w-sm text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}
