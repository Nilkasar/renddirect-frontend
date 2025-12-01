import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../../lib/api';
import { Property, PropertyFilters } from '../../types';
import { PropertyCard, LoadingSpinner, BackButton } from '../../components/Common';
import { SEOHead, getItemListSchema, getLocalBusinessSchema, getBreadcrumbSchema, getFAQSchema } from '../../components/SEO';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<PropertyFilters>({
    city: searchParams.get('city') || '',
    locality: searchParams.get('locality') || '',
    minRent: searchParams.get('minRent') ? parseInt(searchParams.get('minRent')!) : undefined,
    maxRent: searchParams.get('maxRent') ? parseInt(searchParams.get('maxRent')!) : undefined,
    propertyType: searchParams.get('propertyType') || '',
    roomConfig: searchParams.get('roomConfig') || '',
    furnishing: searchParams.get('furnishing') || '',
  });

  const cities = [
    'Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad',
    'Chennai', 'Kolkata', 'Noida', 'Gurgaon', 'Ahmedabad',
  ];

  const propertyTypes = [
    { value: 'FLAT', label: 'Flat' },
    { value: 'PG', label: 'PG' },
    { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
    { value: 'SHARED_ROOM', label: 'Shared Room' },
  ];

  const roomConfigs = [
    { value: 'SINGLE_ROOM', label: 'Single Room' },
    { value: 'ONE_RK', label: '1 RK' },
    { value: 'ONE_BHK', label: '1 BHK' },
    { value: 'TWO_BHK', label: '2 BHK' },
    { value: 'THREE_BHK', label: '3 BHK' },
    { value: 'THREE_PLUS_BHK', label: '3+ BHK' },
    { value: 'SHARED', label: 'Shared' },
  ];

  const furnishingOptions = [
    { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
    { value: 'SEMI_FURNISHED', label: 'Semi Furnished' },
    { value: 'UNFURNISHED', label: 'Unfurnished' },
  ];

  const budgetRanges = [
    { label: 'Under ₹10,000', min: 0, max: 10000 },
    { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    { label: '₹20,000 - ₹30,000', min: 20000, max: 30000 },
    { label: '₹30,000 - ₹50,000', min: 30000, max: 50000 },
    { label: 'Above ₹50,000', min: 50000, max: undefined },
  ];

  const fetchProperties = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await propertiesAPI.getAll({
        page,
        limit: 12,
        ...filters,
      });

      if (response.data.success) {
        setProperties(response.data.data.items);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v.toString());
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  // Generate SEO content based on filters
  const seoContent = useMemo(() => {
    const city = filters.city || '';
    const propertyType = filters.propertyType || '';
    const roomConfig = filters.roomConfig || '';

    const propertyTypeLabel = propertyTypes.find(t => t.value === propertyType)?.label || '';
    const roomConfigLabel = roomConfigs.find(r => r.value === roomConfig)?.label || '';

    let title = 'Properties for Rent in India';
    let description = 'Find flats, PG, houses & rooms for rent across India. Direct connection with owners, no brokerage.';
    let keywords = 'rent, flat for rent, house rent, room rent, PG rent, no brokerage';

    if (city && propertyType) {
      title = `${propertyTypeLabel} for Rent in ${city}`;
      description = `Find ${propertyTypeLabel.toLowerCase()} for rent in ${city}. ${roomConfigLabel ? roomConfigLabel + ' ' : ''}properties available. Direct owner contact, no brokerage fees.`;
      keywords = `${propertyTypeLabel} rent ${city}, ${city} ${propertyTypeLabel.toLowerCase()}, rent in ${city}`;
    } else if (city) {
      title = `Flats, PG & Houses for Rent in ${city}`;
      description = `Find the best flats, PG accommodations, and houses for rent in ${city}. Browse ${properties.length}+ verified properties. No brokerage, direct owner contact.`;
      keywords = `rent in ${city}, flat rent ${city}, PG ${city}, house rent ${city}, ${city} rental`;
    } else if (propertyType) {
      title = `${propertyTypeLabel} for Rent in India`;
      description = `Search ${propertyTypeLabel.toLowerCase()} for rent across major Indian cities. Verified listings, no brokerage.`;
      keywords = `${propertyTypeLabel} rent, ${propertyTypeLabel.toLowerCase()} for rent India`;
    }

    if (roomConfig) {
      title = `${roomConfigLabel} ${title}`;
      keywords = `${roomConfigLabel} rent, ${keywords}`;
    }

    return { title, description, keywords, city, propertyType };
  }, [filters.city, filters.propertyType, filters.roomConfig, properties.length]);

  // SEO structured data
  const structuredData = useMemo(() => {
    const schemas: object[] = [
      getItemListSchema(properties, seoContent.city, seoContent.propertyType),
    ];

    if (seoContent.city) {
      schemas.push(getLocalBusinessSchema(seoContent.city));
      schemas.push(getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Properties', url: '/properties' },
        { name: seoContent.city, url: `/properties?city=${seoContent.city}` },
      ]));

      // Add FAQ for city pages
      schemas.push(getFAQSchema([
        {
          question: `What is the average rent in ${seoContent.city}?`,
          answer: `The average rent in ${seoContent.city} varies by location and property type. 1BHK apartments typically range from ₹8,000-₹25,000/month, while 2BHK apartments range from ₹15,000-₹45,000/month. PG accommodations start from ₹5,000/month.`,
        },
        {
          question: `How can I find a flat for rent in ${seoContent.city} without brokerage?`,
          answer: `RentDirect24 connects you directly with property owners in ${seoContent.city}, eliminating brokerage fees. Simply browse listings, contact owners directly through our chat feature, and close deals with minimal platform fees.`,
        },
        {
          question: `What documents are required to rent a flat in ${seoContent.city}?`,
          answer: `Typically, you'll need ID proof (Aadhaar/PAN), address proof, employment proof (salary slips/offer letter), and passport-size photos. Some owners may also require a police verification certificate.`,
        },
      ]));
    }

    return schemas;
  }, [properties, seoContent]);

  const canonicalUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (seoContent.city) params.set('city', seoContent.city);
    if (seoContent.propertyType) params.set('propertyType', seoContent.propertyType);
    return `/properties${params.toString() ? '?' + params.toString() : ''}`;
  }, [seoContent]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Head */}
      <SEOHead
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallbackPath="/" variant="light" className="mb-4" />
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Rental</h1>
          <p className="text-primary-100 mb-6">
            Browse properties directly from owners. No brokers, no extra fees.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or locality..."
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* City */}
              <div>
                <label className="label">City</label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="label">Property Type</label>
                <select
                  value={filters.propertyType || ''}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="input"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Room Config */}
              <div>
                <label className="label">BHK</label>
                <select
                  value={filters.roomConfig || ''}
                  onChange={(e) => handleFilterChange('roomConfig', e.target.value)}
                  className="input"
                >
                  <option value="">Any</option>
                  {roomConfigs.map((config) => (
                    <option key={config.value} value={config.value}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Furnishing */}
              <div>
                <label className="label">Furnishing</label>
                <select
                  value={filters.furnishing || ''}
                  onChange={(e) => handleFilterChange('furnishing', e.target.value)}
                  className="input"
                >
                  <option value="">Any</option>
                  {furnishingOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Min Rent */}
              <div>
                <label className="label">Min Rent</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minRent || ''}
                  onChange={(e) => handleFilterChange('minRent', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input"
                />
              </div>

              {/* Max Rent */}
              <div>
                <label className="label">Max Rent</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxRent || ''}
                  onChange={(e) => handleFilterChange('maxRent', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input"
                />
              </div>
            </div>

            {/* Quick Budget Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {budgetRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    handleFilterChange('minRent', range.min);
                    handleFilterChange('maxRent', range.max);
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.minRent === range.min && filters.maxRent === range.max
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search in a different location.
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Showing {properties.length} properties
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} showBookmark />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => fetchProperties(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchProperties(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
