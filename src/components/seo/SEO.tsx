import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogType?: string;
    ogImage?: string;
    twitterHandle?: string;
    noIndex?: boolean;
}

/**
 * SEO Infrastructure Component
 * Future-ready implementation for dynamic meta tags and social sharing.
 * Integrates with CMS content for crawlable, non-hardcoded metadata.
 */
const SEO: React.FC<SEOProps> = ({
    title,
    description,
    canonical,
    ogType = 'website',
    ogImage,
    twitterHandle = '@tahounat_albadr',
    noIndex = false,
}) => {
    const siteName = 'طاحونة البدر';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const siteUrl = window.location.origin;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`} />}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={fullTitle} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:type" content={ogType} />
            {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />}
            <meta property="og:url" content={window.location.href} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            {description && <meta name="twitter:description" content={description} />}
            {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />}
            <meta name="twitter:site" content={twitterHandle} />
        </Helmet>
    );
};

export default SEO;
