import React, { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Eye } from 'lucide-react';
import { HeroSlide } from '@/types/cms';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const HeroCMS: React.FC = () => {
    const { content, updateHeroSlides, addHeroSlide, removeHeroSlide, reorderHeroSlides, uploadImage, deleteImage } = useCMS();

    const [slides, setSlides] = useState(content.hero.slides);

    // Sync local state when content updates from database
    React.useEffect(() => {
        setSlides(content.hero.slides);
    }, [content.hero.slides]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newSlide, setNewSlide] = useState<Omit<HeroSlide, 'id'>>({
        image: '',
        title: '',
        ctaText: 'تسوق الآن',
        ctaLink: '/products',
        order: slides.length + 1,
        isActive: true,
    });

    const handleUpdateSlide = (id: string, field: keyof HeroSlide, value: string | boolean | number) => {
        const updated = slides.map(slide =>
            slide.id === id ? { ...slide, [field]: value } : slide
        );
        setSlides(updated);
        updateHeroSlides(updated);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slideId?: string) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image is too large. Please select an image under 2MB.');
                return;
            }

            setUploading(true);
            try {
                // Delete old image if updating existing slide
                if (slideId) {
                    const slide = slides.find(s => s.id === slideId);
                    if (slide?.image && slide.image.includes('supabase')) {
                        await deleteImage(slide.image);
                    }
                }

                // Upload new image
                const publicUrl = await uploadImage(file, 'hero-slides');

                if (publicUrl) {
                    if (slideId) {
                        handleUpdateSlide(slideId, 'image', publicUrl);
                        toast.success('Slide image updated');
                    } else {
                        setNewSlide({ ...newSlide, image: publicUrl });
                    }
                } else {
                    toast.error('Failed to upload image');
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDeleteSlide = async (id: string) => {
        if (slides.length <= 1) {
            toast.error('You must have at least one slide');
            return;
        }
        const updated = slides.filter(slide => slide.id !== id);
        const success = await removeHeroSlide(id);
        if (success !== false) { // removeHeroSlide doesn't return bool currently but handle it
            setSlides(updated);
            toast.success('Slide deleted');
        }
    };

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const index = slides.findIndex(slide => slide.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === slides.length - 1)
        ) {
            return;
        }

        const updated = [...slides];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

        // Update order values
        updated.forEach((slide, idx) => {
            slide.order = idx + 1;
        });

        setSlides(updated);
        await reorderHeroSlides(updated);
    };

    const handleAddSlide = async () => {
        if (!newSlide.image || !newSlide.title) {
            toast.error('Please upload an image and fill in the title');
            return;
        }

        const success = await addHeroSlide(newSlide);
        if (success) {
            setSlides([...slides, { ...newSlide, id: Date.now().toString() }]);
            setNewSlide({
                image: '',
                title: '',
                ctaText: 'تسوق الآن',
                ctaLink: '/products',
                order: slides.length + 2,
                isActive: true,
            });
            setIsAddDialogOpen(false);
            toast.success('Slide added successfully');
        } else {
            toast.error('Failed to save slide to database. Please check your connection or Supabase settings.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Slides Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Hero Slides</CardTitle>
                            <CardDescription>Manage carousel slides - drag to reorder</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Slide
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Slide</DialogTitle>
                                    <DialogDescription>
                                        Create a new slide for the hero carousel. Upload an image from your device.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-image">Slide Image *</Label>
                                        <Input
                                            id="new-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e)}
                                            className="cursor-pointer"
                                        />
                                        {newSlide.image && (
                                            <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border">
                                                <img src={newSlide.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-title">Title *</Label>
                                        <Input
                                            id="new-title"
                                            value={newSlide.title}
                                            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                                            placeholder="Slide title"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-cta-text">CTA Button Text</Label>
                                            <Input
                                                id="new-cta-text"
                                                value={newSlide.ctaText}
                                                onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })}
                                                placeholder="Shop Now"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-cta-link">CTA Link</Label>
                                            <Input
                                                id="new-cta-link"
                                                value={newSlide.ctaLink}
                                                onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })}
                                                placeholder="/products"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new-active"
                                            checked={newSlide.isActive}
                                            onCheckedChange={(checked) => setNewSlide({ ...newSlide, isActive: checked })}
                                        />
                                        <Label htmlFor="new-active">Active</Label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddSlide}>Add Slide</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
                            <Card key={slide.id} className={!slide.isActive ? 'opacity-60' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        {/* Reorder Buttons */}
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleReorder(slide.id, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleReorder(slide.id, 'down')}
                                                disabled={index === slides.length - 1}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Image Preview & Change */}
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted">
                                                <img
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                            <Label
                                                htmlFor={`change-image-${slide.id}`}
                                                className="text-[10px] text-center bg-red-700 hover:bg-red-800 text-white py-1 rounded cursor-pointer transition-colors font-medium"
                                            >
                                                Change Image
                                                <input
                                                    id={`change-image-${slide.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, slide.id)}
                                                />
                                            </Label>
                                        </div>

                                        {/* Slide Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1 md:col-span-2">
                                                    <Label className="text-xs">Title</Label>
                                                    <Input
                                                        value={slide.title}
                                                        onChange={(e) => handleUpdateSlide(slide.id, 'title', e.target.value)}
                                                        placeholder="Slide title"
                                                        className="h-9"
                                                    />
                                                </div>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">CTA Text</Label>
                                                    <Input
                                                        value={slide.ctaText}
                                                        onChange={(e) => handleUpdateSlide(slide.id, 'ctaText', e.target.value)}
                                                        placeholder="Shop Now"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">CTA Link</Label>
                                                    <Input
                                                        value={slide.ctaLink}
                                                        onChange={(e) => handleUpdateSlide(slide.id, 'ctaLink', e.target.value)}
                                                        placeholder="/products"
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`active-${slide.id}`}
                                                        checked={slide.isActive}
                                                        onCheckedChange={(checked) => handleUpdateSlide(slide.id, 'isActive', checked)}
                                                    />
                                                    <Label htmlFor={`active-${slide.id}`} className="text-sm">
                                                        {slide.isActive ? 'Active' : 'Inactive'}
                                                    </Label>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSlide(slide.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}


                        {slides.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No slides yet. Click "Add Slide" to create one.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HeroCMS;
