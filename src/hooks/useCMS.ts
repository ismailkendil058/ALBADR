import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CMSContent, HeroSlide } from '@/types/cms';

export const useCMSData = () => {
    const [content, setContent] = useState<CMSContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch CMS content from Supabase
    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cms_content')
                .select('*');

            if (error) throw error;

            // Transform database rows into CMSContent structure
            const cmsContent: CMSContent = {
                header: { logo: '', navigation: [], searchPlaceholder: '' },
                footer: {
                    logo: '',
                    aboutText: '',
                    quickLinks: [],
                    socialMedia: [],
                    contactInfo: { address: '', addressLink: '', phone: '', email: '' },
                    copyrightText: '',
                    copyrightSubtext: ''
                },
                hero: { slides: [], autoPlayInterval: 5000 }
            };

            data?.forEach(row => {
                if (row.section === 'header') {
                    cmsContent.header = row.content as any;
                } else if (row.section === 'footer') {
                    cmsContent.footer = row.content as any;
                } else if (row.section === 'hero') {
                    cmsContent.hero = row.content as any;
                } else if (row.section === 'contact') {
                    cmsContent.footer.contactInfo = row.content as any;
                }
            });

            setContent(cmsContent);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching CMS content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update specific section
    const updateSection = async (section: string, sectionContent: any) => {
        try {
            console.log(`[CMS] Updating section: ${section}`, sectionContent);

            // Try updating existing row first
            const { data, error: updateError } = await supabase
                .from('cms_content')
                .update({
                    content: sectionContent,
                    updated_at: new Date().toISOString()
                })
                .eq('section', section)
                .select();

            if (updateError) {
                console.error(`[CMS] Update failed for ${section}:`, updateError);
                throw updateError;
            }

            // If no rows were updated, it means the section doesn't exist yet, so insert it
            if (!data || data.length === 0) {
                console.log(`[CMS] Section ${section} not found, performing insert...`);
                const { error: insertError } = await supabase
                    .from('cms_content')
                    .insert({
                        section,
                        content: sectionContent,
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error(`[CMS] Insert failed for ${section}:`, insertError);
                    throw insertError;
                }
            }

            console.log(`[CMS] Successfully persisted ${section} to database`);
            await fetchContent(); // Refresh global CMS state
            return true;
        } catch (err: any) {
            console.error(`[CMS] Critical failure in ${section}:`, err);
            return false;
        }
    };

    // Upload image to Supabase Storage
    const uploadImage = async (file: File, path: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('cms-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('cms-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err: any) {
            console.error('Error uploading image:', err);
            return null;
        }
    };

    // Delete old image from storage
    const deleteImage = async (url: string) => {
        try {
            // Extract path from URL
            const urlParts = url.split('/cms-images/');
            if (urlParts.length < 2) return;

            const filePath = urlParts[1];
            await supabase.storage
                .from('cms-images')
                .remove([filePath]);
        } catch (err: any) {
            console.error('Error deleting image:', err);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    return {
        content,
        loading,
        error,
        updateSection,
        uploadImage,
        deleteImage,
        refetch: fetchContent
    };
};
