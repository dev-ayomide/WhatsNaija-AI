import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-sand-100 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-sand-400" />
      </div>
      <h3 className="text-lg font-semibold text-sand-900 mb-2">{title}</h3>
      <p className="text-sand-600 mb-4 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
