import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Edit, Trash2, FolderTree, Package, Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategories, Category } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const AdminCategories: React.FC = () => {
  const { categories, isLoading: loading, error, addCategory, updateCategory, deleteCategory: deleteCategorySupabase } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [categoryNameFr, setCategoryNameFr] = useState('');
  const [categoryNameAr, setCategoryNameAr] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryNameFr('');
    setCategoryNameAr('');
    setImagePreview(null);
    setIsModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryNameFr(category.name_fr);
    setCategoryNameAr(category.name_ar);
    setImagePreview(category.image);
    setIsModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('catig').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('catig').getPublicUrl(filePath);
      setImagePreview(publicUrl);
      toast({ title: 'Uploaded', description: 'Image uploaded successfully.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!categoryNameFr.trim() || !categoryNameAr.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both French and Arabic category names',
        variant: 'destructive',
      });
      return;
    }

    try {
      const categoryData = {
        name_fr: categoryNameFr.trim(),
        name_ar: categoryNameAr.trim(),
        image: imagePreview,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          updatedFields: categoryData
        });
        toast({ title: 'Updated', description: 'Category updated successfully' });
      } else {
        await addCategory({
          ...categoryData,
          is_special: false, // Default value
        });
        toast({ title: 'Added', description: 'Category added successfully' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (deleteCategory) {
      const productCount = deleteCategory.products[0]?.count || 0;
      if (productCount > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'This category contains products. Please move products first.',
          variant: 'destructive',
        });
        setDeleteCategory(null);
        return;
      }
      
      try {
        await deleteCategorySupabase(deleteCategory.id);
        toast({ title: 'Deleted', description: 'Category deleted successfully' });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete category',
          variant: 'destructive',
        });
      }
      setDeleteCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p className="text-destructive">Error: {error.message}</p>}

      {!loading && !error && categories && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <Card key={category.id} className="overflow-hidden group">
              <div className="aspect-video relative bg-muted">
                <img
                  loading="lazy"
                  src={category.image || '/placeholder.svg'}
                  alt={category.name_fr}
                  className="w-full h-full object-cover"
                />
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline"
                      size="icon"
                      className="bg-background/80 hover:bg-background"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                      onClick={() => setDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold">{category.name_fr}</h3>
                <h3 className="font-bold text-right" dir="rtl">{category.name_ar}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {category.products[0]?.count || 0} products
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && (!categories || categories.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderTree className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories yet</p>
            <Button onClick={openAddModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryNameFr">Category Name (French)</Label>
              <Input
                id="categoryNameFr"
                value={categoryNameFr}
                onChange={(e) => setCategoryNameFr(e.target.value)}
                placeholder="e.g., Spices"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryNameAr">Category Name (Arabic)</Label>
              <Input
                id="categoryNameAr"
                value={categoryNameAr}
                onChange={(e) => setCategoryNameAr(e.target.value)}
                placeholder="e.g., بهارات"
                dir="rtl"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Category Image</Label>
              <div className="flex gap-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {(deleteCategory?.products[0]?.count || 0) > 0
                ? `Cannot delete this category because it contains ${deleteCategory?.products[0].count} products. Please move or delete them first.`
                : `Are you sure you want to delete "${deleteCategory?.name_fr}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {(deleteCategory?.products[0]?.count || 0) === 0 && (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
