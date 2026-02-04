/**
 * CMS Integration Examples
 * 
 * This file demonstrates how to update existing components to use CMS data.
 * Copy the relevant code snippets to your components.
 */

import { useCMS } from '@/context/CMSContext';

// ============================================================================
// EXAMPLE 1: Header Component Integration
// ============================================================================

/**
 * Update Header.tsx to use CMS data for logo and search placeholder
 */
export const HeaderExample = () => {
    const { content } = useCMS();

    return (
        <header>
            {/* Dynamic Logo */}
            <img
                src={content.header.logo}
                alt="Logo"
            />

            {/* Dynamic Search Placeholder */}
            <input
                type="text"
                placeholder={content.header.searchPlaceholder}
            />

            {/* Dynamic Navigation Links */}
            <nav>
                {content.header.navigation
                    .sort((a, b) => a.order - b.order)
                    .map(item => (
                        <a key={item.id} href={item.href}>
                            {item.label}
                        </a>
                    ))}
            </nav>
        </header>
    );
};

// ============================================================================
// EXAMPLE 2: Footer Component Integration
// ============================================================================

/**
 * Update Footer.tsx to use CMS data
 */
export const FooterExample = () => {
    const { content } = useCMS();
    const { footer } = content;

    return (
        <footer>
            {/* Dynamic Footer Logo */}
            <img src={footer.logo} alt="Footer Logo" />

            {/* Dynamic About Text */}
            <p>{footer.aboutText}</p>

            {/* Dynamic Quick Links */}
            <div>
                <h3>Quick Links</h3>
                <ul>
                    {footer.quickLinks
                        .sort((a, b) => a.order - b.order)
                        .map(link => (
                            <li key={link.id}>
                                <a href={link.href}>{link.label}</a>
                            </li>
                        ))}
                </ul>
            </div>

            {/* Dynamic Contact Info */}
            <div>
                <h3>Contact Us</h3>
                <p>
                    <a href={footer.contactInfo.addressLink} target="_blank" rel="noopener noreferrer">
                        {footer.contactInfo.address}
                    </a>
                </p>
                <p>
                    <a href={`tel:${footer.contactInfo.phone}`}>
                        {footer.contactInfo.phone}
                    </a>
                </p>
                <p>
                    <a href={`mailto:${footer.contactInfo.email}`}>
                        {footer.contactInfo.email}
                    </a>
                </p>
            </div>

            {/* Dynamic Social Media */}
            <div>
                {footer.socialMedia
                    .sort((a, b) => a.order - b.order)
                    .map(social => (
                        <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.platform}
                        >
                            {/* Render appropriate icon based on platform */}
                            {social.platform}
                        </a>
                    ))}
            </div>

            {/* Dynamic Copyright with Auto-Year */}
            <div>
                <p>{footer.copyrightText.replace('{year}', new Date().getFullYear().toString())}</p>
                <p>{footer.copyrightSubtext}</p>
            </div>
        </footer>
    );
};

// ============================================================================
// EXAMPLE 3: Hero Slider Component Integration
// ============================================================================

/**
 * Update HeroSlider.tsx to use CMS data
 */
export const HeroSliderExample = () => {
    const { content } = useCMS();
    const { hero } = content;

    // Filter only active slides and sort by order
    const activeSlides = hero.slides
        .filter(slide => slide.isActive)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="hero-slider">
            {activeSlides.map((slide) => (
                <div key={slide.id} className="slide">
                    {/* Dynamic Slide Image */}
                    <img src={slide.image} alt={slide.title} />

                    {/* Dynamic Slide Content */}
                    <div className="slide-content">
                        <h2>{slide.title}</h2>

                        {/* Dynamic CTA Button */}
                        <a href={slide.ctaLink}>
                            {slide.ctaText}
                        </a>
                    </div>
                </div>
            ))}

            {/* Use dynamic auto-play interval */}
            {/* setInterval(() => nextSlide(), hero.autoPlayInterval) */}
        </div>
    );
};

// ============================================================================
// EXAMPLE 4: Social Media Icon Mapping
// ============================================================================

import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

export const SocialMediaIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
};

/**
 * Render social media icons dynamically
 */
export const SocialMediaLinksExample = () => {
    const { content } = useCMS();

    return (
        <div className="social-links">
            {content.footer.socialMedia
                .sort((a, b) => a.order - b.order)
                .map(social => {
                    const Icon = SocialMediaIcons[social.platform];
                    return (
                        <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.platform}
                        >
                            {Icon && <Icon className="w-5 h-5" />}
                        </a>
                    );
                })}
        </div>
    );
};

// ============================================================================
// EXAMPLE 5: Contact Page Integration
// ============================================================================

