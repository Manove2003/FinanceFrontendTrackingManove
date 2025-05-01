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
declare const StatsCard: React.FC<StatsCardProps>;
export default StatsCard;
