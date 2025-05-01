import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
// Register all Chart.js components
Chart.register(...registerables);
const PieChart = ({ data, height = 200, doughnut = true }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    useEffect(() => {
        if (!chartRef.current)
            return;
        // Destroy existing chart if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            chartInstance.current = new Chart(ctx, {
                type: doughnut ? 'doughnut' : 'pie',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                                }
                            },
                            backgroundColor: '#1c2444', // dark-light color
                            titleColor: '#f8fafc', // text-light color
                            bodyColor: '#f8fafc' // text-light color
                        }
                    },
                    cutout: doughnut ? '70%' : '0%',
                    borderColor: '#121833' // dark color for spacing between segments
                }
            });
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, doughnut]);
    return (_jsx("div", { style: { height: `${height}px`, width: '100%' }, children: _jsx("canvas", { ref: chartRef }) }));
};
export default PieChart;
