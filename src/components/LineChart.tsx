import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

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

const LineChart: React.FC<LineChartProps> = ({ data, height = 200 }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#94a3b8', // text-muted color
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#1c2444', // dark-light color
              titleColor: '#f8fafc', // text-light color
              bodyColor: '#f8fafc' // text-light color
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(75, 85, 99, 0.2)' // dark grid lines
              },
              ticks: {
                color: '#94a3b8' // text-muted color
              }
            },
            y: {
              grid: {
                color: 'rgba(75, 85, 99, 0.2)' // dark grid lines
              },
              ticks: {
                color: '#94a3b8', // text-muted color
                callback: (value) => `$${value}`
              },
              beginAtZero: true
            }
          }
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LineChart;