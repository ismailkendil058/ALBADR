import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JSONLDProps {
    data: Record<string, any>;
}

/**
 * JSONLD Infrastructure Component
 * Prepares the application for Rich Results (Schema.org).
 * Allows dynamic injection of structured data without cluttering main components.
 */
const JSONLD: React.FC<JSONLDProps> = ({ data }) => {
    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    ...data,
                })}
            </script>
        </Helmet>
    );
};

export default JSONLD;
