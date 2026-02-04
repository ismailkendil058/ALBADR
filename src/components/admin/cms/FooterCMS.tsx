import React, { useState, useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook, Instagram } from 'lucide-react';
import { SocialMediaLink } from '@/types/cms';
import { toast } from 'sonner';

const FooterCMS: React.FC = () => {
    const { content, updateFooterLogo, updateFooterAbout, updateSocialMedia, uploadImage, deleteImage } = useCMS();

    const [logoUrl, setLogoUrl] = useState(content.footer.logo);
    const [aboutText, setAboutText] = useState(content.footer.aboutText);
    const [uploading, setUploading] = useState(false);

    // Social Media State - Fixed for Facebook and Instagram
    const [facebookUrl, setFacebookUrl] = useState(
        content.footer.socialMedia.find(s => s.platform === 'facebook')?.url || ''
    );
    const [instagramUrl, setInstagramUrl] = useState(
        content.footer.socialMedia.find(s => s.platform === 'instagram')?.url || ''
    );

    // Sync state when content changes
    useEffect(() => {
        setLogoUrl(content.footer.logo);
        setAboutText(content.footer.aboutText);
        setFacebookUrl(content.footer.socialMedia.find(s => s.platform === 'facebook')?.url || '');
        setInstagramUrl(content.footer.socialMedia.find(s => s.platform === 'instagram')?.url || '');
    }, [content.footer]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image is too large. Please select an image under 2MB.');
                return;
            }

            setUploading(true);
            try {
                if (logoUrl && logoUrl.includes('supabase')) {
                    await deleteImage(logoUrl);
                }

                const publicUrl = await uploadImage(file, 'logos');

                if (publicUrl) {
                    setLogoUrl(publicUrl);
                    await updateFooterLogo(publicUrl);
                    toast.success('Footer logo updated successfully');
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

    const handleAboutUpdate = () => {
        updateFooterAbout(aboutText);
        toast.success('About text updated');
    };

    const handleSocialUpdate = (platform: 'facebook' | 'instagram', value: string) => {
        if (platform === 'facebook') setFacebookUrl(value);
        if (platform === 'instagram') setInstagramUrl(value);

        // Prepare the updated array for the database
        const otherSocials = content.footer.socialMedia.filter(s => s.platform !== platform);
        const existingSocial = content.footer.socialMedia.find(s => s.platform === platform);

        const updatedSocial: SocialMediaLink = {
            id: existingSocial?.id || Date.now().toString() + platform,
            platform,
            url: value,
            order: platform === 'facebook' ? 1 : 2
        };

        const finalArray = [...otherSocials, updatedSocial].sort((a, b) => a.order - b.order);
        updateSocialMedia(finalArray);
    };

    const handleSaveSocials = () => {
        toast.success('Social media links updated');
    };

    return (
        <div className="space-y-6">
            {/* Footer Logo */}
            <Card>
                <CardHeader>
                    <CardTitle>Footer Logo</CardTitle>
                    <CardDescription>Upload a new logo for the footer. This will replace the current logo.</CardDescription>
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
                        </div>
                    </div>

                    {logoUrl && (
                        <div className="border rounded-lg p-6 bg-muted/30 flex flex-col items-center">
                            <p className="text-sm font-medium mb-4 self-start">Current Logo Preview:</p>
                            <div className="bg-white p-4 rounded-md shadow-sm border">
                                <img
                                    src={logoUrl}
                                    alt="Footer logo preview"
                                    className="h-24 w-auto object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* About Text */}
            <Card>
                <CardHeader>
                    <CardTitle>About Section</CardTitle>
                    <CardDescription>Footer description text about your business</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="about-text">About Text</Label>
                        <Textarea
                            id="about-text"
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            placeholder="Enter your business description..."
                            rows={4}
                            className="resize-none"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleAboutUpdate} size="sm">Update</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                    <CardDescription>Manage your Facebook and Instagram links</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Facebook */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="facebook-url" className="flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Facebook URL
                            </Label>
                            <Input
                                id="facebook-url"
                                value={facebookUrl}
                                onChange={(e) => handleSocialUpdate('facebook', e.target.value)}
                                placeholder="https://facebook.com/your-page"
                                className="font-body"
                            />
                        </div>

                        {/* Instagram */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="instagram-url" className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-600" />
                                Instagram URL
                            </Label>
                            <Input
                                id="instagram-url"
                                value={instagramUrl}
                                onChange={(e) => handleSocialUpdate('instagram', e.target.value)}
                                placeholder="https://instagram.com/your-profile"
                                className="font-body"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSaveSocials} size="sm">Save Social Links</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FooterCMS;
