import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CMSContent, defaultCMSContent, HeroSlide, NavigationItem, QuickLink, SocialMediaLink } from '@/types/cms';
import { useCMSData } from '@/hooks/useCMS';

interface CMSContextType {
    content: CMSContent;
    loading: boolean;
    updateHeaderLogo: (logo: string) => Promise<void>;
    updateNavigation: (navigation: NavigationItem[]) => void;
    updateSearchPlaceholder: (placeholder: string) => void;
    updateFooterLogo: (logo: string) => Promise<void>;
    updateFooterAbout: (text: string) => void;
    updateQuickLinks: (links: QuickLink[]) => void;
    updateContactInfo: (info: Partial<CMSContent['footer']['contactInfo']>) => void;
    updateSocialMedia: (social: SocialMediaLink[]) => void;
    updateCopyright: (text: string, subtext: string) => void;
    updateHeroSlides: (slides: HeroSlide[]) => Promise<void>;
    updateHeroInterval: (interval: number) => void;
    addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<boolean>;
    removeHeroSlide: (id: string) => Promise<void>;
    reorderHeroSlides: (slides: HeroSlide[]) => Promise<void>;
    resetToDefaults: () => void;
    exportContent: () => string;
    importContent: (jsonString: string) => boolean;
    uploadImage: (file: File, path: string) => Promise<string | null>;
    deleteImage: (url: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { content: dbContent, loading, updateSection, uploadImage, deleteImage, refetch } = useCMSData();
    const [content, setContent] = useState<CMSContent>(defaultCMSContent);

    // Sync database content with local state
    useEffect(() => {
        if (dbContent) {
            setContent(dbContent);
        }
    }, [dbContent]);

    const updateHeaderLogo = async (logo: string) => {
        const updated = { ...content.header, logo };
        setContent(prev => ({ ...prev, header: updated }));
        await updateSection('header', updated);
    };

    const updateNavigation = (navigation: NavigationItem[]) => {
        const updated = { ...content.header, navigation };
        setContent(prev => ({ ...prev, header: updated }));
        updateSection('header', updated);
    };

    const updateSearchPlaceholder = (placeholder: string) => {
        const updated = { ...content.header, searchPlaceholder: placeholder };
        setContent(prev => ({ ...prev, header: updated }));
        updateSection('header', updated);
    };

    const updateFooterLogo = async (logo: string) => {
        const updated = { ...content.footer, logo };
        setContent(prev => ({ ...prev, footer: updated }));
        await updateSection('footer', updated);
    };

    const updateFooterAbout = (text: string) => {
        const updated = { ...content.footer, aboutText: text };
        setContent(prev => ({ ...prev, footer: updated }));
        updateSection('footer', updated);
    };

    const updateQuickLinks = (links: QuickLink[]) => {
        const updated = { ...content.footer, quickLinks: links };
        setContent(prev => ({ ...prev, footer: updated }));
        updateSection('footer', updated);
    };

    const updateContactInfo = (info: Partial<CMSContent['footer']['contactInfo']>) => {
        const updated = {
            ...content.footer,
            contactInfo: { ...content.footer.contactInfo, ...info }
        };
        setContent(prev => ({ ...prev, footer: updated }));
        updateSection('footer', updated);
    };

    const updateSocialMedia = (social: SocialMediaLink[]) => {
        const updated = { ...content.footer, socialMedia: social };
        setContent(prev => ({ ...prev, footer: updated }));
        updateSection('footer', updated);
    };

    const updateCopyright = (text: string, subtext: string) => {
        const updated = { ...content.footer, copyrightText: text, copyrightSubtext: subtext };
        setContent(prev => ({ ...prev, footer: updated }));
        updateSection('footer', updated);
    };

    const updateHeroSlides = async (slides: HeroSlide[]) => {
        const updated = { ...content.hero, slides };
        const success = await updateSection('hero', updated);
        if (success) {
            setContent(prev => ({ ...prev, hero: updated }));
        } else {
            // Re-fetch to sync with DB since update failed
            await refetch();
        }
    };

    const updateHeroInterval = (interval: number) => {
        const updated = { ...content.hero, autoPlayInterval: interval };
        setContent(prev => ({ ...prev, hero: updated }));
        updateSection('hero', updated);
    };

    const addHeroSlide = async (slide: Omit<HeroSlide, 'id'>) => {
        const newSlide: HeroSlide = {
            ...slide,
            id: Date.now().toString(),
        };
        const updated = {
            ...content.hero,
            slides: [...content.hero.slides, newSlide]
        };

        const success = await updateSection('hero', updated);
        if (success) {
            setContent(prev => ({ ...prev, hero: updated }));
            return true;
        } else {
            await refetch();
            return false;
        }
    };

    const removeHeroSlide = async (id: string) => {
        const updated = {
            ...content.hero,
            slides: content.hero.slides.filter(slide => slide.id !== id)
        };
        const success = await updateSection('hero', updated);
        if (success) {
            setContent(prev => ({ ...prev, hero: updated }));
        } else {
            await refetch();
        }
    };

    const reorderHeroSlides = async (slides: HeroSlide[]) => {
        const updated = { ...content.hero, slides };
        const success = await updateSection('hero', updated);
        if (success) {
            setContent(prev => ({ ...prev, hero: updated }));
        } else {
            await refetch();
        }
    };

    const resetToDefaults = () => {
        setContent(defaultCMSContent);
        updateSection('header', defaultCMSContent.header);
        updateSection('footer', defaultCMSContent.footer);
        updateSection('hero', defaultCMSContent.hero);
    };

    const exportContent = () => {
        return JSON.stringify(content, null, 2);
    };

    const importContent = (jsonString: string): boolean => {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.header && parsed.footer && parsed.hero) {
                setContent(parsed);
                updateSection('header', parsed.header);
                updateSection('footer', parsed.footer);
                updateSection('hero', parsed.hero);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import content:', error);
            return false;
        }
    };

    return (
        <CMSContext.Provider
            value={{
                content,
                loading,
                updateHeaderLogo,
                updateNavigation,
                updateSearchPlaceholder,
                updateFooterLogo,
                updateFooterAbout,
                updateQuickLinks,
                updateContactInfo,
                updateSocialMedia,
                updateCopyright,
                updateHeroSlides,
                updateHeroInterval,
                addHeroSlide,
                removeHeroSlide,
                reorderHeroSlides,
                resetToDefaults,
                exportContent,
                importContent,
                uploadImage,
                deleteImage,
            }}
        >
            {children}
        </CMSContext.Provider>
    );
};

export const useCMS = () => {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMS must be used within a CMSProvider');
    }
    return context;
};
