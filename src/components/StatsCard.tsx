import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'bg-dark.light',
  className = '',
  trend
}) => {
  return (
    <div className={`card rounded-xl ${color} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold mt-1">
            {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
          </p>
        </div>
        
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-opacity-20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">
              vs last {trend.isPositive ? 'month' : 'period'}
            </span>
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          </div>
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${trend.isPositive ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;