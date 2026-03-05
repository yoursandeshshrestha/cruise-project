import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.simplecruiseparking.com';
const SITE_NAME = 'Simple Cruise Parking';
const DEFAULT_OG_IMAGE = `${SITE_URL}/homepage-hero.jpg`;

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  schemaMarkup?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: BreadcrumbItem[];
}

const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  schemaMarkup,
  breadcrumbs,
}) => {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const schemaArray = schemaMarkup
    ? Array.isArray(schemaMarkup) ? schemaMarkup : [schemaMarkup]
    : [];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemaArray.push(buildBreadcrumbSchema(breadcrumbs));
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Hreflang for UK targeting */}
      <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schemaArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
