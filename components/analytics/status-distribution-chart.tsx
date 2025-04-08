'use client';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { InvoiceStatus } from '@/types';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface StatusData {
    status: InvoiceStatus;
    label: string;
    value: number;
}

interface StatusDistributionChartProps {
    data: StatusData[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    // Filter out statuses with zero value
    const filteredData = data.filter(item => item.value > 0);

    // Color mapping for each status
    const colorMap = {
        [InvoiceStatus.DRAFT]: 'rgba(107, 114, 128, 0.7)',
        [InvoiceStatus.PENDING]: 'rgba(59, 130, 246, 0.7)',
        [InvoiceStatus.PAID]: 'rgba(16, 185, 129, 0.7)',
        [InvoiceStatus.OVERDUE]: 'rgba(239, 68, 68, 0.7)',
        [InvoiceStatus.CANCELLED]: 'rgba(156, 163, 175, 0.7)',
    };

    const borderColorMap = {
        [InvoiceStatus.DRAFT]: 'rgb(107, 114, 128)',
        [InvoiceStatus.PENDING]: 'rgb(59, 130, 246)',
        [InvoiceStatus.PAID]: 'rgb(16, 185, 129)',
        [InvoiceStatus.OVERDUE]: 'rgb(239, 68, 68)',
        [InvoiceStatus.CANCELLED]: 'rgb(156, 163, 175)',
    };

    const chartData = {
        labels: filteredData.map(item => item.label),
        datasets: [
            {
                data: filteredData.map(item => item.value),
                backgroundColor: filteredData.map(item => colorMap[item.status]),
                borderColor: filteredData.map(item => borderColorMap[item.status]),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: {
                        label: string;
                        parsed: number;
                        dataset: {
                            data: number[];
                        };
                    }) {
                        const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                        const percentage = ((context.parsed * 100) / total).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        },
    };

    // If there's no data or all values are zero
    if (filteredData.length === 0) {
        return (
            <div className="aspect-[4/3] w-full flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    return (
        <div className="aspect-[4/3] w-full">
            <Pie data={chartData} options={options} />
        </div>
    );
}