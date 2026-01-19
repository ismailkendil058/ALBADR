import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Phone, MapPin, Truck, Store, Package, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { OrderWithItems, OrderStatus } from '@/hooks/useOrders'; // Assuming these types are correctly exported
import { Label } from '@/components/ui/label';

interface OrderCardProps {
  order: OrderWithItems;
  isSelected: boolean;
  onSelect: (orderId: string) => void;
  onViewDetails: (order: OrderWithItems) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  statusLabels: Record<OrderStatus, string>;
  statusColors: Record<OrderStatus, string>;
  deliveryLabels: Record<string, string>; // Looser type for deliveryLabels as it's not a direct enum
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onViewDetails,
  onStatusChange,
  statusLabels,
  statusColors,
  deliveryLabels,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox checked={isSelected} onCheckedChange={() => onSelect(order.id)} />
            <span className="font-mono text-sm font-semibold">#{order.order_number}</span>
          </div>
          <Badge className={`text-xs ${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Customer</Label>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Total</Label>
            <p className="font-semibold">{order.total.toLocaleString()} DZD</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Delivery</Label>
            <div className="flex items-center gap-1">
              {order.delivery_type === 'home' && <Truck className="w-4 h-4" />}
              {order.delivery_type === 'bureau' && <Building2 className="w-4 h-4" />}
              {order.delivery_type === 'pickup' && <Store className="w-4 h-4" />}
              <span>{deliveryLabels[order.delivery_type]}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Store</Label>
            <p className="capitalize">{order.send_from_store}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-muted-foreground">Date</Label>
            <p className="text-xs">{format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <Select value={order.status} onValueChange={(v) => onStatusChange(order.id, v as OrderStatus)}>
            <SelectTrigger className={`w-[120px] h-8 text-xs border ${statusColors[order.status]}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusLabels).map(s => <SelectItem key={s} value={s}>{statusLabels[s as OrderStatus]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
            <Eye className="w-4 h-4 mr-1" /> Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
