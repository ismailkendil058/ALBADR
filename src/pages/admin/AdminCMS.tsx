import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { useCMS } from '@/context/CMSContext';
import { toast } from 'sonner';
import HeaderCMS from '@/components/admin/cms/HeaderCMS';
import FooterCMS from '@/components/admin/cms/FooterCMS';
import HeroCMS from '@/components/admin/cms/HeroCMS';
import ContactCMS from '@/components/admin/cms/ContactCMS';

const AdminCMS: React.FC = () => {
    const { exportContent, importContent, resetToDefaults } = useCMS();
    const [activeTab, setActiveTab] = useState('header');

    const handleExport = () => {
        const content = exportContent();
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cms-content-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Content exported successfully');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    const success = importContent(content);
                    if (success) {
                        toast.success('Content imported successfully');
                    } else {
                        toast.error('Failed to import content. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all content to defaults? This action cannot be undone.')) {
            resetToDefaults();
            toast.success('Content reset to defaults');
        }
    };

    return (
        <div className="space-y-6" dir="ltr">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your website's dynamic content including header, footer, contact info, and hero carousel
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleImport}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* CMS Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Website Content Sections</CardTitle>
                    <CardDescription>
                        Edit content for different sections of your website. Changes are saved automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="header">Header</TabsTrigger>
                            <TabsTrigger value="footer">Footer</TabsTrigger>
                            <TabsTrigger value="contact">Contact Info</TabsTrigger>
                            <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
                        </TabsList>

                        <TabsContent value="header" className="mt-6">
                            <HeaderCMS />
                        </TabsContent>

                        <TabsContent value="footer" className="mt-6">
                            <FooterCMS />
                        </TabsContent>

                        <TabsContent value="contact" className="mt-6">
                            <ContactCMS />
                        </TabsContent>

                        <TabsContent value="hero" className="mt-6">
                            <HeroCMS />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCMS;
