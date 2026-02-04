import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ExportData {
    [key: string]: any;
}

export interface AnalyticsStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByDelivery: {
        home: number;
        bureau: number;
        pickup: number;
    };
    ordersByStore: {
        laghouat: number;
        aflou: number;
    };
    pickupRatio: number;
    deliveryRatio: number;
    confirmedToDeliveredSuccessRate: number;
    deliveredFromConfirmed: number;
    totalConfirmedPotential: number;
    orderStatusBreakdown: {
        new: number;
        confirmed: number;
        delivered: number;
        returned: number;
    };
    returnedFromConfirmed: number;
    totalConfirmedForReturnRatio: number;
}

export interface TimeChartDataPoint {
    label: string;
    orders: number;
    revenue: number;
}

// ============================================================================
// LEGACY EXPORTS (Keep for backward compatibility)
// ============================================================================

export const exportToCSV = (data: ExportData[], fileName: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header] ?? '';
                const stringValue = String(value).replace(/"/g, '""');
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
};

export const exportToExcel = (data: ExportData[], fileName: string, sheetName: string = 'Data') => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, `${fileName}.xlsx`);
};

// ============================================================================
// PROFESSIONAL ANALYTICS EXPORT - REDESIGNED
// ============================================================================

/**
 * Main export function - creates a professional multi-sheet Excel workbook
 */
export const exportAnalyticsToExcel = (
    stats: AnalyticsStats,
    timeChartData: TimeChartDataPoint[],
    dateRange: { from?: Date; to?: Date },
    fileName: string
) => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Executive Summary
    const summarySheet = createExecutiveSummarySheet(stats, dateRange);
    XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Executive Summary');

    // Sheet 2: Time Series Analysis
    if (timeChartData.length > 0) {
        const timeSeriesSheet = createTimeSeriesSheet(timeChartData);
        XLSX.utils.book_append_sheet(workbook, timeSeriesSheet, '📈 Time Series');
    }

    // Sheet 3: Order Status Analysis
    const statusSheet = createOrderStatusSheet(stats);
    XLSX.utils.book_append_sheet(workbook, statusSheet, '📦 Order Status');

    // Sheet 4: Delivery & Logistics
    const deliverySheet = createDeliveryLogisticsSheet(stats);
    XLSX.utils.book_append_sheet(workbook, deliverySheet, '🚚 Delivery & Logistics');

    // Sheet 5: Performance Metrics
    const performanceSheet = createPerformanceMetricsSheet(stats);
    XLSX.utils.book_append_sheet(workbook, performanceSheet, '🎯 Performance');

    // Generate and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(blob, `${fileName}.xlsx`);
};

// ============================================================================
// SHEET CREATORS
// ============================================================================

/**
 * Sheet 1: Executive Summary
 * High-level overview with report metadata and key metrics
 */