/**
 * Use contact info in Contact page
 */
export const ContactPageExample = () => {
    const { content } = useCMS();
    const { contactInfo } = content.footer;

    return (
        <div className="contact-page">
            <h1>Contact Us</h1>

            {/* Address */}
            <div>
                <h3>Address</h3>
                <a href={contactInfo.addressLink} target="_blank" rel="noopener noreferrer">
                    {contactInfo.address}
                </a>
            </div>

            {/* Phone */}
            <div>
                <h3>Phone</h3>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
            </div>

            {/* Email */}
            <div>
                <h3>Email</h3>
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </div>

            {/* Optional Map Embed */}
            {contactInfo.mapEmbed && (
                <div
                    className="map-container"
                    dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbed }}
                />
            )}
        </div>
    );
};

// ============================================================================
// EXAMPLE 6: Programmatic Updates
// ============================================================================

/**
 * Example of updating CMS content programmatically
 */
export const ProgrammaticUpdateExample = () => {
    const {
        updateHeaderLogo,
        updateHeroSlides,
        addHeroSlide,
        content
    } = useCMS();

    const handleUpdateLogo = () => {
        updateHeaderLogo('/new-logo.png');
    };

    const handleAddSlide = () => {
        addHeroSlide({
            image: '/new-slide.jpg',
            title: 'New Slide Title',
            ctaText: 'Shop Now',
            ctaLink: '/products',
            order: content.hero.slides.length + 1,
            isActive: true,
        });
    };

    return (
        <div>
            <button onClick={handleUpdateLogo}>Update Logo</button>
            <button onClick={handleAddSlide}>Add Slide</button>
        </div>
    );
};

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

/**
 * To integrate CMS into your existing components:
 * 
 * 1. Import useCMS hook:
 *    import { useCMS } from '@/context/CMSContext';
 * 
 * 2. Get content from context:
 *    const { content } = useCMS();
 * 
 * 3. Replace hardcoded values with CMS data:
 *    - Logo: content.header.logo or content.footer.logo
 *    - Navigation: content.header.navigation
 *    - Search: content.header.searchPlaceholder
 *    - About: content.footer.aboutText
 *    - Quick Links: content.footer.quickLinks
 *    - Contact: content.footer.contactInfo
 *    - Social: content.footer.socialMedia
 *    - Copyright: content.footer.copyrightText
 *    - Hero Slides: content.hero.slides
 *    - Auto-play: content.hero.autoPlayInterval
 * 
 * 4. Sort arrays by order property:
 *    .sort((a, b) => a.order - b.order)
 * 
 * 5. Filter active items (for hero slides):
 *    .filter(slide => slide.isActive)
 * 
 * 6. Handle dynamic year in copyright:
 *    copyrightText.replace('{year}', new Date().getFullYear().toString())
 */

// ============================================================================
// TYPESCRIPT TYPES REFERENCE
// ============================================================================

/**
 * Available CMS types (from src/types/cms.ts):
 * 
 * - CMSContent: Main content structure
 * - HeaderContent: Header section data
 * - FooterContent: Footer section data
 * - ContactInfo: Contact information
 * - HeroSlide: Individual carousel slide
 * - NavigationItem: Navigation link
 * - QuickLink: Footer quick link
 * - SocialMediaLink: Social media profile
 */

// ============================================================================
// CONTEXT METHODS REFERENCE
// ============================================================================

/**
 * Available update methods from useCMS():
 * 
 * Header:
 * - updateHeaderLogo(logo: string)
 * - updateNavigation(navigation: NavigationItem[])
 * - updateSearchPlaceholder(placeholder: string)
 * 
 * Footer:
 * - updateFooterLogo(logo: string)
 * - updateFooterAbout(text: string)
 * - updateQuickLinks(links: QuickLink[])
 * - updateSocialMedia(social: SocialMediaLink[])
 * - updateCopyright(text: string, subtext: string)
 * 
 * Contact:
 * - updateContactInfo(info: Partial<ContactInfo>)
 * 
 * Hero:
 * - updateHeroSlides(slides: HeroSlide[])
 * - updateHeroInterval(interval: number)
 * - addHeroSlide(slide: Omit<HeroSlide, 'id'>)
 * - removeHeroSlide(id: string)
 * - reorderHeroSlides(slides: HeroSlide[])
 * 
 * Utility:
 * - resetToDefaults()
 * - exportContent(): string
 * - importContent(jsonString: string): boolean
 */

export default {
    HeaderExample,
    FooterExample,
    HeroSliderExample,
    SocialMediaLinksExample,
    ContactPageExample,
    ProgrammaticUpdateExample,
};
