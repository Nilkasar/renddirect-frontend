import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object | object[];
}

const SITE_NAME = 'RentDirect24';
const BASE_URL = 'https://rentdirect24.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'Find flats, PG, houses & rooms for rent across India. Direct connection with owners, no brokerage. Search 1BHK, 2BHK, 3BHK, studio apartments in Mumbai, Pune, Bangalore, Delhi & more.',
  keywords = 'rent, flat for rent, house rent, room rent, 1BHK rent, 2BHK rent, PG rent, studio apartment, no brokerage, direct owner',
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Find Flats, PG & Houses for Rent | No Brokerage`;
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : undefined;

  // Handle both single object and array of structured data
  const renderStructuredData = () => {
    if (!structuredData) return null;

    const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];

    return dataArray.map((data, index) => (
      <script
        key={index}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    ));
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Tags */}
      <meta name="author" content={SITE_NAME} />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="language" content="English" />

      {/* Structured Data */}
      {renderStructuredData()}
    </Helmet>
  );
};

export default SEOHead;
