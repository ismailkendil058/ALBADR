import React, { useState, useMemo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, Filter, Eye, Phone, MapPin, Truck, Store, Package, X, Trash2, Loader2, Building2, Scale
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useOrders, useUpdateOrderStatus, useBulkUpdateOrderStatus, useBulkDeleteOrders, OrderWithItems, OrderStatus } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import OrderCard from '@/components/admin/orders/OrderCard';

const PAGE_SIZE = 20;

const statusLabels: Record<OrderStatus, string> = {
  new: 'New', confirmed: 'Confirmed', delivered: 'Delivered', canceled: 'Canceled',
};
const statusColors: Record<OrderStatus, string> = {
  new: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800', canceled: 'bg-red-100 text-red-800',
};
const deliveryLabels = { home: 'Home Delivery', bureau: 'Bureau', pickup: 'Pickup' };

const AdminOrders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchQuery: '', status: 'all', deliveryType: 'all', store: 'all', fromDate: '', toDate: '',
  });
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

  const { data: ordersData, isLoading } = useOrders({
    page, pageSize: PAGE_SIZE, searchQuery: debouncedSearchQuery,
    status: filters.status, deliveryType: filters.deliveryType, store: filters.store,
    fromDate: filters.fromDate, toDate: filters.toDate,
  });
  const { data: orders = [], count = 0 } = ordersData || {};
  const isMobile = useIsMobile();
  
  const updateStatus = useUpdateOrderStatus();
  const bulkUpdateStatus = useBulkUpdateOrderStatus();
  const bulkDelete = useBulkDeleteOrders();
  const { toast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filters.status, filters.deliveryType, filters.store, filters.fromDate, filters.toDate]);
  
  useEffect(() => {
    if (selectedOrders.length > 0) {
      setSelectedOrders([]);
    }
  }, [orders]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ searchQuery: '', status: 'all', deliveryType: 'all', store: 'all', fromDate: '', toDate: '' });
  };

  const hasActiveFilters = Object.values(filters).some((v, i) => i > 0 && v !== 'all' && v !== '');

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    await bulkUpdateStatus.mutateAsync({ ids: selectedOrders, status: newStatus });
    toast({ title: 'Updated', description: `${selectedOrders.length} orders updated.` });
    setSelectedOrders([]);
    setBulkAction('');
  };

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedOrders);
    toast({ title: 'Deleted', description: `${selectedOrders.length} orders deleted.` });
    setSelectedOrders([]);
    setShowDeleteConfirm(false);
  };

  const handleSingleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatus.mutateAsync({ id: orderId, status: newStatus });
    toast({ title: 'Updated', description: `Order status changed to ${statusLabels[newStatus]}.` });
  };
  
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and track all {count} orders</p>
      </div>

      {selectedOrders.length > 0 && (
        <Card className="border-primary"><CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="font-medium">{selectedOrders.length} orders selected</p>
            <div className="flex items-center gap-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Change status..." /></SelectTrigger>
                <SelectContent>
                  {Object.keys(statusLabels).map(s => <SelectItem key={s} value={s}>{statusLabels[s as OrderStatus]}</SelectItem>)}
                </SelectContent>
              </Select>
              {bulkAction && <Button onClick={() => handleBulkStatusChange(bulkAction as OrderStatus)} disabled={bulkUpdateStatus.isPending}>{bulkUpdateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}</Button>}
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
              <Button variant="ghost" onClick={() => setSelectedOrders([])}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      <Card><CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by order ID, customer name, or phone..." value={filters.searchQuery} onChange={(e) => handleFilterChange('searchQuery', e.target.value)} className="pl-10" />
            </div>
            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4 mr-2" />Filters{hasActiveFilters && (<span className="ml-2 w-2 h-2 bg-primary rounded-full" />)}</Button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div><Label className="text-sm font-medium mb-1.5 block">Status</Label><Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{Object.keys(statusLabels).map(s => <SelectItem key={s} value={s}>{statusLabels[s as OrderStatus]}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Delivery</Label><Select value={filters.deliveryType} onValueChange={v => handleFilterChange('deliveryType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{Object.keys(deliveryLabels).map(d => <SelectItem key={d} value={d}>{deliveryLabels[d as keyof typeof deliveryLabels]}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Store</Label><Select value={filters.store} onValueChange={v => handleFilterChange('store', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="laghouat">Laghouat</SelectItem><SelectItem value="aflou">Aflou</SelectItem></SelectContent></Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">From Date</Label><Input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">To Date</Label><Input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} /></div>
              </div>
              {hasActiveFilters && <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-1" />Clear Filters</Button></div>}
            </div>
          )}
      </CardContent></Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))
          ) : orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={toggleOrderSelection}
              onViewDetails={setSelectedOrder}
              onStatusChange={handleSingleStatusChange}
              statusLabels={statusLabels}
              statusColors={statusColors}
              deliveryLabels={deliveryLabels}
            />
          ))}
          {orders.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50 text-left"><th className="p-3"><Checkbox checked={selectedOrders.length === orders.length && orders.length > 0} onCheckedChange={toggleAllOrders} /></th><th className="p-3 font-medium">Order #</th><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Delivery</th><th className="p-3 font-medium">Store</th><th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Actions</th></tr></thead>
                <tbody>
                  {isLoading ? (Array.from({ length: 10 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={10} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>))
                  : orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30">
                      <td className="p-3"><Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleOrderSelection(order.id)} /></td>
                      <td className="p-3 font-mono text-xs">{order.order_number}</td>
                      <td className="p-3"><div><p className="font-medium">{order.customer_name}</p><p className="text-xs text-muted-foreground">{order.customer_phone}</p></div></td>
                      <td className="p-3"><div className="flex items-center gap-1.5">
                          {order.delivery_type === 'home' && <Truck className="w-4 h-4" />}
                          {order.delivery_type === 'bureau' && <Building2 className="w-4 h-4" />}
                          {order.delivery_type === 'pickup' && <Store className="w-4 h-4" />}
                          <span>{deliveryLabels[order.delivery_type]}</span>
                      </div></td>
                      <td className="p-3 capitalize">{order.send_from_store}</td>
                      <td className="p-3 font-semibold">{order.total.toLocaleString()} DZD</td>
                      <td className="p-3"><Select value={order.status} onValueChange={(v) => handleSingleStatusChange(order.id, v as OrderStatus)}><SelectTrigger className={`w-[120px] h-8 text-xs border-0 ${statusColors[order.status]}`}><SelectValue /></SelectTrigger><SelectContent>{Object.keys(statusLabels).map(s => <SelectItem key={s} value={s}>{statusLabels[s as OrderStatus]}</SelectItem>)}</SelectContent></Select></td>
                      <td className="p-3 text-xs">{format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="p-3"><Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && !isLoading && <div className="py-12 text-center"><Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No orders found</p></div>}
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && <Pagination><PaginationContent className="flex-wrap">
        <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} className={page === 1 ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>
        <div className="hidden sm:flex">
          {[...Array(totalPages)].map((_, i) => (<PaginationItem key={i}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(i + 1); }} isActive={page === i + 1}>{i + 1}</PaginationLink></PaginationItem>))}
        </div>
        <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} className={page === totalPages ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>
      </PaginationContent></Pagination>}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && <>
            <DialogHeader><DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle></DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><h4 className="font-semibold flex items-center gap-2"><Phone className="w-4 h-4" />Customer Information</h4><p>{selectedOrder.customer_name}</p><p className="text-muted-foreground">{selectedOrder.customer_phone}</p>{selectedOrder.customer_email && (<p className="text-muted-foreground">{selectedOrder.customer_email}</p>)}</div><div className="space-y-2"><h4 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Delivery Information</h4><p>{selectedOrder.wilaya_name}</p>{selectedOrder.address && <p className="text-muted-foreground">{selectedOrder.address}</p>}<p className="text-sm">Type: {deliveryLabels[selectedOrder.delivery_type]}</p><p className="text-sm">Store: {selectedOrder.send_from_store.charAt(0).toUpperCase() + selectedOrder.send_from_store.slice(1)}</p></div></div>
              <div><h4 className="font-semibold mb-3">Order Items</h4><div className="space-y-2">{selectedOrder.items.map((item, index) => (<div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">                      <div>
                        <p className="font-medium">
                          {(item.product_name_ar || item.product_name_fr || 'No Product Name Available')}
                        </p>
                        {item.weight && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Scale className="w-3 h-3" /> {item.weight}</p>
                        )}
                        {item.product_name_ar && item.product_name_fr && item.product_name_ar !== item.product_name_fr && (
                          <p className="text-sm text-muted-foreground">{item.product_name_fr}</p>
                        )}
                      </div><div className="text-right"><p className="font-semibold">{item.total_price.toLocaleString()} DZD</p><p className="text-sm text-muted-foreground">{item.quantity} × {item.unit_price.toLocaleString()} DZD</p></div></div>))}</div></div>
              <div className="border-t pt-4 space-y-2"><div className="flex justify-between"><span>Subtotal</span><span>{selectedOrder.subtotal.toLocaleString()} DZD</span></div><div className="flex justify-between"><span>Delivery</span><span>{selectedOrder.delivery_price.toLocaleString()} DZD</span></div><div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-primary">{selectedOrder.total.toLocaleString()} DZD</span></div></div>
              {selectedOrder.notes && (<div className="bg-muted/50 p-4 rounded-lg"><h4 className="font-semibold mb-2">Notes</h4><p className="text-sm">{selectedOrder.notes}</p></div>)}
            </div>
          </>}
      </DialogContent></Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}><AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Delete Orders</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {selectedOrders.length} order(s)? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{bulkDelete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent></AlertDialog>
    </div>
  );
};

export default AdminOrders;
