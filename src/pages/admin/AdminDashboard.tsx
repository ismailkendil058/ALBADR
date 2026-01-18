import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Truck,
  Package as PackageIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useOrdersByDateRange } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { format, subDays, startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getHours } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  LabelList,
} from 'recharts';

type TimeRange = 'day' | '7d' | 'month';

const CHART_COLORS = {
  primary: 'hsl(220, 70%, 50%)',
  secondary: 'hsl(160, 60%, 45%)',
  tertiary: 'hsl(30, 80%, 55%)',
  quaternary: 'hsl(280, 65%, 60%)',
  quinary: 'hsl(340, 75%, 55%)',
};

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { from, to } = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return { from: startOfDay(date || now), to: endOfDay(date || now) };
      case '7d':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      default:
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    }
  }, [timeRange, date]);

  const { data: filteredOrders = [], isLoading: ordersLoading } = useOrdersByDateRange(from, to);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  
    // Calculate general statistics
  
    const stats = useMemo(() => {
  
      const validOrders = filteredOrders.filter(o => o.status !== 'canceled');
  
      const totalOrders = filteredOrders.length;
  
      const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
  
      const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  
  
  
      const ordersByDelivery = {
  
        home: filteredOrders.filter(o => o.delivery_type === 'home').length,
  
        bureau: filteredOrders.filter(o => o.delivery_type === 'bureau').length,
  
        pickup: filteredOrders.filter(o => o.delivery_type === 'pickup').length,
  
      };
  
  
  
      const ordersByStore = {
  
        laghouat: filteredOrders.filter(o => o.send_from_store === 'laghouat').length,
  
        aflou: filteredOrders.filter(o => o.send_from_store === 'aflou').length,
  
      };
  
  
  
      const deliveryOrders = ordersByDelivery.home + ordersByDelivery.bureau;
  
      const pickupRatio = totalOrders > 0 ? Math.round((ordersByDelivery.pickup / totalOrders) * 100) : 0;
  
      const deliveryRatio = totalOrders > 0 ? Math.round((deliveryOrders / totalOrders) * 100) : 0;
  
  
  
      return {
  
        totalOrders,
  
        totalRevenue,
  
        averageOrderValue,
  
        ordersByDelivery,
  
        ordersByStore,
  
        pickupRatio,
  
        deliveryRatio,
  
      };
  
    }, [filteredOrders]);
  
  
  
    // Chart data for revenue and orders over time
  
    const timeChartData = useMemo(() => {
  
      const validOrders = filteredOrders.filter(o => o.status !== 'canceled');
  
      
  
      if (timeRange === 'day') {
  
        // Aggregate by hour
  
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  
          label: `${String(i).padStart(2, '0')}:00`,
  
          orders: 0,
  
          revenue: 0,
  
        }));
  
  
  
        validOrders.forEach(order => {
  
          const hour = getHours(parseISO(order.created_at));
  
          hourlyData[hour].orders += 1;
  
          hourlyData[hour].revenue += Number(order.total);
  
        });
  
        return hourlyData;
  
  
  
      } else {
  
        // Aggregate by day
  
        const days = eachDayOfInterval({ start: from, end: to });
  
        return days.map(day => {
  
          const dayOrders = validOrders.filter(o => isSameDay(parseISO(o.created_at), day));
  
          return {
  
            label: format(day, 'MMM dd'),
  
            orders: dayOrders.length,
  
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
  
          };
  
        });
  
      }
  
    }, [filteredOrders, timeRange, from, to]);
  
  
  
  
  
    // Chart data for pies and bars
  
    const deliveryPieData = [
  
      { name: 'Home', value: stats.ordersByDelivery.home, color: CHART_COLORS.primary },
  
      { name: 'Bureau', value: stats.ordersByDelivery.bureau, color: CHART_COLORS.secondary },
  
      { name: 'Pickup', value: stats.ordersByDelivery.pickup, color: CHART_COLORS.tertiary },
  
    ].filter(d => d.value > 0);
  
  
  
    const storePieData = [
  
      { name: 'Laghouat', value: stats.ordersByStore.laghouat, color: CHART_COLORS.primary },
  
      { name: 'Aflou', value: stats.ordersByStore.aflou, color: CHART_COLORS.tertiary },
  
    ].filter(d => d.value > 0);
  
  
  
    const isLoading = ordersLoading || productsLoading;
  
  
  
  
  
    const formatIntervalLabel = () => {
  
      if (timeRange === 'day') return format(date || new Date(), 'MMMM dd, yyyy');
  
      return `${format(from, 'MMM dd, yyyy')} - ${format(to, 'MMM dd, yyyy')}`;
  
    };
  
  
  
    return (
  
      <div className="space-y-8 ltr" dir="ltr">
  
        {/* Header with Time Selector */}
  
        <div className="flex flex-col gap-6">
  
          <div>
  
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics Overview</h1>
  
            <p className="text-muted-foreground text-sm mt-1">{formatIntervalLabel()}</p>
  
          </div>
  
  
  
          {/* Time Interval Selector */}
  
          <div className="flex flex-wrap items-center gap-3">
  
            <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 gap-1">
  
              <Button
  
                size="sm"
  
                variant={timeRange === '7d' ? 'default' : 'ghost'}
  
                onClick={() => setTimeRange('7d')}
  
                className="text-sm px-4"
  
              >
  
                7 Days
  
              </Button>
  
              <Button
  
                size="sm"
  
                variant={timeRange === 'month' ? 'default' : 'ghost'}
  
                onClick={() => setTimeRange('month')}
  
                className="text-sm px-4"
  
              >
  
                Month
  
              </Button>
  
            </div>
  
            <Popover>
  
              <PopoverTrigger asChild>
  
                <Button
  
                  variant={timeRange === 'day' ? 'default' : 'outline'}
  
                  className="w-[280px] justify-start text-left font-normal"
  
                >
  
                  <CalendarIcon className="mr-2 h-4 w-4" />
  
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
  
                </Button>
  
              </PopoverTrigger>
  
              <PopoverContent className="w-auto p-0">
  
                <Calendar
  
                  mode="single"
  
                  selected={date}
  
                  onSelect={(newDate) => {
  
                    setDate(newDate);
  
                    setTimeRange('day');
  
                  }}
  
                  initialFocus
  
                />
  
              </PopoverContent>
  
            </Popover>
  
          </div>
  
        </div>
  
  
  
        {/* KPI Cards */}
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  
          <KPICard
  
            title="Total Orders"
  
            value={stats.totalOrders}
  
            icon={ShoppingCart}
  
            loading={isLoading}
  
          />
  
          <KPICard
  
            title="Total Revenue"
  
            value={`${stats.totalRevenue.toLocaleString()} DZD`}
  
            icon={DollarSign}
  
            loading={isLoading}
  
          />
  
          <KPICard
  
            title="Average Order Value"
  
            value={`${stats.averageOrderValue.toLocaleString()} DZD`}
  
            icon={TrendingUp}
  
            loading={isLoading}
  
          />
  
          <KPICard
  
            title="Pickup / Delivery"
  
            value={`${stats.pickupRatio}% / ${stats.deliveryRatio}%`}
  
            icon={Truck}
  
            loading={isLoading}
  
            subtitle="Pickup vs Delivery ratio"
  
          />
  
        </div>
  
  
  
        {/* Orders & Revenue Over Time */}
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  
          <ChartCard title="Orders Over Time" loading={isLoading}>
  
            {timeChartData.length > 0 ? (
  
              <ResponsiveContainer width="100%" height={280}>
  
                <AreaChart data={timeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
  
                  <defs>
  
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
  
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
  
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
  
                    </linearGradient>
  
                  </defs>
  
                  <XAxis 
  
                    dataKey="label" 
  
                    axisLine={false} 
  
                    tickLine={false} 
  
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
  
                  />
  
                  <YAxis 
  
                    axisLine={false} 
  
                    tickLine={false} 
  
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
  
                  />
  
                  <Tooltip 
  
                    contentStyle={{ 
  
                      backgroundColor: 'hsl(var(--card))', 
  
                      border: '1px solid hsl(var(--border))',
  
                      borderRadius: '8px',
  
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  
                    }}
  
                  />
  
                  <Area 
  
                    type="monotone" 
  
                    dataKey="orders" 
  
                    stroke={CHART_COLORS.primary} 
  
                    strokeWidth={2}
  
                    fillOpacity={1} 
  
                    fill="url(#colorOrders)" 
  
                  />
  
                </AreaChart>
  
              </ResponsiveContainer>
  
            ) : (
  
              <EmptyChart />
  
            )}
  
          </ChartCard>
  
  
  
          <ChartCard title="Revenue Over Time" loading={isLoading}>
  
            {timeChartData.length > 0 ? (
  
              <ResponsiveContainer width="100%" height={280}>
  
                <AreaChart data={timeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
  
                  <defs>
  
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
  
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
  
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
  
                    </linearGradient>
  
                  </defs>
  
                  <XAxis 
  
                    dataKey="label" 
  
                    axisLine={false} 
  
                    tickLine={false} 
  
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
  
                  />
  
                  <YAxis 
  
                    axisLine={false} 
  
                    tickLine={false} 
  
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
  
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
  
                  />
  
                  <Tooltip 
  
                    formatter={(value: number) => [`${value.toLocaleString()} DZD`, 'Revenue']}
  
                    contentStyle={{ 
  
                      backgroundColor: 'hsl(var(--card))', 
  
                      border: '1px solid hsl(var(--border))',
  
                      borderRadius: '8px',
  
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  
                    }}
  
                  />
  
                  <Area 
  
                    type="monotone" 
  
                    dataKey="revenue" 
  
                    stroke={CHART_COLORS.secondary} 
  
                    strokeWidth={2}
  
                    fillOpacity={1} 
  
                    fill="url(#colorRevenue)" 
  
                  />
  
                </AreaChart>
  
              </ResponsiveContainer>
  
            ) : (
  
              <EmptyChart />
  
            )}
  
          </ChartCard>
  
        </div>
  
  	  
  
        {/* Distribution Charts */}
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  
          <ChartCard title="Orders by Delivery Type" loading={isLoading}>
  
            {deliveryPieData.length > 0 ? (
  
              <div className="flex items-center">
  
                <ResponsiveContainer width="60%" height={220}>
  
                  <PieChart>
  
                    <Pie
  
                      data={deliveryPieData}
  
                      cx="50%"
  
                      cy="50%"
  
                      innerRadius={55}
  
                      outerRadius={85}
  
                      paddingAngle={3}
  
                      dataKey="value"
  
                    >
  
                      {deliveryPieData.map((entry, index) => (
  
                        <Cell key={`cell-${index}`} fill={entry.color} />
  
                      ))}
  
                    </Pie>
  
                    <Tooltip 
  
                      contentStyle={{ 
  
                        backgroundColor: 'hsl(var(--card))', 
  
                        border: '1px solid hsl(var(--border))',
  
                        borderRadius: '8px'
  
                      }}
  
                    />
  
                  </PieChart>
  
                </ResponsiveContainer>
  
                <div className="flex flex-col gap-3">
  
                  {deliveryPieData.map((item, i) => (
  
                    <div key={i} className="flex items-center gap-2">
  
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
  
                      <span className="text-sm text-muted-foreground">{item.name}</span>
  
                      <span className="text-sm font-medium ml-auto">{item.value}</span>
  
                    </div>
  
                  ))}
  
                </div>
  
              </div>
  
            ) : (
  
              <EmptyChart />
  
            )}
  
          </ChartCard>
  
  
  
          <ChartCard title="Orders by Store" loading={isLoading}>
  
            {storePieData.length > 0 ? (
  
              <div className="flex items-center">
  
                <ResponsiveContainer width="60%" height={220}>
  
                  <PieChart>
  
                    <Pie
  
                      data={storePieData}
  
                      cx="50%"
  
                      cy="50%"
  
                      innerRadius={55}
  
                      outerRadius={85}
  
                      paddingAngle={3}
  
                      dataKey="value"
  
                    >
  
                      {storePieData.map((entry, index) => (
  
                        <Cell key={`cell-${index}`} fill={entry.color} />
  
                      ))}
  
                    </Pie>
  
                    <Tooltip 
  
                      contentStyle={{ 
  
                        backgroundColor: 'hsl(var(--card))', 
  
                        border: '1px solid hsl(var(--border))',
  
                        borderRadius: '8px'
  
                      }}
  
                    />
  
                  </PieChart>
  
                </ResponsiveContainer>
  
                <div className="flex flex-col gap-3">
  
                  {storePieData.map((item, i) => (
  
                    <div key={i} className="flex items-center gap-2">
  
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
  
                      <span className="text-sm text-muted-foreground">{item.name}</span>
  
                      <span className="text-sm font-medium ml-auto">{item.value}</span>
  
                    </div>
  
                  ))}
  
                </div>
  
              </div>
  
            ) : (
  
              <EmptyChart />
  
            )}
  
          </ChartCard>
  
        </div>
  
  
  
      </div>
  
    );
  
  };
  
  
  
  // KPI Card Component
  
  interface KPICardProps {
  
    title: string;
  
    value: string | number;
  
    icon: React.ElementType;
  
    loading?: boolean;
  
    subtitle?: string;
  
  }
  
  const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, loading, subtitle }) => (
  
    <Card className="border-border/50">
  
      <CardContent className="p-6">
  
        {loading ? (
  
          <div className="space-y-3">
  
            <Skeleton className="h-4 w-24" />
  
            <Skeleton className="h-8 w-32" />
  
          </div>
  
        ) : (
  
          <div className="space-y-1">
  
            <div className="flex items-center justify-between">
  
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
  
              <Icon className="w-4 h-4 text-muted-foreground/60" />
  
            </div>
  
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
  
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
  
          </div>
  
        )}
  
      </CardContent>
  
    </Card>
  
  );
  
  
  
  // Chart Card Wrapper
  
  interface ChartCardProps {
  
    title: string;
  
    subtitle?: string;
  
    children: React.ReactNode;
  
    loading?: boolean;
  
    icon?: React.ReactNode;
  
  }
  
  const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, loading, icon }) => (
  
    <Card className="border-border/50">
  
      <CardContent className="p-6">
  
        <div className="flex items-center gap-2 mb-4">
  
          {icon}
  
          <div>
  
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
  
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
  
          </div>
  
        </div>
  
        {loading ? (
  
          <div className="h-[220px] flex items-center justify-center">
  
            <Skeleton className="h-full w-full rounded-lg" />
  
          </div>
  
        ) : (
  
          children
  
        )}
  
      </CardContent>
  
    </Card>
  
  );
  
  
  
  // Empty Chart Placeholder
  
  const EmptyChart: React.FC = () => (
  
    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
  
      No data available for this period
  
    </div>
  
  );
  
  
  
  export default AdminDashboard;
  
  
