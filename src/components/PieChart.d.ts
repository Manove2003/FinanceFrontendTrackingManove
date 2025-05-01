import React from 'react';
interface PieChartProps {
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
            borderColor?: string[];
            borderWidth?: number;
        }[];
    };
    height?: number;
    width?: number;
    doughnut?: boolean;
}
declare const PieChart: React.FC<PieChartProps>;
export default PieChart;
