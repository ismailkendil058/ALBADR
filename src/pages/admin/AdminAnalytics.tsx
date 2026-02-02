import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { settingsService } from '@/services/settingsService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Activity } from 'lucide-react';

const analyticsSchema = z.object({
    facebookPixelId: z.string().optional(),
    tiktokPixelId: z.string().optional(),
});

type AnalyticsFormValues = z.infer<typeof analyticsSchema>;

const AdminAnalytics = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<AnalyticsFormValues>({
        resolver: zodResolver(analyticsSchema),
        defaultValues: {
            facebookPixelId: '',
            tiktokPixelId: '',
        },
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await settingsService.getSettings();
                const fbPixel = settings.find(s => s.key === 'facebook_pixel_id')?.value || '';
                const tiktokPixel = settings.find(s => s.key === 'tiktok_pixel_id')?.value || '';

                form.reset({
                    facebookPixelId: fbPixel,
                    tiktokPixelId: tiktokPixel,
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load analytics settings.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [form, toast]);

    const onSubmit = async (data: AnalyticsFormValues) => {
        setIsSaving(true);
        try {
            await settingsService.updateSettings([
                { key: 'facebook_pixel_id', value: data.facebookPixelId || '' },
                { key: 'tiktok_pixel_id', value: data.tiktokPixelId || '' },
            ]);
            toast({
                title: "Success",
                description: "Analytics settings updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics & Tracking</h1>
                <p className="text-muted-foreground">
                    Manage your tracking pixels and analytics integrations.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Tracking Pixels
                    </CardTitle>
                    <CardDescription>
                        Enter your pixel IDs below. These will be automatically injected into your store's pages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="facebookPixelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facebook Pixel ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 123456789012345" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Your dedicated Facebook Pixel ID. Found in Events Manager.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tiktokPixelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TikTok Pixel ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. C123456789ABCDEF" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Your TikTok Pixel ID. Found in TikTok Ads Manager.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAnalytics;