function createExecutiveSummarySheet(stats: AnalyticsStats, dateRange: { from?: Date; to?: Date }) {
    const data: ExportData[] = [];

    // Report Header
    data.push({ 'Section': '═══════════════════════════════════════════════════', 'Value': '', 'Notes': '' });
    data.push({ 'Section': 'ANALYTICS DASHBOARD REPORT', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '═══════════════════════════════════════════════════', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '', 'Value': '', 'Notes': '' });

    // Report Metadata
    data.push({ 'Section': '📅 Report Information', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '───────────────────────────────────────────────────', 'Value': '', 'Notes': '' });
    data.push({
        'Section': 'Date Range',
        'Value': dateRange.from && dateRange.to
            ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
            : 'All Time',
        'Notes': ''
    });
    data.push({
        'Section': 'Generated On',
        'Value': format(new Date(), 'MMM dd, yyyy HH:mm'),
        'Notes': ''
    });
    data.push({ 'Section': '', 'Value': '', 'Notes': '' });

    // Key Performance Indicators
    data.push({ 'Section': '💰 Key Performance Indicators', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '───────────────────────────────────────────────────', 'Value': '', 'Notes': '' });
    data.push({
        'Section': 'Total Orders',
        'Value': stats.totalOrders,
        'Notes': 'All orders in selected period'
    });
    data.push({
        'Section': 'Total Revenue',
        'Value': `${stats.totalRevenue.toLocaleString()} DZD`,
        'Notes': 'Excluding canceled orders'
    });
    data.push({
        'Section': 'Average Order Value',
        'Value': `${stats.averageOrderValue.toLocaleString()} DZD`,
        'Notes': 'Revenue ÷ Valid Orders'
    });
    data.push({ 'Section': '', 'Value': '', 'Notes': '' });

    // Success Metrics
    const returnRate = stats.totalConfirmedForReturnRatio > 0
        ? ((stats.returnedFromConfirmed / stats.totalConfirmedForReturnRatio) * 100).toFixed(2)
        : '0.00';

    data.push({ 'Section': '🎯 Success Metrics', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '───────────────────────────────────────────────────', 'Value': '', 'Notes': '' });
    data.push({
        'Section': 'Delivery Success Rate',
        'Value': `${stats.confirmedToDeliveredSuccessRate.toFixed(2)}%`,
        'Notes': `${stats.deliveredFromConfirmed} delivered out of ${stats.totalConfirmedPotential} confirmed`
    });
    data.push({
        'Section': 'Return Rate',
        'Value': `${returnRate}%`,
        'Notes': `${stats.returnedFromConfirmed} returned out of ${stats.totalConfirmedForReturnRatio} confirmed`
    });
    data.push({ 'Section': '', 'Value': '', 'Notes': '' });

    // Operational Efficiency
    data.push({ 'Section': '⚡ Operational Efficiency', 'Value': '', 'Notes': '' });
    data.push({ 'Section': '───────────────────────────────────────────────────', 'Value': '', 'Notes': '' });
    data.push({
        'Section': 'Pickup Orders',
        'Value': `${stats.pickupRatio}%`,
        'Notes': `${stats.ordersByDelivery.pickup} orders`
    });
    data.push({
        'Section': 'Delivery Orders',
        'Value': `${stats.deliveryRatio}%`,
        'Notes': `${stats.ordersByDelivery.home + stats.ordersByDelivery.bureau} orders`
    });

    return XLSX.utils.json_to_sheet(data);
}

/**
 * Sheet 2: Time Series Analysis
 * Trends over time with summary statistics
 */
function createTimeSeriesSheet(timeChartData: TimeChartDataPoint[]) {
    const data: ExportData[] = [];

    // Header
    data.push({ 'Period': '═══════════════════════════════════════════════════', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({ 'Period': 'TIME SERIES ANALYSIS', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({ 'Period': '═══════════════════════════════════════════════════', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({ 'Period': '', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });

    // Calculate summary statistics
    const totalOrders = timeChartData.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue = timeChartData.reduce((sum, d) => sum + d.revenue, 0);
    const avgOrders = totalOrders / timeChartData.length;
    const avgRevenue = totalRevenue / timeChartData.length;

    // Summary
    data.push({ 'Period': '📊 Summary Statistics', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({ 'Period': '───────────────────────────────────────────────────', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({
        'Period': 'Total',
        'Orders': totalOrders,
        'Revenue (DZD)': totalRevenue.toLocaleString(),
        'Avg Order Value (DZD)': totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : '0'
    });
    data.push({
        'Period': 'Daily Average',
        'Orders': Math.round(avgOrders),
        'Revenue (DZD)': Math.round(avgRevenue).toLocaleString(),
        'Avg Order Value (DZD)': ''
    });
    data.push({ 'Period': '', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });

    // Detailed breakdown
    data.push({ 'Period': '📈 Period-by-Period Breakdown', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });
    data.push({ 'Period': '───────────────────────────────────────────────────', 'Orders': '', 'Revenue (DZD)': '', 'Avg Order Value (DZD)': '' });

    timeChartData.forEach(item => {
        data.push({
            'Period': item.label,
            'Orders': item.orders,
            'Revenue (DZD)': item.revenue.toLocaleString(),
            'Avg Order Value (DZD)': item.orders > 0 ? Math.round(item.revenue / item.orders).toLocaleString() : '0'
        });
    });

    return XLSX.utils.json_to_sheet(data);
}

/**
 * Sheet 3: Order Status Analysis
 * Complete breakdown of order statuses with percentages
 */
function createOrderStatusSheet(stats: AnalyticsStats) {
    const data: ExportData[] = [];
    const breakdown = stats.orderStatusBreakdown;
    const total = stats.totalOrders;

    // Header
    data.push({ 'Status': '═══════════════════════════════════════════════════', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': 'ORDER STATUS ANALYSIS', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': '═══════════════════════════════════════════════════', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Overall Summary
    data.push({ 'Status': '📦 Overall Summary', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({
        'Status': 'Total Orders',
        'Count': total,
        'Percentage': '100.00%',
        'Notes': 'All orders in period'
    });
    data.push({ 'Status': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Status Breakdown
    data.push({ 'Status': '📋 Status Distribution', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });

    const statuses = [
        { name: 'New Orders', value: breakdown.new, note: 'Awaiting confirmation' },
        { name: 'Confirmed', value: breakdown.confirmed, note: 'Ready for delivery' },
        { name: 'Delivered', value: breakdown.delivered, note: 'Successfully completed' },
        { name: 'Returned', value: breakdown.returned, note: 'Customer returns' }
    ];

    statuses.forEach(status => {
        const percentage = total > 0 ? ((status.value / total) * 100).toFixed(2) : '0.00';
        data.push({
            'Status': status.name,
            'Count': status.value,
            'Percentage': `${percentage}%`,
            'Notes': status.note
        });
    });

    data.push({ 'Status': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Conversion Funnel
    data.push({ 'Status': '🔄 Conversion Funnel', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Status': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });

    const confirmedOrders = breakdown.confirmed + breakdown.delivered + breakdown.returned;
    const deliveredOrders = breakdown.delivered;
    const confirmationRate = total > 0 ? ((confirmedOrders / total) * 100).toFixed(2) : '0.00';
    const deliveryRate = confirmedOrders > 0 ? ((deliveredOrders / confirmedOrders) * 100).toFixed(2) : '0.00';

    data.push({
        'Status': 'Confirmation Rate',
        'Count': confirmedOrders,
        'Percentage': `${confirmationRate}%`,
        'Notes': 'Orders that moved beyond "New" status'
    });
    data.push({
        'Status': 'Delivery Success Rate',
        'Count': deliveredOrders,
        'Percentage': `${deliveryRate}%`,
        'Notes': 'Confirmed orders successfully delivered'
    });

    return XLSX.utils.json_to_sheet(data);
}

/**
 * Sheet 4: Delivery & Logistics
 * Delivery types and store performance
 */
function createDeliveryLogisticsSheet(stats: AnalyticsStats) {
    const data: ExportData[] = [];
    const total = stats.totalOrders;

    // Header
    data.push({ 'Category': '═══════════════════════════════════════════════════', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': 'DELIVERY & LOGISTICS ANALYSIS', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': '═══════════════════════════════════════════════════', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Delivery Type Distribution
    data.push({ 'Category': '🚚 Delivery Type Distribution', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });

    const deliveryTypes = [
        { name: 'Home Delivery', value: stats.ordersByDelivery.home, note: 'Delivered to customer address' },
        { name: 'Bureau Delivery', value: stats.ordersByDelivery.bureau, note: 'Delivered to office/bureau' },
        { name: 'Pickup', value: stats.ordersByDelivery.pickup, note: 'Customer pickup from store' }
    ];

    deliveryTypes.forEach(type => {
        const percentage = total > 0 ? ((type.value / total) * 100).toFixed(2) : '0.00';
        data.push({
            'Category': type.name,
            'Count': type.value,
            'Percentage': `${percentage}%`,
            'Notes': type.note
        });
    });

    data.push({ 'Category': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Store Performance
    data.push({ 'Category': '🏪 Store Performance', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });

    const stores = [
        { name: 'Laghouat Store', value: stats.ordersByStore.laghouat },
        { name: 'Aflou Store', value: stats.ordersByStore.aflou }
    ];

    stores.forEach(store => {
        const percentage = total > 0 ? ((store.value / total) * 100).toFixed(2) : '0.00';
        data.push({
            'Category': store.name,
            'Count': store.value,
            'Percentage': `${percentage}%`,
            'Notes': `Orders fulfilled from ${store.name}`
        });
    });

    data.push({ 'Category': '', 'Count': '', 'Percentage': '', 'Notes': '' });

    // Logistics Summary
    data.push({ 'Category': '📊 Logistics Summary', 'Count': '', 'Percentage': '', 'Notes': '' });
    data.push({ 'Category': '───────────────────────────────────────────────────', 'Count': '', 'Percentage': '', 'Notes': '' });

    const totalDeliveries = stats.ordersByDelivery.home + stats.ordersByDelivery.bureau;
    data.push({
        'Category': 'Total Deliveries',
        'Count': totalDeliveries,
        'Percentage': `${stats.deliveryRatio}%`,
        'Notes': 'Requires delivery logistics'
    });
    data.push({
        'Category': 'Total Pickups',
        'Count': stats.ordersByDelivery.pickup,
        'Percentage': `${stats.pickupRatio}%`,
        'Notes': 'No delivery required'
    });

    return XLSX.utils.json_to_sheet(data);
}

/**
 * Sheet 5: Performance Metrics
 * Success rates, return analysis, and efficiency indicators
 */
function createPerformanceMetricsSheet(stats: AnalyticsStats) {
    const data: ExportData[] = [];

    // Header
    data.push({ 'Metric': '═══════════════════════════════════════════════════', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': 'PERFORMANCE METRICS', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '═══════════════════════════════════════════════════', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '', 'Value': '', 'Calculation': '', 'Insight': '' });

    // Revenue Metrics
    data.push({ 'Metric': '💰 Revenue Metrics', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '───────────────────────────────────────────────────', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({
        'Metric': 'Total Revenue',
        'Value': `${stats.totalRevenue.toLocaleString()} DZD`,
        'Calculation': 'Sum of all valid order subtotals',
        'Insight': 'Excludes canceled orders, includes return adjustments'
    });
    data.push({
        'Metric': 'Average Order Value',
        'Value': `${stats.averageOrderValue.toLocaleString()} DZD`,
        'Calculation': 'Total Revenue ÷ Valid Orders',
        'Insight': 'Average revenue per completed order'
    });
    data.push({ 'Metric': '', 'Value': '', 'Calculation': '', 'Insight': '' });

    // Success Metrics
    const returnRate = stats.totalConfirmedForReturnRatio > 0
        ? ((stats.returnedFromConfirmed / stats.totalConfirmedForReturnRatio) * 100).toFixed(2)
        : '0.00';

    data.push({ 'Metric': '🎯 Success Metrics', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '───────────────────────────────────────────────────', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({
        'Metric': 'Delivery Success Rate',
        'Value': `${stats.confirmedToDeliveredSuccessRate.toFixed(2)}%`,
        'Calculation': `${stats.deliveredFromConfirmed} delivered ÷ ${stats.totalConfirmedPotential} confirmed`,
        'Insight': stats.confirmedToDeliveredSuccessRate >= 80 ? 'Excellent performance' : 'Room for improvement'
    });
    data.push({
        'Metric': 'Return Rate',
        'Value': `${returnRate}%`,
        'Calculation': `${stats.returnedFromConfirmed} returned ÷ ${stats.totalConfirmedForReturnRatio} confirmed`,
        'Insight': parseFloat(returnRate) <= 10 ? 'Low return rate - good' : 'High return rate - investigate'
    });
    data.push({ 'Metric': '', 'Value': '', 'Calculation': '', 'Insight': '' });

    // Efficiency Metrics
    data.push({ 'Metric': '⚡ Efficiency Metrics', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '───────────────────────────────────────────────────', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({
        'Metric': 'Pickup Ratio',
        'Value': `${stats.pickupRatio}%`,
        'Calculation': `${stats.ordersByDelivery.pickup} pickups ÷ ${stats.totalOrders} total`,
        'Insight': 'Lower delivery costs, higher customer convenience'
    });
    data.push({
        'Metric': 'Delivery Ratio',
        'Value': `${stats.deliveryRatio}%`,
        'Calculation': `${stats.ordersByDelivery.home + stats.ordersByDelivery.bureau} deliveries ÷ ${stats.totalOrders} total`,
        'Insight': 'Requires logistics and delivery resources'
    });
    data.push({ 'Metric': '', 'Value': '', 'Calculation': '', 'Insight': '' });

    // Order Volume Metrics
    data.push({ 'Metric': '📦 Order Volume Metrics', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({ 'Metric': '───────────────────────────────────────────────────', 'Value': '', 'Calculation': '', 'Insight': '' });
    data.push({
        'Metric': 'Total Orders',
        'Value': stats.totalOrders,
        'Calculation': 'All orders in selected period',
        'Insight': 'Includes all statuses except canceled'
    });
    data.push({
        'Metric': 'New Orders',
        'Value': stats.orderStatusBreakdown.new,
        'Calculation': 'Orders awaiting confirmation',
        'Insight': 'Pending action from team'
    });
    data.push({
        'Metric': 'Confirmed Orders',
        'Value': stats.orderStatusBreakdown.confirmed,
        'Calculation': 'Orders ready for delivery',
        'Insight': 'In progress'
    });
    data.push({
        'Metric': 'Delivered Orders',
        'Value': stats.orderStatusBreakdown.delivered,
        'Calculation': 'Successfully completed orders',
        'Insight': 'Revenue realized'
    });

    return XLSX.utils.json_to_sheet(data);
}

// ============================================================================
// LEGACY FORMATTERS (Deprecated - kept for backward compatibility)
// ============================================================================

/** @deprecated Use exportAnalyticsToExcel instead */
export const formatAnalyticsSummary = (stats: any) => {
    const returnRatio = stats.totalConfirmedForReturnRatio > 0
        ? ((stats.returnedFromConfirmed / stats.totalConfirmedForReturnRatio) * 100).toFixed(2)
        : '0.00';

    return [
        { 'Metric': 'High-Level Overview', 'Value': '' },
        { 'Metric': 'Total Orders', 'Value': stats.totalOrders },
        { 'Metric': 'Total Revenue (DZD)', 'Value': stats.totalRevenue },
        { 'Metric': 'Average Order Value (DZD)', 'Value': stats.averageOrderValue },
        { 'Metric': 'Confirmed to Delivered Success Rate (%)', 'Value': stats.confirmedToDeliveredSuccessRate.toFixed(2) },
        { 'Metric': 'Confirmed to Returns Ratio (%)', 'Value': returnRatio },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Efficiency Metrics', 'Value': '' },
        { 'Metric': 'Pickup Ratio (%)', 'Value': stats.pickupRatio },
        { 'Metric': 'Delivery Ratio (%)', 'Value': stats.deliveryRatio },
    ];
};

/** @deprecated Use exportAnalyticsToExcel instead */
export const formatStatusBreakdown = (breakdown: any) => {
    return [
        { 'Status': 'New', 'Count': breakdown.new },
        { 'Status': 'Confirmed', 'Count': breakdown.confirmed },
        { 'Status': 'Delivered', 'Count': breakdown.delivered },
        { 'Status': 'Returned', 'Count': breakdown.returned },
    ];
};

/** @deprecated Use exportAnalyticsToExcel instead */
export const formatDeliveryBreakdown = (delivery: any) => {
    return [
        { 'Type': 'Home Delivery', 'Count': delivery.home },
        { 'Type': 'Bureau Delivery', 'Count': delivery.bureau },
        { 'Type': 'Pickup', 'Count': delivery.pickup },
    ];
};

/** @deprecated Use exportAnalyticsToExcel instead */
export const formatStoreBreakdown = (store: any) => {
    return [
        { 'Store': 'Laghouat', 'Count': store.laghouat },
        { 'Store': 'Aflou', 'Count': store.aflou },
    ];
};

/** @deprecated Use exportAnalyticsToExcel instead */
export const formatAnalyticsTrends = (timeChartData: any[]) => {
    return timeChartData.map(item => ({
        'Period': item.label,
        'Orders': item.orders,
        'Revenue (DZD)': item.revenue
    }));
};



