/**
 * CMS Content Types
 * Centralized type definitions for all dynamic website content
 */

export interface HeaderContent {
    logo: string;
    navigation: NavigationItem[];
    searchPlaceholder: string;
}

export interface NavigationItem {
    id: string;
    label: string;
    href: string;
    order: number;
}

export interface FooterContent {
    logo: string;
    aboutText: string;
    quickLinks: QuickLink[];
    contactInfo: ContactInfo;
    socialMedia: SocialMediaLink[];
    copyrightText: string;
    copyrightSubtext: string;
}

export interface QuickLink {
    id: string;
    label: string;
    href: string;
    order: number;
}

export interface ContactInfo {
    address: string;
    addressLink: string;
    phone: string;
    email: string;
    mapEmbed?: string;
}

export interface SocialMediaLink {
    id: string;
    platform: 'facebook' | 'instagram';
    url: string;
    order: number;
}

export interface HeroSlide {
    id: string;
    image: string;
    title: string;
    ctaText: string;
    ctaLink: string;
    order: number;
    isActive: boolean;
}

export interface CMSContent {
    header: HeaderContent;
    footer: FooterContent;
    hero: {
        slides: HeroSlide[];
        autoPlayInterval: number; // in milliseconds
    };
}

// Default content structure
export const defaultCMSContent: CMSContent = {
    header: {
        logo: '/Al Badr Logo HQ Transparent.png',
        navigation: [
            { id: '1', label: 'الرئيسية', href: '/', order: 1 },
            { id: '2', label: 'من نحن', href: '/about', order: 2 },
            { id: '3', label: 'اتصل بنا', href: '/contact', order: 3 },
        ],
        searchPlaceholder: 'البحث في المنتجات...',
    },
    footer: {
        logo: '/Al Badr Logo HQ Transparent.png',
        aboutText: 'طاحونة البدر هي وجهتكم الأولى للتوابل والأعشاب الطبيعية. نقدم لكم منتجات أصيلة بجودة عالية من الجزائر، مع التزامنا بالمحافظة على الطرق التقليدية في التحضير.',
        quickLinks: [
            { id: '1', label: 'الرئيسية', href: '/', order: 1 },
            { id: '2', label: 'التوابل', href: '#spices', order: 2 },
            { id: '3', label: 'الأعشاب', href: '#herbs', order: 3 },
            { id: '4', label: 'من نحن', href: '#about', order: 4 },
            { id: '5', label: 'اتصل بنا', href: '#contact', order: 5 },
        ],
        contactInfo: {
            address: 'Laghouat, Algeria',
            addressLink: 'https://maps.app.goo.gl/N45Q79s4Xfm2tFm69?g_st=ipc',
            phone: '0660 40 85 20',
            email: 'moulinalbadr@gmail.com',
        },
        socialMedia: [
            { id: '1', platform: 'facebook', url: 'https://www.facebook.com/share/1WDFD5GEc9/?mibextid=wwXIfr', order: 1 },
            { id: '2', platform: 'instagram', url: 'https://www.instagram.com/moulin_albadr?igsh=bnRweGF5a2pqZmN4', order: 2 },
        ],
        copyrightText: '© {year} طاحونة البدر. جميع الحقوق محفوظة.',
        copyrightSubtext: 'Tous droits réservés - Tahounat Al Badr',
    },
    hero: {
        slides: [],
        autoPlayInterval: 5000,
    },
};
