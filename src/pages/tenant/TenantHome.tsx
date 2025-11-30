import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '../../lib/api';
import { Property } from '../../types';
import { PropertyCard, LoadingSpinner } from '../../components/Common';
import { useAuth } from '../../context/AuthContext';
import {
  Search, MapPin, TrendingUp, Heart, MessageSquare,
  CheckCircle, ArrowRight, Building, Star, Shield,
  Play, Pause, Volume2, VolumeX, Sparkles, Zap
} from 'lucide-react';

// Hero video URL
const HERO_VIDEO_URL = 'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4';

const TenantHome: React.FC = () => {
  const { user } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const popularCities = [
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400', properties: '2,500+' },
    { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400', properties: '3,200+' },
    { name: 'Pune', image: 'https://images.unsplash.com/photo-1571975212954-3d3e94d0e7a6?w=400', properties: '1,800+' },
    { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', properties: '2,100+' },
    { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1572638643897-5be29e71e4c9?w=400', properties: '1,500+' },
    { name: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', properties: '1,200+' },
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const [featuredRes, recentRes] = await Promise.all([
        propertiesAPI.getAll({ limit: 4, sortBy: 'viewCount', sortOrder: 'desc' }),
        propertiesAPI.getAll({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      if (featuredRes.data.success) {
        setFeaturedProperties(featuredRes.data.data.items);
      }
      if (recentRes.data.success) {
        setRecentProperties(recentRes.data.data.items);
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
      window.location.href = `/properties?city=${encodeURIComponent(searchCity)}`;
    }
  };

  const toggleVideo = () => {
    const video = document.getElementById('tenant-hero-video') as HTMLVideoElement;
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
    const video = document.getElementById('tenant-hero-video') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Welcome Hero with Video Background */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            id="tenant-hero-video"
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-primary-900/80 to-purple-900/70"></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-purple-600/20 animate-pulse-slow"></div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          <button
            onClick={toggleVideo}
            className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
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
            className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 animate-slide-up">
              {/* Welcome Badge */}
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-sm text-white">Welcome back to RentDirect</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Hello, {user?.firstName}!{' '}
                <span className="inline-block animate-wiggle">👋</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Ready to find your perfect home? Browse thousands of verified properties directly from owners.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-card p-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="Enter city, locality or landmark..."
                        className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/90 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 group"
                    >
                      <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:w-80 animate-slide-left" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/tenant/dashboard"
                className="glass-card-dark p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
              >
                <Heart className="h-8 w-8 mb-3 text-red-400 transition-transform group-hover:scale-110" />
                <div className="text-2xl font-bold text-white">Saved</div>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                  View bookmarks
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
              <Link
                to="/messages"
                className="glass-card-dark p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
              >
                <MessageSquare className="h-8 w-8 mb-3 text-green-400 transition-transform group-hover:scale-110" />
                <div className="text-2xl font-bold text-white">Chats</div>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                  View messages
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
              <Link
                to="/tenant/dashboard"
                className="glass-card-dark p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 col-span-2 group"
              >
                <CheckCircle className="h-8 w-8 mb-3 text-yellow-400 transition-transform group-hover:scale-110" />
                <div className="text-2xl font-bold text-white">My Dashboard</div>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                  Track your activity & deals
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-slide-up">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Popular Cities</h2>
              <p className="text-gray-600">Find rentals in India's top cities</p>
            </div>
            <Link
              to="/properties"
              className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-all hover:gap-3"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.map((city, idx) => (
              <Link
                key={city.name}
                to={`/properties?city=${city.name}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <p className="text-sm text-gray-200 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {city.properties} properties
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-slide-up">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                Trending Properties
              </h2>
              <p className="text-gray-600 mt-2">Most viewed properties this week</p>
            </div>
            <Link
              to="/properties"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl font-medium transition-all hover:gap-3"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" variant="pulse" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property, idx) => (
                <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <PropertyCard property={property} showBookmark />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 glass-card">
              <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No properties available yet</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-slide-up">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                Recently Added
              </h2>
              <p className="text-gray-600 mt-2">Fresh listings just for you</p>
            </div>
            <Link
              to="/properties?sortBy=createdAt&sortOrder=desc"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-medium transition-all hover:gap-3"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" variant="dots" />
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProperties.map((property, idx) => (
                <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <PropertyCard property={property} showBookmark />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 glass-card">
              <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No properties available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Why RentDirect */}
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 animate-slide-up">
            Why Tenants Love RentDirect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                color: 'bg-green-100 text-green-600',
                title: 'Verified Properties',
                description: 'All listings are verified to ensure you get genuine properties',
              },
              {
                icon: MessageSquare,
                color: 'bg-blue-100 text-blue-600',
                title: 'Direct Chat with Owners',
                description: 'No middlemen. Chat directly with property owners',
              },
              {
                icon: Zap,
                color: 'bg-yellow-100 text-yellow-600',
                title: 'Save Up to 50,000',
                description: 'Pay only 299-999 success fee instead of broker charges',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-8 glass-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-primary-900 to-purple-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-bounce-in">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">Start Your Home Search Today</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
            Thousands of Properties Waiting for You
          </h2>
          <p className="text-gray-300 mb-8 text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your dream home is just a click away
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Search className="h-5 w-5" />
            Browse All Properties
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TenantHome;
