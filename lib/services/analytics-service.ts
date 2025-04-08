'use server';

import { getInvoicesCollection, getTransactionsCollection } from '@/lib/db';
import { InvoiceStatus, TransactionStatus } from '@/types';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';

/**
 * Get recent invoice statistics
 */
export async function getInvoiceStats() {
    try {
        const invoicesCollection = await getInvoicesCollection();

        // Get counts by status
        const statusCounts = await invoicesCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        // Calculate total amount by status
        const statusAmounts = await invoicesCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$status', totalAmount: { $sum: '$totalAmount' } } }
        ]).toArray();

        // Format results
        const counts = {
            total: 0,
            [InvoiceStatus.DRAFT]: 0,
            [InvoiceStatus.PENDING]: 0,
            [InvoiceStatus.PAID]: 0,
            [InvoiceStatus.OVERDUE]: 0,
            [InvoiceStatus.CANCELLED]: 0,
        };

        const amounts = {
            total: 0,
            [InvoiceStatus.DRAFT]: 0,
            [InvoiceStatus.PENDING]: 0,
            [InvoiceStatus.PAID]: 0,
            [InvoiceStatus.OVERDUE]: 0,
            [InvoiceStatus.CANCELLED]: 0,
        };

        statusCounts.forEach(item => {
            counts[item._id as InvoiceStatus] = item.count;
            counts.total += item.count;
        });

        statusAmounts.forEach(item => {
            amounts[item._id as InvoiceStatus] = item.totalAmount;
            amounts.total += item.totalAmount;
        });

        return {
            success: true,
            counts,
            amounts,
        };
    } catch (error) {
        console.error('Error getting top clients:', error);
        return { success: false, error: 'Failed to get top clients' };
    }
}

/**
 * Get payment status distribution for charts
 */
export async function getPaymentStatusDistribution() {
    try {
        const invoicesCollection = await getInvoicesCollection();

        // Get counts by status
        const statusCounts = await invoicesCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        // Format data for chart
        const chartData = Object.values(InvoiceStatus).map(status => {
            const matchingData = statusCounts.find(item => item._id === status);

            return {
                status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
                value: matchingData ? matchingData.count : 0,
            };
        });

        return {
            success: true,
            data: chartData,
        };
    } catch (error) {
        console.error('Error getting payment status distribution:', error);
        return { success: false, error: 'Failed to get payment status distribution' };
    }
}

/**
 * Get network distribution for transactions
 */
export async function getNetworkDistribution() {
    try {
        const transactionsCollection = await getTransactionsCollection();

        // Get transactions by network
        const networkData = await transactionsCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            {
                $group: {
                    _id: '$networkId',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        // Format data for chart
        const chartData = networkData.map(item => {
            return {
                networkId: item._id,
                networkName: getChainName(item._id),
                count: item.count,
                totalAmount: item.totalAmount,
            };
        });

        return {
            success: true,
            data: chartData,
        };
    } catch (error) {
        console.error('Error getting network distribution:', error);
        return { success: false, error: 'Failed to get network distribution' };
    }
}

/**
 * Helper function to get chain name from ID
 */
function getChainName(chainId: number): string {
    const chains: Record<number, string> = {
        1: 'Ethereum',
        137: 'Polygon',
        10: 'Optimism',
        42161: 'Arbitrum',
        8453: 'Base',
        56: 'BNB Chain',
        43114: 'Avalanche',
        324: 'zkSync Era',
        100: 'Gnosis Chain',
        1101: 'Polygon zkEVM',
        314: 'Filecoin',
        42220: 'Celo',
        11155111: 'Sepolia',
        534351: 'Scroll Sepolia',
    };

    return chains[chainId] || 'Unknown Chain';
}
/**
 * Get monthly revenue data for charts
 */
export async function getMonthlyRevenueData(monthsBack: number = 6) {
    try {
        const invoicesCollection = await getInvoicesCollection();

        // Get start and end dates
        const endDate = new Date();
        const startDate = subMonths(endDate, monthsBack - 1);

        // Get all months in the range
        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        // Get paid invoices grouped by month
        const paidInvoices = await invoicesCollection.aggregate([
            {
                $match: {
                    // userId: 'user-id', // Uncomment and update when auth is implemented
                    status: InvoiceStatus.PAID,
                    paidAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$paidAt' },
                        month: { $month: '$paidAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        // Format data for chart
        const chartData = months.map(month => {
            const monthStr = format(month, 'MMM yyyy');
            const year = month.getFullYear();
            const monthNum = month.getMonth() + 1;

            const matchingData = paidInvoices.find(
                item => item._id.year === year && item._id.month === monthNum
            );

            return {
                month: monthStr,
                revenue: matchingData ? matchingData.revenue : 0,
                count: matchingData ? matchingData.count : 0,
            };
        });

        return {
            success: true,
            data: chartData,
        };
    } catch (error) {
        console.error('Error getting monthly revenue data:', error);
        return { success: false, error: 'Failed to get monthly revenue data' };
    }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats() {
    try {
        const transactionsCollection = await getTransactionsCollection();

        // Get counts by status
        const statusCounts = await transactionsCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        // Calculate total amount by status
        const statusAmounts = await transactionsCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$status', totalAmount: { $sum: '$amount' } } }
        ]).toArray();

        // Get transactions by network
        const networkCounts = await transactionsCollection.aggregate([
            // { $match: { userId: 'user-id' } }, // Uncomment and update when auth is implemented
            { $group: { _id: '$networkId', count: { $sum: 1 } } }
        ]).toArray();

        // Format results
        const counts = {
            total: 0,
            [TransactionStatus.PENDING]: 0,
            [TransactionStatus.CONFIRMED]: 0,
            [TransactionStatus.FAILED]: 0,
        };

        const amounts = {
            total: 0,
            [TransactionStatus.PENDING]: 0,
            [TransactionStatus.CONFIRMED]: 0,
            [TransactionStatus.FAILED]: 0,
        };

        statusCounts.forEach(item => {
            counts[item._id as TransactionStatus] = item.count;
            counts.total += item.count;
        });

        statusAmounts.forEach(item => {
            amounts[item._id as TransactionStatus] = item.totalAmount;
            amounts.total += item.totalAmount;
        });

        return {
            success: true,
            counts,
            amounts,
            networks: networkCounts.map(item => ({
                networkId: item._id,
                count: item.count,
            })),
        };
    } catch (error) {
        console.error('Error getting transaction stats:', error);
        return { success: false, error: 'Failed to get transaction statistics' };
    }
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(limit: number = 5) {
    try {
        const invoicesCollection = await getInvoicesCollection();

        // Get paid invoices grouped by client
        const topClients = await invoicesCollection.aggregate([
            {
                $match: {
                    // userId: 'user-id', // Uncomment and update when auth is implemented
                    status: InvoiceStatus.PAID,
                }
            },
            {
                $group: {
                    _id: {
                        clientName: '$clientName',
                        clientEmail: '$clientEmail',
                    },
                    totalRevenue: { $sum: '$totalAmount' },
                    invoiceCount: { $sum: 1 },
                    lastInvoiceDate: { $max: '$createdAt' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit }
        ]).toArray();

        // Format data for display
        const clientData = topClients.map(client => ({
            clientName: client._id.clientName,
            clientEmail: client._id.clientEmail,
            totalRevenue: client.totalRevenue,
            invoiceCount: client.invoiceCount,
            lastInvoiceDate: client.lastInvoiceDate,
        }));

        return {
            success: true,
            clients: clientData,
        };
    } catch (error) {
        console.error('Error getting top clients:', error);
        return { success: false, error: 'Failed to get top clients' };
    }
}