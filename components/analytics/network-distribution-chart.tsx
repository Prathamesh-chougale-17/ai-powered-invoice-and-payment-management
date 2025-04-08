'use client';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    Title
);

interface NetworkData {
    networkId: number;
    networkName: string;
    count: number;
    totalAmount: number;
}

interface NetworkDistributionChartProps {
    data: NetworkData[];
}

export function NetworkDistributionChart({ data }: NetworkDistributionChartProps) {
    // Custom color palette for networks
    const backgroundColors = [
        'rgba(99, 102, 241, 0.7)',  // Indigo
        'rgba(236, 72, 153, 0.7)',  // Pink
        'rgba(14, 165, 233, 0.7)',  // Sky
        'rgba(16, 185, 129, 0.7)',  // Emerald
        'rgba(245, 158, 11, 0.7)',  // Amber
        'rgba(124, 58, 237, 0.7)',  // Violet
        'rgba(239, 68, 68, 0.7)',   // Red
        'rgba(234, 88, 12, 0.7)',   // Orange
        'rgba(5, 150, 105, 0.7)',   // Green
        'rgba(6, 182, 212, 0.7)',   // Cyan
        'rgba(79, 70, 229, 0.7)',   // Indigo darker
        'rgba(219, 39, 119, 0.7)',  // Pink darker
    ];

    const borderColors = [
        'rgb(99, 102, 241)',
        'rgb(236, 72, 153)',
        'rgb(14, 165, 233)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(124, 58, 237)',
        'rgb(239, 68, 68)',
        'rgb(234, 88, 12)',
        'rgb(5, 150, 105)',
        'rgb(6, 182, 212)',
        'rgb(79, 70, 229)',
        'rgb(219, 39, 119)',
    ];

    const chartData = {
        labels: data.map(item => item.networkName),
        datasets: [
            {
                label: 'Transaction Count',
                data: data.map(item => item.count),
                backgroundColor: data.map((_, index) => backgroundColors[index % backgroundColors.length]),
                borderColor: data.map((_, index) => borderColors[index % borderColors.length]),
                borderWidth: 1,
            },
            {
                label: 'Total Amount',
                data: data.map(item => item.totalAmount),
                backgroundColor: 'rgba(107, 114, 128, 0.7)',
                borderColor: 'rgb(107, 114, 128)',
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
                    text: 'Count',
                },
                ticks: {
                    precision: 0,
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
                    text: 'Amount ($)',
                },
                ticks: {
                    callback: function (this: any, tickValue: string | number, index: number, ticks: any[]) {
                        const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                        return `$${value}`;
                    },
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
                            label += context.parsed.y;
                        } else {
                            label += `$${context.parsed.y.toFixed(2)}`;
                        }

                        return label;
                    }
                }
            }
        },
    };

    // If there's no data
    if (data.length === 0) {
        return (
            <div className="aspect-[4/3] w-full flex items-center justify-center">
                <p className="text-muted-foreground">No network data available</p>
            </div>
        );
    }

    return (
        <div className="aspect-[4/3] w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
}