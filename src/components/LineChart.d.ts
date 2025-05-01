import React from 'react';
interface LineChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor: string;
            backgroundColor: string;
            fill?: boolean;
            tension?: number;
        }[];
    };
    height?: number;
    width?: number;
}
declare const LineChart: React.FC<LineChartProps>;
export default LineChart;
