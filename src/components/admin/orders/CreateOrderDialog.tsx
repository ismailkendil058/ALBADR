import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useCreateOrder, NewOrderWithItems, NewOrderItem } from '@/hooks/useOrders';
import { useProducts, Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useActiveWilayas, useCheapestDelivery } from '@/hooks/useTariffs';
import { Loader2, Save, X, Trash2, PlusCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface CreateOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const deliveryLabels = { home: 'Home Delivery', bureau: 'Bureau', pickup: 'Pickup' };

const AddProductDialog = ({ onAddProduct, products }: { onAddProduct: (product: Product, quantity: number, weightId?: string) => void, products: Product[] }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedWeightId, setSelectedWeightId] = useState<string | undefined>(undefined);
    const [productSearch, setProductSearch] = useState('');
    const debouncedProductSearch = useDebounce(productSearch, 300);
    const { data: productsData } = useProducts({ searchQuery: debouncedProductSearch, pageSize: 100 });
    const searchResults = productsData?.data || [];


    useEffect(() => {
        if (selectedProduct && selectedProduct.weights && selectedProduct.weights.length > 0) {
            setSelectedWeightId(selectedProduct.weights[0].id);
        } else {
            setSelectedWeightId(undefined);
        }
    }, [selectedProduct]);

    const handleAdd = () => {
        if (selectedProduct) {
            onAddProduct(selectedProduct, quantity, selectedWeightId);
            setSelectedProduct(null);
            setQuantity(1);
            setSelectedWeightId(undefined);
            setProductSearch('');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Product to Order</DialogTitle>
                    <DialogDescription>
                        Search for a product and add it to the order with a specified quantity and weight.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Command>
                            <CommandInput
                                placeholder="Search for a product..."
                                value={productSearch}
                                onValueChange={setProductSearch}
                            />
                            <CommandList>
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup>
                                    {searchResults.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            onSelect={() => setSelectedProduct(product)}
                                        >
                                            {product.name_ar} ({product.name_fr})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={selectedProduct.image || '/placeholder.svg'} alt={selectedProduct.name_fr} className="w-20 h-20 rounded-md object-cover" />
                                <div>
                                    <h4 className="font-semibold">{selectedProduct.name_ar}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.name_fr}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            {selectedProduct.weights && selectedProduct.weights.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight</Label>
                                    <Select value={selectedWeightId} onValueChange={setSelectedWeightId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select weight" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.weights.map(w => (
                                                <SelectItem key={w.id} value={w.id}>{w.weight} - {w.price} DZD</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <Button onClick={handleAdd} className="w-full">Add to Order</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState<Omit<NewOrderWithItems, 'items'> & { wilaya_code?: number }>({
        customer_name: '',
        customer_phone: '',
        wilaya_name: '',
        wilaya_code: 0,
        status: 'new',
        delivery_type: 'home',
        send_from_store: 'laghouat',
        total: 0,
        subtotal: 0,
        delivery_price: 0,
        is_manual: true,
    });
    const [items, setItems] = useState<NewOrderItem[]>([]);

    const createOrder = useCreateOrder();
    const { toast } = useToast();

    const { data: productsData } = useProducts({ pageSize: 1000 }); // Fetch all products for matching
    const products = productsData?.data || [];

    const { data: activeWilayas, isLoading: activeWilayasLoading } = useActiveWilayas();

    const { data: deliveryPriceData, isLoading: isDeliveryPriceLoading } = useCheapestDelivery(
        formData.wilaya_code,
        formData.delivery_type as 'home' | 'bureau' | 'pickup'
    );

    useEffect(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.total_price || 0), 0);
        const calculatedDeliveryPrice = deliveryPriceData?.price ?? 0;
        const total = subtotal + calculatedDeliveryPrice;
        setFormData(prev => ({ ...prev, subtotal, delivery_price: calculatedDeliveryPrice, total }));
    }, [items, deliveryPriceData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/\D/g, ''); // Keep only digits
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'wilaya_name') {
            const parts = value.split(' - ');
            if (parts.length >= 2) {
                const code = parseInt(parts[0], 10);
                const wilayaName = parts.slice(1).join(' - '); // Re-join if name has hyphens
                setFormData(prev => ({
                    ...prev,
                    wilaya_name: wilayaName,
                    wilaya_code: code,
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addProductToOrder = (product: Product, quantity: number, weightId?: string) => {
        let unit_price = product.price;
        let weight = null;
        let product_weight_id = null;

        if (weightId) {
            const selectedWeight = product.weights?.find(w => w.id === weightId);
            if (selectedWeight) {
                unit_price = selectedWeight.price;
                weight = selectedWeight.weight;
                product_weight_id = selectedWeight.id;
            }
        }

        const newItem: NewOrderItem = {
            product_id: product.id,
            quantity,
            unit_price,
            total_price: unit_price * quantity,
            product_name_ar: product.name_ar,
            product_name_fr: product.name_fr,
            weight,
            product_weight_id,
        };
        setItems(prev => [...prev, newItem]);
        toast({ title: 'Product Added', description: `${product.name_ar} was added to the order.` });
    };

    const updateItem = (index: number, updatedFields: Partial<NewOrderItem>) => {
        const newItems = [...items];
        const item = newItems[index];

        Object.assign(item, updatedFields);

        item.total_price = (item.unit_price || 0) * (item.quantity || 0);

        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = async () => {
        try {
            if (!formData.customer_name || !formData.customer_phone || !formData.wilaya_name || (formData.delivery_type === 'home' && !formData.address)) {
                toast({ title: 'Validation Error', description: 'Please fill in all customer details.', variant: 'destructive' });
                return;
            }
            if (items.length === 0) {
                toast({ title: 'Validation Error', description: 'Please add at least one product to the order.', variant: 'destructive' });
                return;
            }

            const finalOrderData: NewOrderWithItems = {
                ...formData,
                customer_name: formData.customer_name!,
                customer_phone: formData.customer_phone!,
                wilaya_name: formData.wilaya_name!,
                items,
            };

            await createOrder.mutateAsync(finalOrderData);
            toast({ title: 'Order Created', description: `New order for ${formData.customer_name} created successfully.` });
            onClose();
            setItems([]);
            setFormData({
                customer_name: '',
                customer_phone: '',
                wilaya_name: '',
                wilaya_code: 0,
                status: 'new',
                delivery_type: 'home',
                send_from_store: 'laghouat',
                total: 0,
                subtotal: 0,
                delivery_price: 0,
                is_manual: true,
            });

        } catch (error) {
            console.error("Failed to create order:", error);
            toast({ title: 'Creation Failed', description: 'An error occurred while creating the order.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                        Fill in the customer information and add products to create a new order.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Customer Info */}
                    <div className='space-y-4'>
                        <h3 className='font-semibold'>Customer Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="customer_name">Customer Name</Label>
                            <Input id="customer_name" name="customer_name" value={formData.customer_name || ''} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_phone">Customer Phone</Label>
                            <Input
                                id="customer_phone"
                                name="customer_phone"
                                type="tel" // Use type="tel" for better mobile keyboard experience
                                value={formData.customer_phone || ''}
                                onChange={handlePhoneChange} // Use a specific handler for phone number
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wilaya_name">Wilaya</Label>
                            <Select
                                name="wilaya_name"
                                value={formData.wilaya_code ? `${formData.wilaya_code.toString().padStart(2, '0')} - ${formData.wilaya_name}` : ''}
                                onValueChange={(selectedValue) => handleSelectChange('wilaya_name', selectedValue)}
                                disabled={activeWilayasLoading}
                            >
                                <SelectTrigger><SelectValue placeholder={activeWilayasLoading ? "Loading Wilayas..." : "Select Wilaya"} /></SelectTrigger>
                                <SelectContent>
                                    {activeWilayas?.map((wilaya) => (
                                        <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.delivery_type === 'home' && (
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="delivery_type">Delivery Type</Label>
                            <Select name="delivery_type" value={formData.delivery_type} onValueChange={(v) => handleSelectChange('delivery_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(deliveryLabels).map(d => <SelectItem key={d} value={d}>{deliveryLabels[d as keyof typeof deliveryLabels]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="send_from_store">Store</Label>
                            <Select name="send_from_store" value={formData.send_from_store} onValueChange={(v) => handleSelectChange('send_from_store', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="laghouat">Laghouat</SelectItem>
                                    <SelectItem value="aflou">Aflou</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className='space-y-4'>
                        <h3 className='font-semibold'>Order Items</h3>
                        <AddProductDialog onAddProduct={addProductToOrder} products={products} />

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {items.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    No products added yet.
                                </div>
                            )}
                            {items.map((item, index) => {
                                const product = products.find(p => p.id === item.product_id);
                                return (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded-md border">
                                        <div className='flex-1'>
                                            <p className="font-medium">{item.product_name_ar}</p>
                                            <p className="text-sm text-muted-foreground">{item.product_name_fr}</p>
                                            {item.weight && <p className="text-xs text-muted-foreground">Weight: {item.weight}</p>}
                                        </div>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                                            className="w-20"
                                        />
                                        <p className='w-24 text-right'>{item.total_price?.toLocaleString()} DZD</p>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                        {items.length > 0 && (
                            <div className="pt-4 border-t space-y-2">
                                {formData.wilaya_name && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Wilaya</span>
                                        <span>{formData.wilaya_name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between"><span>Subtotal</span><span>{formData.subtotal?.toLocaleString()} DZD</span></div>
                                <div className="flex justify-between"><span>Delivery</span><span>{isDeliveryPriceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${formData.delivery_price?.toLocaleString()} DZD`}</span></div>
                                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{isDeliveryPriceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${formData.total?.toLocaleString()} DZD`}</span></div>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={createOrder.isPending || isDeliveryPriceLoading} className="w-full md:w-auto">
                        {createOrder.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Create Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrderDialog;