'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlyData {
    month: string;
    revenue: number;
    count: number;
}

interface RevenueChartProps {
    data: MonthlyData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const chartData = {
        labels: data.map(item => item.month),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(item => item.revenue),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
            },
            {
                label: 'Invoices Paid',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(14, 165, 233, 0.5)',
                borderColor: 'rgb(14, 165, 233)',
                borderWidth: 1,
                yAxisID: 'y1',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Revenue ($)',
                },
                ticks: {
                    callback: function (this: any, tickValue: string | number) {
                        if (typeof tickValue === 'number') {
                            return `$${tickValue}`;
                        }
                        return tickValue;
                    },
                },
            },
            y1: {
                beginAtZero: true,
                position: 'right' as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: 'Count',
                },
                ticks: {
                    precision: 0,
                },
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }

                        if (context.datasetIndex === 0) {
                            label += `$${context.parsed.y.toFixed(2)}`;
                        } else {
                            label += context.parsed.y;
                        }

                        return label;
                    }
                }
            }
        },
    };

    return (
        <div className="aspect-[4/3] w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
}