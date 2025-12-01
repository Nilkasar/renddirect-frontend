import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Shield,
  IndianRupee,
  MessageSquare,
  Users,
  CheckCircle,
  MapPin,
  Home as HomeIcon,
  Bed,
  Bath,
  ChevronRight,
  Star,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { propertiesAPI } from '../lib/api';
import { Property } from '../types';
import { SEOHead, getOrganizationSchema, getSearchActionSchema } from '../components/SEO';

// City images from Unsplash
const cityImages: Record<string, string> = {
  Mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
  Bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80',
  Pune: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80',
  Delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
  Hyderabad: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
  Kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&q=80',
  Noida: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&q=80',
  Gurgaon: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&q=80',
  Ahmedabad: 'https://images.unsplash.com/photo-1609948543911-7d31cd272cd4?w=600&q=80',
  Jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',
  Kochi: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
};

// Property counts per city (mock data for display)
const cityCounts: Record<string, number> = {
  Mumbai: 450,
  Bangalore: 680,
  Pune: 320,
  Delhi: 290,
  Hyderabad: 410,
  Chennai: 280,
  Kolkata: 150,
  Noida: 220,
  Gurgaon: 380,
  Ahmedabad: 120,
  Jaipur: 90,
  Kochi: 75,
};

// Hero video URL - Using a free stock video of real estate/city
const HERO_VIDEO_URL = 'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4';
// Alternative videos you can swap later:
// Modern apartment: https://cdn.pixabay.com/video/2021/04/06/70096-535673498_large.mp4
// City skyline: https://cdn.pixabay.com/video/2019/06/04/24195-340669683_large.mp4
// Luxury home: https://cdn.pixabay.com/video/2020/07/30/46026-446089082_large.mp4

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertiesAPI.getAll({ limit: 6 });
      if (response.data.success) {
        setFeaturedProperties(response.data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/properties?city=${encodeURIComponent(searchCity)}`);
    } else {
      navigate('/properties');
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const toggleVideo = () => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'No Broker',
      description: 'Connect directly with property owners. Skip the middleman entirely.',
    },
    {
      icon: IndianRupee,
      title: 'Low Fees',
      description: 'Pay only a small success fee when you finalize a deal. No hidden charges.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Chat',
      description: 'Chat with owners in real-time. Ask questions and negotiate directly.',
    },
    {
      icon: Users,
      title: 'Verified Listings',
      description: 'All properties are verified to ensure genuine listings.',
    },
  ];

  const popularCities = [
    'Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai',
  ];

  const stats = [
    { label: 'Properties Listed', value: '10,000+' },
    { label: 'Happy Tenants', value: '25,000+' },
    { label: 'Cities Covered', value: '15+' },
    { label: 'Money Saved', value: '₹2Cr+' },
  ];

  // SEO structured data
  const structuredData = [
    getOrganizationSchema(),
    getSearchActionSchema(),
  ];

  return (
    <div>
      {/* SEO Head */}
      <SEOHead
        title="Find Flats, PG & Houses for Rent"
        description="India's #1 no-broker rental platform. Find flats, PG, houses & rooms for rent in Mumbai, Pune, Bangalore, Delhi & more. Direct connection with owners, no brokerage fees. Save up to ₹49,000!"
        keywords="rent, flat for rent, house rent, room rent, 1BHK rent, 2BHK rent, 3BHK rent, PG rent, studio apartment, no brokerage, direct owner, Mumbai rent, Bangalore rent, Pune rent, Delhi rent"
        canonicalUrl="/"
        structuredData={structuredData}
      />

      {/* Hero Section with Video Background */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            id="hero-video"
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50"></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-purple-900/30"></div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          <button
            onClick={toggleVideo}
            className="p-3 glass rounded-full hover:bg-white/20 transition-all"
            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
          >
            {isVideoPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 glass rounded-full hover:bg-white/20 transition-all"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            {/* Glass Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white">India's #1 No-Broker Rental Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
              Find Your Perfect Home
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                Without Broker Fees
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connect directly with property owners and save thousands on brokerage.
              Over 10,000+ verified properties across 15+ cities.
            </p>

            {/* Glass Search Box */}
            <form onSubmit={handleSearch} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      placeholder="Enter city or locality..."
                      className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-glass-primary px-10 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick City Links */}
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-gray-400 mb-4">Popular Cities:</p>
              <div className="flex flex-wrap gap-3">
                {popularCities.map((city) => (
                  <Link
                    key={city}
                    to={`/properties?city=${city}`}
                    className="px-5 py-2 glass rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all hover:scale-105"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glass Effect */}
      <section className="relative -mt-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Explore Popular Cities
              </h2>
              <p className="text-gray-600">
                Find properties in India's top metropolitan areas
              </p>
            </div>
            <Link
              to="/properties"
              className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Cities
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(cityImages).slice(0, 6).map(([city, image]) => (
              <Link
                key={city}
                to={`/properties?city=${city}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <img
                  src={image}
                  alt={city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg">{city}</h3>
                  <p className="text-sm text-gray-200">{cityCounts[city]}+ properties</p>
                </div>
              </Link>
            ))}
          </div>

          {/* More Cities Row with Glass Cards */}
          <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(cityImages).slice(6).map(([city, image]) => (
              <Link
                key={city}
                to={`/properties?city=${city}`}
                className="group flex items-center gap-3 p-3 glass-card hover:shadow-lg transition-all"
              >
                <img
                  src={image}
                  alt={city}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{city}</h4>
                  <p className="text-xs text-gray-500">{cityCounts[city]}+ listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      {featuredProperties.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Featured Properties
                </h2>
                <p className="text-gray-600">
                  Handpicked properties for you
                </p>
              </div>
              <Link
                to="/properties"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 6).map((property) => (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="group glass-card overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {property.propertyType}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 glass text-white text-xs font-medium rounded-full">
                        {property.furnishing?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {property.title}
                      </h3>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.locality}, {property.city}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {property.roomConfig?.replace('_', ' ')}
                      </span>
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms} Bath
                        </span>
                      )}
                      {property.squareFeet && (
                        <span className="flex items-center gap-1">
                          <HomeIcon className="h-4 w-4" />
                          {property.squareFeet} sqft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <div>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(property.rentAmount)}
                        </span>
                        <span className="text-gray-500 text-sm">/month</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Deposit: {formatPrice(property.depositAmount)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 btn-glass-primary px-8 py-3 rounded-xl font-semibold"
              >
                <Search className="h-5 w-5" />
                Explore All Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section with Glass Cards */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose RentDirect?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're revolutionizing the rental market in India by eliminating unnecessary middlemen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-dark p-6 hover:bg-gray-700/80 transition-all hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with Video Background */}
      <section className="py-20 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover opacity-20"
          >
            <source src="https://cdn.pixabay.com/video/2021/04/06/70096-535673498_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to find your perfect rental home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/30">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Properties</h3>
              <p className="text-gray-600">
                Browse thousands of verified properties across major Indian cities.
              </p>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-200"></div>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/30">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Owner</h3>
              <p className="text-gray-600">
                Chat directly with property owners. No middlemen, no brokers.
              </p>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-200"></div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/30">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Close the Deal</h3>
              <p className="text-gray-600">
                Finalize the rental and pay only a small success fee. That's it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Fee Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Unlike traditional brokers who charge 1-2 months rent, we charge a minimal success fee only when you finalize a deal.
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-4 glass-card">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Rent under ₹10,000:</strong>
                    <span className="text-primary-600 font-bold ml-2">Just ₹299</span>
                  </div>
                </div>
                <div className="flex items-center p-4 glass-card">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Rent ₹10,000 - ₹25,000:</strong>
                    <span className="text-primary-600 font-bold ml-2">Just ₹499</span>
                  </div>
                </div>
                <div className="flex items-center p-4 glass-card">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Rent above ₹25,000:</strong>
                    <span className="text-primary-600 font-bold ml-2">Just ₹999</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Compare & Save
              </h3>
              <div className="space-y-6">
                <div className="p-5 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">Traditional Broker</span>
                      <p className="text-sm text-gray-500">1-2 months rent as brokerage</p>
                    </div>
                    <span className="text-red-600 font-bold text-xl">₹20,000 - ₹50,000</span>
                  </div>
                </div>
                <div className="p-5 bg-green-50/80 backdrop-blur-sm rounded-2xl border-2 border-green-500 relative">
                  <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">RentDirect</span>
                      <p className="text-sm text-gray-500">Flat success fee</p>
                    </div>
                    <span className="text-green-600 font-bold text-xl">₹299 - ₹999</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl text-center">
                <p className="text-gray-600">
                  You save up to <span className="font-bold text-primary-600 text-2xl">₹49,000</span>!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Video Background */}
      <section className="py-24 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src="https://cdn.pixabay.com/video/2020/07/30/46026-446089082_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/85 to-purple-900/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of happy tenants who found their perfect home without paying broker fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="glass bg-white/20 hover:bg-white/30 text-white px-10 py-4 rounded-xl font-semibold transition-all border border-white/30"
            >
              Browse Properties
            </Link>
            <Link
              to="/register?role=owner"
              className="btn-glass-primary px-10 py-4 rounded-xl font-semibold"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
