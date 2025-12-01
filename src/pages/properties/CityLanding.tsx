import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { propertiesAPI } from '../../lib/api';
import { Property } from '../../types';
import { PropertyCard, LoadingSpinner } from '../../components/Common';
import {
  SEOHead,
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getItemListSchema,
  CITIES,
} from '../../components/SEO';
import {
  MapPin, Search, Home, Building2, Users,
  ChevronRight, TrendingUp, Shield, IndianRupee, Star,
  ArrowRight, CheckCircle
} from 'lucide-react';

// City images from Unsplash
const cityImages: Record<string, string> = {
  Mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80',
  Bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80',
  Pune: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80',
  Delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
  Hyderabad: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200&q=80',
  Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
  Kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80',
  Noida: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=1200&q=80',
  Gurgaon: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1200&q=80',
  Ahmedabad: 'https://images.unsplash.com/photo-1609948543911-7d31cd272cd4?w=1200&q=80',
};

// City-specific content
const cityContent: Record<string, { tagline: string; highlights: string[]; avgRent: string }> = {
  Mumbai: {
    tagline: 'Find Your Dream Home in the City of Dreams',
    highlights: ['Andheri', 'Bandra', 'Powai', 'Thane', 'Navi Mumbai'],
    avgRent: '₹15,000 - ₹50,000',
  },
  Bangalore: {
    tagline: 'Rent in India\'s Silicon Valley',
    highlights: ['Koramangala', 'HSR Layout', 'Whitefield', 'Indiranagar', 'Electronic City'],
    avgRent: '₹12,000 - ₹45,000',
  },
  Pune: {
    tagline: 'Affordable Living in the Oxford of the East',
    highlights: ['Kothrud', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Baner'],
    avgRent: '₹8,000 - ₹35,000',
  },
  Delhi: {
    tagline: 'Rent in the Heart of India',
    highlights: ['South Delhi', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj'],
    avgRent: '₹12,000 - ₹60,000',
  },
  Hyderabad: {
    tagline: 'Affordable Rentals in the City of Pearls',
    highlights: ['Gachibowli', 'Madhapur', 'Kondapur', 'Hitech City', 'Jubilee Hills'],
    avgRent: '₹10,000 - ₹40,000',
  },
  Chennai: {
    tagline: 'Find Your Home in the Gateway to South India',
    highlights: ['OMR', 'Velachery', 'Adyar', 'Anna Nagar', 'Tambaram'],
    avgRent: '₹10,000 - ₹35,000',
  },
};

const CityLanding: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Normalize city name
  const normalizedCity = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : '';

  useEffect(() => {
    if (!normalizedCity || !CITIES.includes(normalizedCity)) {
      navigate('/properties');
      return;
    }

    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await propertiesAPI.getAll({
          city: normalizedCity,
          limit: 9,
        });
        if (response.data.success) {
          setProperties(response.data.data.items);
          setTotalCount(response.data.data.total);
        }
      } catch (error) {
        console.error('Failed to fetch properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [normalizedCity, navigate]);

  const content = cityContent[normalizedCity] || {
    tagline: `Find Your Perfect Rental in ${normalizedCity}`,
    highlights: [],
    avgRent: '₹10,000 - ₹40,000',
  };

  const cityImage = cityImages[normalizedCity] || cityImages.Mumbai;

  // SEO content
  const seoTitle = `Flats, PG & Houses for Rent in ${normalizedCity} | No Brokerage`;
  const seoDescription = `Find ${totalCount}+ verified flats, PG accommodations, and houses for rent in ${normalizedCity}. Direct owner contact, no brokerage fees. 1BHK, 2BHK, 3BHK apartments available. Save up to ₹49,000 on broker fees!`;
  const seoKeywords = `rent in ${normalizedCity}, flat for rent ${normalizedCity}, ${normalizedCity} rental, PG in ${normalizedCity}, house rent ${normalizedCity}, 1BHK ${normalizedCity}, 2BHK ${normalizedCity}, no broker ${normalizedCity}`;

  // FAQ for this city
  const faqs = [
    {
      question: `What is the average rent for a flat in ${normalizedCity}?`,
      answer: `The average rent in ${normalizedCity} varies by location and apartment size. 1BHK flats typically range from ₹8,000-₹25,000/month, 2BHK from ₹15,000-₹45,000/month, and 3BHK from ₹25,000-₹70,000/month. Popular areas like ${content.highlights.slice(0, 2).join(' and ')} tend to be on the higher end.`,
    },
    {
      question: `How can I rent a flat in ${normalizedCity} without paying brokerage?`,
      answer: `RentDirect24 connects you directly with property owners in ${normalizedCity}. Browse our verified listings, chat with owners through our platform, and finalize your rental agreement. You only pay a small success fee (₹299-₹999) instead of traditional broker charges of 1-2 months rent.`,
    },
    {
      question: `Which are the best areas to rent in ${normalizedCity}?`,
      answer: `Popular rental localities in ${normalizedCity} include ${content.highlights.join(', ')}. Each area has its own advantages - some offer better connectivity to IT hubs, others have more affordable options or better amenities.`,
    },
    {
      question: `What documents do I need to rent a flat in ${normalizedCity}?`,
      answer: `To rent a flat in ${normalizedCity}, you typically need: 1) Government ID proof (Aadhaar/Passport/PAN), 2) Address proof, 3) Employment proof or salary slips, 4) Passport-size photographs, and 5) Police verification certificate (in some cases).`,
    },
  ];

  const structuredData = [
    getLocalBusinessSchema(normalizedCity),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Properties', url: '/properties' },
      { name: normalizedCity, url: `/rent/${normalizedCity.toLowerCase()}` },
    ]),
    getFAQSchema(faqs),
    getItemListSchema(properties, normalizedCity),
  ];

  const propertyTypes = [
    { icon: Home, label: 'Flats', value: 'FLAT', count: Math.floor(totalCount * 0.5) },
    { icon: Building2, label: 'PG', value: 'PG', count: Math.floor(totalCount * 0.25) },
    { icon: Users, label: 'Shared', value: 'SHARED_ROOM', count: Math.floor(totalCount * 0.15) },
    { icon: Home, label: 'Houses', value: 'INDEPENDENT_HOUSE', count: Math.floor(totalCount * 0.1) },
  ];

  const bhkTypes = [
    { label: '1 RK', value: 'ONE_RK' },
    { label: '1 BHK', value: 'ONE_BHK' },
    { label: '2 BHK', value: 'TWO_BHK' },
    { label: '3 BHK', value: 'THREE_BHK' },
    { label: '3+ BHK', value: 'THREE_PLUS_BHK' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Head */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`/rent/${normalizedCity.toLowerCase()}`}
        ogImage={cityImage}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={cityImage}
            alt={`${normalizedCity} cityscape`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/properties" className="hover:text-white transition-colors">Properties</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">{normalizedCity}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4 text-primary-400" />
              <span className="text-white text-sm">{totalCount}+ Properties Available</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Rent in {normalizedCity}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              {content.tagline}
            </p>

            {/* Search Box */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 max-w-3xl shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search localities in ${normalizedCity}...`}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <Link
                  to={`/properties?city=${normalizedCity}`}
                  className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Search
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary-600 mb-1">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{totalCount}+</span>
              </div>
              <p className="text-gray-600 text-sm">Active Listings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <Shield className="h-5 w-5" />
                <span className="text-2xl font-bold">100%</span>
              </div>
              <p className="text-gray-600 text-sm">Verified Properties</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <IndianRupee className="h-5 w-5" />
                <span className="text-2xl font-bold">₹0</span>
              </div>
              <p className="text-gray-600 text-sm">Brokerage Fees</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                <Star className="h-5 w-5" />
                <span className="text-2xl font-bold">{content.avgRent}</span>
              </div>
              <p className="text-gray-600 text-sm">Avg. Monthly Rent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse by Property Type in {normalizedCity}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <Link
                key={type.value}
                to={`/properties?city=${normalizedCity}&propertyType=${type.value}`}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <type.icon className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900">{type.label} for Rent</h3>
                <p className="text-sm text-gray-500">{type.count}+ properties</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BHK Types */}
      <section className="py-8 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Search by BHK</h2>
          <div className="flex flex-wrap gap-3">
            {bhkTypes.map((bhk) => (
              <Link
                key={bhk.value}
                to={`/properties?city=${normalizedCity}&roomConfig=${bhk.value}`}
                className="px-6 py-3 bg-white rounded-xl font-medium text-gray-700 hover:bg-primary-600 hover:text-white transition-all shadow-sm hover:shadow-md"
              >
                {bhk.label} in {normalizedCity}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Localities */}
      {content.highlights.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Popular Localities in {normalizedCity}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {content.highlights.map((locality) => (
                <Link
                  key={locality}
                  to={`/properties?city=${normalizedCity}&locality=${locality}`}
                  className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span className="font-medium text-gray-800">{locality}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Properties in {normalizedCity}
            </h2>
            <Link
              to={`/properties?city=${normalizedCity}`}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} showBookmark />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No properties available in {normalizedCity} yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions About Renting in {normalizedCity}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 pl-7">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Home in {normalizedCity}?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Browse {totalCount}+ verified properties and connect directly with owners.
          </p>
          <Link
            to={`/properties?city=${normalizedCity}`}
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Search className="h-5 w-5" />
            Start Searching
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Other Cities */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Explore Other Cities</h2>
          <div className="flex flex-wrap gap-3">
            {CITIES.filter(c => c !== normalizedCity).slice(0, 10).map((c) => (
              <Link
                key={c}
                to={`/rent/${c.toLowerCase()}`}
                className="px-4 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg transition-colors"
              >
                Rent in {c}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityLanding;
