import React, { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const HeaderCMS: React.FC = () => {
    const { content, updateHeaderLogo, uploadImage, deleteImage } = useCMS();
    const [logoUrl, setLogoUrl] = useState(content.header.logo);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image is too large. Please select an image under 2MB.');
                return;
            }

            setUploading(true);
            try {
                // Delete old image if exists and is from storage
                if (logoUrl && logoUrl.includes('supabase')) {
                    await deleteImage(logoUrl);
                }

                // Upload new image
                const publicUrl = await uploadImage(file, 'logos');

                if (publicUrl) {
                    setLogoUrl(publicUrl);
                    await updateHeaderLogo(publicUrl);
                    toast.success('Header logo updated successfully');
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

    return (
        <div className="space-y-6">
            {/* Logo Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Header Logo</CardTitle>
                    <CardDescription>Upload a new logo for the website header. This will replace the current logo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logo-upload">Logo Image</Label>
                        <div className="flex flex-col gap-4">
                            <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Recommended: PNG or SVG with transparent background. Max size: 2MB.
                            </p>
                            {uploading && (
                                <p className="text-sm text-blue-600">Uploading...</p>
                            )}
                        </div>
                    </div>

                    {/* Logo Preview */}
                    {logoUrl && (
                        <div className="border rounded-lg p-6 bg-muted/30 flex flex-col items-center">
                            <p className="text-sm font-medium mb-4 self-start">Current Logo Preview:</p>
                            <div className="bg-white p-4 rounded-md shadow-sm border">
                                <img
                                    src={logoUrl}
                                    alt="Logo preview"
                                    className="h-20 w-auto object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default HeaderCMS;
