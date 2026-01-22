import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUpdateOrder, OrderWithItems } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { algerianWilayas } from '@/data/adminData';
import { Loader2, Save } from 'lucide-react';

interface EditOrderDialogProps {
  order: OrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}

const deliveryLabels = { home: 'Home Delivery', bureau: 'Bureau', pickup: 'Pickup' };

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({ order, isOpen, onClose }) => {
  const [formData, setFormData] = useState<Partial<OrderWithItems> & { wilaya_code?: number }>({});
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        wilaya_name: order.wilaya_name,
        wilaya_code: order.wilaya_code,
        address: order.address,
        delivery_type: order.delivery_type,
        send_from_store: order.send_from_store,
        notes: order.notes,
        total: order.total,
        subtotal: order.subtotal,
        delivery_price: order.delivery_price,
      });
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!order || !order.id) return;

    try {
      await updateOrder.mutateAsync({ id: order.id, data: formData });
      toast({ title: 'Order Updated', description: `Order ${order.order_number} has been updated.` });
      onClose();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast({ title: 'Update Failed', description: 'An error occurred while updating the order.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Order {order?.order_number}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer_name" className="text-right">Customer Name</Label>
            <Input id="customer_name" name="customer_name" value={formData.customer_name || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer_phone" className="text-right">Customer Phone</Label>
            <Input id="customer_phone" name="customer_phone" value={formData.customer_phone || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wilaya_name" className="text-right">Wilaya</Label>
            <Select name="wilaya_name" value={formData.wilaya_name || ''} onValueChange={(selectedValue) => {
                const selectedWilaya = algerianWilayas.find(w => w.name === selectedValue);
                if (selectedWilaya) {
                    setFormData(prev => ({
                        ...prev,
                        wilaya_name: selectedWilaya.name,
                        wilaya_code: selectedWilaya.code,
                    }));
                }
            }}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Wilaya" />
              </SelectTrigger>
              <SelectContent>
                {algerianWilayas.map((wilaya) => (
                  <SelectItem key={wilaya.code} value={wilaya.name}>{wilaya.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Address</Label>
            <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="delivery_type" className="text-right">Delivery Type</Label>
            <Select name="delivery_type" value={formData.delivery_type || ''} onValueChange={(v) => handleSelectChange('delivery_type', v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select delivery type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(deliveryLabels).map(d => <SelectItem key={d} value={d}>{deliveryLabels[d as keyof typeof deliveryLabels]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="send_from_store" className="text-right">Store</Label>
            <Select name="send_from_store" value={formData.send_from_store || ''} onValueChange={(v) => handleSelectChange('send_from_store', v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laghouat">Laghouat</SelectItem>
                <SelectItem value="aflou">Aflou</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Notes</Label>
            <Input id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={updateOrder.isPending}>
          {updateOrder.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
