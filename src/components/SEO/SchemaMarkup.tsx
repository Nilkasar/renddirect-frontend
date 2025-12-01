import { Property } from '../../types';

const BASE_URL = 'https://rentdirect24.com';

// Organization Schema for the website
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RentDirect24',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'India\'s trusted rental platform connecting tenants directly with property owners. No brokerage, verified listings.',
  sameAs: [
    'https://www.facebook.com/rentdirect24',
    'https://www.instagram.com/rentdirect24',
    'https://twitter.com/rentdirect24',
    'https://www.linkedin.com/company/rentdirect24',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
});

// Local Business Schema
export const getLocalBusinessSchema = (city: string) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: `RentDirect24 ${city}`,
  url: `${BASE_URL}/rent/${city.toLowerCase()}/`,
  description: `Find flats, PG, and houses for rent in ${city}. Direct connection with owners, no brokerage.`,
  areaServed: {
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'Country',
      name: 'India',
    },
  },
  priceRange: '₹₹',
});

// Property/RealEstateListing Schema
export const getPropertySchema = (property: Property) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: property.title,
  description: property.description,
  url: `${BASE_URL}/properties/${property.id}`,
  datePosted: property.createdAt,
  image: property.images?.[0] || `${BASE_URL}/default-property.jpg`,
  offers: {
    '@type': 'Offer',
    price: property.rentAmount,
    priceCurrency: 'INR',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: property.rentAmount,
      priceCurrency: 'INR',
      unitText: 'MONTH',
    },
    availability: property.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: property.address,
    addressLocality: property.locality,
    addressRegion: property.city,
    addressCountry: 'IN',
    postalCode: property.pincode,
  },
  geo: {
    '@type': 'GeoCoordinates',
    // Add lat/long if available
  },
  numberOfRooms: getRoomCount(property.roomConfig),
  numberOfBathroomsTotal: property.bathrooms,
  floorSize: property.squareFeet ? {
    '@type': 'QuantitativeValue',
    value: property.squareFeet,
    unitCode: 'SQF',
  } : undefined,
  amenityFeature: property.amenities?.map(amenity => ({
    '@type': 'LocationFeatureSpecification',
    name: amenity,
  })),
});

// Product Schema (alternative for property)
export const getProductSchema = (property: Property) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: property.title,
  description: property.description,
  image: property.images?.[0] || `${BASE_URL}/default-property.jpg`,
  brand: {
    '@type': 'Brand',
    name: 'RentDirect24',
  },
  offers: {
    '@type': 'Offer',
    url: `${BASE_URL}/properties/${property.id}`,
    price: property.rentAmount,
    priceCurrency: 'INR',
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    availability: property.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'RentDirect24',
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: property.viewCount || 1,
  },
});

// Breadcrumb Schema
export const getBreadcrumbSchema = (breadcrumbs: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `${BASE_URL}${crumb.url}`,
  })),
});

// FAQ Schema for landing pages
export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Search Action Schema for homepage
export const getSearchActionSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RentDirect24',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/properties?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// Item List Schema for property listings
export const getItemListSchema = (properties: Property[], city?: string, propertyType?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: city
    ? `Properties for Rent in ${city}`
    : propertyType
      ? `${formatPropertyType(propertyType)} for Rent`
      : 'Properties for Rent in India',
  numberOfItems: properties.length,
  itemListElement: properties.slice(0, 10).map((property, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'RealEstateListing',
      name: property.title,
      url: `${BASE_URL}/properties/${property.id}`,
      image: property.images?.[0],
      offers: {
        '@type': 'Offer',
        price: property.rentAmount,
        priceCurrency: 'INR',
      },
    },
  })),
});

// Helper functions
const getRoomCount = (roomConfig: string): number => {
  const roomCounts: Record<string, number> = {
    SINGLE_ROOM: 1,
    ONE_RK: 1,
    ONE_BHK: 2,
    TWO_BHK: 3,
    THREE_BHK: 4,
    THREE_PLUS_BHK: 5,
    SHARED: 1,
  };
  return roomCounts[roomConfig] || 1;
};

const formatPropertyType = (type: string): string => {
  const types: Record<string, string> = {
    FLAT: 'Flats',
    PG: 'PG Accommodations',
    INDEPENDENT_HOUSE: 'Independent Houses',
    SHARED_ROOM: 'Shared Rooms',
  };
  return types[type] || type;
};

// Export all city-related SEO data
export const CITIES = [
  'Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Noida', 'Gurgaon', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh',
  'Indore', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai',
];

export const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Flat', urlSlug: 'flat' },
  { value: 'PG', label: 'PG', urlSlug: 'pg' },
  { value: 'INDEPENDENT_HOUSE', label: 'House', urlSlug: 'house' },
  { value: 'SHARED_ROOM', label: 'Shared Room', urlSlug: 'shared-room' },
];

export const ROOM_CONFIGS = [
  { value: 'ONE_RK', label: '1 RK', urlSlug: '1rk' },
  { value: 'ONE_BHK', label: '1 BHK', urlSlug: '1bhk' },
  { value: 'TWO_BHK', label: '2 BHK', urlSlug: '2bhk' },
  { value: 'THREE_BHK', label: '3 BHK', urlSlug: '3bhk' },
  { value: 'THREE_PLUS_BHK', label: '3+ BHK', urlSlug: '3plus-bhk' },
];
