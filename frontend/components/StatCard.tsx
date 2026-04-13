import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = 'text-earth-600',
  iconBg = 'bg-earth-500/10',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-sand-100 hover:shadow-medium transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change && (
          <span className="text-xs font-medium text-forest-600 bg-forest-50 px-2 py-1 rounded-lg">
            {change}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold text-sand-900">{value}</div>
        <p className="text-sm text-sand-600 font-medium">{label}</p>
      </div>
    </div>
  );
}
