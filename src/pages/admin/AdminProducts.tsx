import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
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
} from "@/components/ui/pagination"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  X,
  Scale,
  Star,
  TrendingUp,
  Loader2,
  Upload,
  ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

const PAGE_SIZE = 8;

const AdminProducts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: productsData, isLoading } = useProducts({ page, pageSize: PAGE_SIZE, searchQuery: debouncedSearchQuery });
  const { data: products = [], count = 0 } = productsData || {};

  const { categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name_ar: '', name_fr: '', price: '', category_id: '', description_ar: '',
    has_weight_options: false, is_featured: false, is_best_seller: false,
    is_new: false, is_promo: false, image: '', original_price: '',
  });
  const [formWeights, setFormWeights] = useState<{ id?: string; weight: string; price: number }[]>([]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({
      name_ar: '', name_fr: '', price: '', category_id: '', description_ar: '',
      has_weight_options: false, is_featured: false, is_best_seller: false,
      is_new: false, is_promo: false, image: '', original_price: '',
    });
    setFormWeights([]);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setEditingProductId(productId);
    setFormData({
      name_ar: product.name_ar, name_fr: product.name_fr,
      price: product.price.toString(), category_id: product.category_id || '',
      description_ar: product.description_ar || '', has_weight_options: product.has_weight_options || false,
      is_featured: product.is_featured || false, is_best_seller: product.is_best_seller || false,
      is_new: product.is_new || false, is_promo: product.is_promo || false,
      image: product.image || '', original_price: product.original_price?.toString() || '',
    });
    setFormWeights(product.weights?.map(w => ({ id: w.id, weight: w.weight, price: w.price })) || []);
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: publicUrl }));
      setImagePreview(publicUrl);
      toast({ title: 'Uploaded', description: 'Image uploaded successfully' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message || 'Failed to upload image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addWeight = () => setFormWeights(prev => [...prev, { weight: '', price: 0 }]);
  const updateWeight = (index: number, field: 'weight' | 'price', value: string) => {
    setFormWeights(prev => prev.map((w, i) => i === index ? { ...w, [field]: field === 'price' ? parseFloat(value) || 0 : value } : w));
  };
  const removeWeight = (index: number) => setFormWeights(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!formData.name_ar || !formData.name_fr || !formData.price) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      const productData = {
        name_ar: formData.name_ar, name_fr: formData.name_fr,
        price: parseFloat(formData.price), category_id: formData.category_id || null,
        description_ar: formData.description_ar || null, has_weight_options: formData.has_weight_options,
        is_featured: formData.is_featured, is_best_seller: formData.is_best_seller,
        is_new: formData.is_new, is_promo: formData.is_promo, image: formData.image || null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      };
      const weightsData = formData.has_weight_options ? formWeights.filter(w => w.weight).map((w, i) => ({ weight: w.weight, price: w.price, sort_order: i })) : [];
      if (editingProductId) {
        await updateProduct.mutateAsync({ id: editingProductId, product: productData, weights: weightsData });
        toast({ title: 'Updated', description: 'Product updated successfully' });
      } else {
        await createProduct.mutateAsync({ product: productData, weights: weightsData });
        toast({ title: 'Added', description: 'Product added successfully' });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
      toast({ title: 'Deleted', description: 'Product deleted successfully' });
      setDeleteProductId(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };
  
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage store products ({count} total)</p>
        </div>
        <Button onClick={openAddModal}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
      </div>
      <Card><CardContent className="p-4"><div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div></CardContent></Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      ) : products.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative bg-muted"><img src={product.image || '/placeholder.svg'} alt={product.name_ar} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_featured && <Badge className="bg-purple-100 text-purple-800"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                    {product.is_best_seller && <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />Best Seller</Badge>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-1" dir="rtl">{product.name_ar}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.name_fr}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} DZD</p>
                    {product.has_weight_options && product.weights && (<Badge variant="outline" className="text-xs"><Scale className="w-3 h-3 mr-1" />{product.weights.length} weights</Badge>)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(product.id)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteProductId(product.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); setPage(p => Math.max(1, p - 1));}} className={page === 1 ? 'pointer-events-none text-muted-foreground' : ''}/></PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}><PaginationLink href="#" onClick={(e) => {e.preventDefault(); setPage(i + 1);}} isActive={page === i + 1}>{i + 1}</PaginationLink></PaginationItem>
                ))}
                <PaginationItem><PaginationNext href="#" onClick={(e) => {e.preventDefault(); setPage(p => Math.min(totalPages, p + 1));}} className={page === totalPages ? 'pointer-events-none text-muted-foreground' : ''} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name (Arabic) *</Label><Input value={formData.name_ar} onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))} placeholder="اسم المنتج" dir="rtl" /></div>
              <div className="space-y-2"><Label>Name (French) *</Label><Input value={formData.name_fr} onChange={(e) => setFormData(prev => ({ ...prev, name_fr: e.target.value }))} placeholder="Nom du produit" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Base Price (DZD) *</Label><Input type="text" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="Enter price" /></div>
              <div className="space-y-2"><Label>Original Price (DZD)</Label><Input type="number" value={formData.original_price} onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))} placeholder="For promotions" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Category</Label><Select value={formData.category_id} onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name_ar} - {cat.name_fr}</SelectItem>))}</SelectContent></Select></div></div>
            <div className="space-y-3"><Label>Product Image</Label><div className="flex gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Image</>}
                  </Button>
                  {imagePreview && <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-destructive hover:text-destructive"><X className="w-4 h-4 mr-1" />Remove</Button>}
                  <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG/WebP</p>
                </div>
            </div></div>
            <div className="space-y-2"><Label>Description (Arabic)</Label><Textarea value={formData.description_ar} onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))} placeholder="وصف المنتج" rows={2} dir="rtl" /></div>
            <div className="space-y-3"><Label>Product Labels</Label><div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2"><Checkbox id="featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: !!checked }))} /><label htmlFor="featured" className="text-sm cursor-pointer flex items-center gap-1"><Star className="w-4 h-4 text-purple-500" />Produit en Vedette</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="bestseller" checked={formData.is_best_seller} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_seller: !!checked }))} /><label htmlFor="bestseller" className="text-sm cursor-pointer flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-500" />Meilleures Ventes</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="new" checked={formData.is_new} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: !!checked }))} /><label htmlFor="new" className="text-sm cursor-pointer">New Product</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="promo" checked={formData.is_promo} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promo: !!checked }))} /><label htmlFor="promo" className="text-sm cursor-pointer">Promotion</label></div>
            </div></div>
            <div className="space-y-3 border-t pt-4"><div className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><Checkbox id="hasWeights" checked={formData.has_weight_options} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_weight_options: !!checked }))} /><label htmlFor="hasWeights" className="text-sm font-medium cursor-pointer flex items-center gap-2"><Scale className="w-4 h-4" />Enable Weight Options</label></div>
                {formData.has_weight_options && (<Button type="button" variant="outline" size="sm" onClick={addWeight}><Plus className="w-4 h-4 mr-1" />Add Weight</Button>)}
            </div>
            {formData.has_weight_options && (<div className="space-y-2">
                {formWeights.length === 0 && (<p className="text-sm text-muted-foreground">No weights added. Click "Add Weight" to create weight options.</p>)}
                {formWeights.map((weight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input placeholder="e.g., 50g, 100g" value={weight.weight} onChange={(e) => updateWeight(index, 'weight', e.target.value)} className="flex-1" />
                    <Input type="number" placeholder="Price" value={weight.price || ''} onChange={(e) => updateWeight(index, 'price', e.target.value)} className="w-28" />
                    <span className="text-sm text-muted-foreground">DZD</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeWeight(index)}><X className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
            </div>)}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
              {(createProduct.isPending || updateProduct.isPending) && (<Loader2 className="w-4 h-4 mr-2 animate-spin" />)}
              {editingProductId ? 'Update' : 'Add'} Product
          </Button></DialogFooter>
      </DialogContent></Dialog>
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}><AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Product</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this product? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent></AlertDialog>
    </div>
  );
};

export default AdminProducts;
