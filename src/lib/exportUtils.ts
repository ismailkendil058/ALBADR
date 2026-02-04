import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ExportData {
    [key: string]: any;
}

export const exportToCSV = (data: ExportData[], fileName: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header] ?? '';
                // Escape quotes and wrap in quotes if contains comma
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

export const exportAnalyticsToExcel = (
    sheets: { name: string; data: ExportData[] }[],
    fileName: string
) => {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
        if (sheet.data.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(sheet.data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        }
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, `${fileName}.xlsx`);
};

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

export const formatStatusBreakdown = (breakdown: any) => {
    return [
        { 'Status': 'New', 'Count': breakdown.new },
        { 'Status': 'Confirmed', 'Count': breakdown.confirmed },
        { 'Status': 'Delivered', 'Count': breakdown.delivered },
        { 'Status': 'Returned', 'Count': breakdown.returned },
    ];
};

export const formatDeliveryBreakdown = (delivery: any) => {
    return [
        { 'Type': 'Home Delivery', 'Count': delivery.home },
        { 'Type': 'Bureau Delivery', 'Count': delivery.bureau },
        { 'Type': 'Pickup', 'Count': delivery.pickup },
    ];
};

export const formatStoreBreakdown = (store: any) => {
    return [
        { 'Store': 'Laghouat', 'Count': store.laghouat },
        { 'Store': 'Aflou', 'Count': store.aflou },
    ];
};

export const formatAnalyticsTrends = (timeChartData: any[]) => {
    return timeChartData.map(item => ({
        'Period': item.label,
        'Orders': item.orders,
        'Revenue (DZD)': item.revenue
    }));
};



