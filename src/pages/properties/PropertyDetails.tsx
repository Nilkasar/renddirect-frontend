import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertiesAPI, chatAPI } from '../../lib/api';
import { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/Common';
import { SEOHead, getPropertySchema, getProductSchema, getBreadcrumbSchema } from '../../components/SEO';
import {
  MapPin, IndianRupee, Bed, Bath, Home,
  Ruler, Building, MessageSquare, Share2,
  ChevronLeft, ChevronRight, Flag, User, CheckCircle,
  ArrowRight, Heart, Eye, X, Grid3X3,
  Copy, Mail, ArrowLeft, Check, Maximize2, Download,
  Play, Image as ImageIcon, Expand
} from 'lucide-react';
import toast from 'react-hot-toast';

// Share Modal Component
const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}> = ({ isOpen, onClose, property }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareTitle = `${property.title} - ₹${new Intl.NumberFormat('en-IN').format(property.rentAmount)}/month`;
  const shareText = `Check out this property: ${property.title} in ${property.locality}, ${property.city}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
    },
    {
      name: 'Twitter',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-black hover:bg-gray-800',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'),
    },
    {
      name: 'LinkedIn',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'),
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank'),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-primary-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900">Share Property</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Property Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Home className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
              <p className="text-sm text-gray-500 truncate">{property.locality}, {property.city}</p>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 font-bold">₹{new Intl.NumberFormat('en-IN').format(property.rentAmount)}/mo</p>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  option.onClick();
                  onClose();
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${option.color} text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <option.icon />
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full pl-4 pr-24 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Fullscreen Gallery Component with Grid View
const FullscreenGallery: React.FC<{
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  propertyTitle: string;
}> = ({ images, currentIndex, onClose, onNavigate, propertyTitle }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState<'slideshow' | 'grid'>('slideshow');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([currentIndex]));

  // Preload adjacent images
  useEffect(() => {
    const preloadIndexes = [
      currentIndex,
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length,
    ];
    preloadIndexes.forEach((idx) => {
      const img = new Image();
      img.src = images[idx];
      img.onload = () => setLoadedImages((prev) => new Set(prev).add(idx));
    });
  }, [currentIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft' && viewMode === 'slideshow') {
        onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && viewMode === 'slideshow') {
        onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
      if (e.key === 'g') setViewMode(viewMode === 'grid' ? 'slideshow' : 'grid');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate, isZoomed, viewMode]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
          </button>
          <div>
            <h3 className="text-white font-semibold truncate max-w-md">{propertyTitle}</h3>
            <p className="text-white/60 text-sm">
              {viewMode === 'slideshow' ? `${currentIndex + 1} of ${images.length}` : `${images.length} photos`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('slideshow')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'slideshow' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              title="Slideshow view"
            >
              <Play className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              title="Grid view"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          </div>
          {viewMode === 'slideshow' && (
            <>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isZoomed ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                title={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <a
                href={images[currentIndex]}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                title="Download image"
              >
                <Download className="h-5 w-5" />
              </a>
            </>
          )}
        </div>
      </div>

      {viewMode === 'slideshow' ? (
        <>
          {/* Main Image */}
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 pt-20 pb-32 transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <img
              src={images[currentIndex]}
              alt={`${propertyTitle} - Image ${currentIndex + 1}`}
              className={`max-h-full max-w-full object-contain transition-all duration-500 rounded-lg shadow-2xl ${
                isZoomed ? 'scale-150' : 'scale-100'
              } ${loadedImages.has(currentIndex) ? 'opacity-100' : 'opacity-0'}`}
              style={{ transformOrigin: 'center center' }}
            />

            {/* Loading indicator */}
            {!loadedImages.has(currentIndex) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={() => onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-primary-500/80 to-purple-500/80 hover:from-primary-500 hover:to-purple-500 text-white rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-primary-500/30"
              >
                <ChevronLeft className="h-8 w-8 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-primary-500/80 to-purple-500/80 hover:from-primary-500 hover:to-purple-500 text-white rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-purple-500/30"
              >
                <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-1" />
              </button>
            </>
          )}

          {/* Bottom Thumbnails */}
          {images.length > 1 && !isZoomed && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <div className="flex justify-center gap-3 overflow-x-auto py-2 px-4 max-w-4xl mx-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 ${
                      idx === currentIndex
                        ? 'ring-2 ring-white scale-110 shadow-lg shadow-white/20'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Grid View */
        <div className="absolute inset-0 pt-20 pb-6 px-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(idx);
                  setViewMode('slideshow');
                }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/20"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-white text-sm font-medium">{idx + 1} / {images.length}</span>
                  <Expand className="h-5 w-5 text-white" />
                </div>
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-primary-500 group-hover:to-purple-500 transition-all duration-300" style={{
                  background: 'linear-gradient(var(--tw-gradient-stops))',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        const response = await propertiesAPI.getById(id);
        if (response.data.success) {
          setProperty(response.data.data);
        }
      } catch (error) {
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }

    if (user?.role === 'OWNER') {
      toast.error('Owners cannot contact other owners');
      return;
    }

    setIsStartingChat(true);
    try {
      const response = await chatAPI.startConversation(id!);
      if (response.data.success) {
        navigate(`/messages/${response.data.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start conversation');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title} in ${property?.locality}, ${property?.city}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fall back to modal
      }
    }
    setShowShareModal(true);
  }, [property]);

  const formatRent = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FLAT: 'Flat',
      PG: 'PG',
      INDEPENDENT_HOUSE: 'Independent House',
      SHARED_ROOM: 'Shared Room',
    };
    return labels[type] || type;
  };

  const getRoomConfigLabel = (config: string) => {
    const labels: Record<string, string> = {
      SINGLE_ROOM: 'Single Room',
      ONE_RK: '1 RK',
      ONE_BHK: '1 BHK',
      TWO_BHK: '2 BHK',
      THREE_BHK: '3 BHK',
      THREE_PLUS_BHK: '3+ BHK',
      SHARED: 'Shared',
    };
    return labels[config] || config;
  };

  const getFurnishingLabel = (furnishing: string) => {
    const labels: Record<string, string> = {
      FULLY_FURNISHED: 'Fully Furnished',
      SEMI_FURNISHED: 'Semi Furnished',
      UNFURNISHED: 'Unfurnished',
    };
    return labels[furnishing] || furnishing;
  };

  const getTenantPreferenceLabel = (pref: string) => {
    const labels: Record<string, string> = {
      STUDENTS: 'Students',
      WORKING_PROFESSIONALS: 'Working Professionals',
      FAMILY: 'Family',
      ANY: 'Anyone',
    };
    return labels[pref] || pref;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" variant="pulse" text="Loading property details..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-10 w-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all group">
            Browse Properties
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    );
  }

  // SEO structured data for property
  const structuredData = [
    getPropertySchema(property),
    getProductSchema(property),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Properties', url: '/properties' },
      { name: property.city, url: `/properties?city=${property.city}` },
      { name: property.title, url: `/properties/${property.id}` },
    ]),
  ];

  const seoTitle = `${getRoomConfigLabel(property.roomConfig)} ${getPropertyTypeLabel(property.propertyType)} for Rent in ${property.locality}, ${property.city}`;
  const seoDescription = `${property.title} - ${getRoomConfigLabel(property.roomConfig)} ${getFurnishingLabel(property.furnishing).toLowerCase()} ${getPropertyTypeLabel(property.propertyType).toLowerCase()} for rent in ${property.locality}, ${property.city}. Rent: ₹${formatRent(property.rentAmount)}/month. ${property.amenities?.slice(0, 3).join(', ')}. No brokerage, direct owner contact.`;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* SEO Head */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${property.roomConfig} rent ${property.city}, ${property.propertyType} rent ${property.locality}, ${property.furnishing} flat ${property.city}, rent in ${property.locality}, ${property.city} rental`}
        canonicalUrl={`/properties/${property.id}`}
        ogType="product"
        ogImage={property.images?.[0]}
        structuredData={structuredData}
      />

      {/* Floating Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <div className="hidden md:block flex-1 mx-8 text-center">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{property.title}</h1>
              <p className="text-xs text-gray-500">{property.locality}, {property.city}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                title="Share"
              >
                <Share2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isBookmarked
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-500'
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-5 w-5 transition-all duration-300 ${isBookmarked ? 'fill-current scale-110' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 animate-slide-up">
            {/* Premium Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              {/* Main Image Area */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 group cursor-pointer" onClick={() => setShowFullscreenGallery(true)}>
                {property.images && property.images.length > 0 ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                    )}

                    <img
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />

                    {/* Hover Overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl">
                          <ImageIcon className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-semibold text-gray-800">View {property.images.length} Photos</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageLoaded(false);
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? property.images.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white opacity-0 group-hover:opacity-100 hover:shadow-primary-500/20"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageLoaded(false);
                            setCurrentImageIndex((prev) =>
                              prev === property.images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white opacity-0 group-hover:opacity-100 hover:shadow-purple-500/20"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Progress Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                          {property.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageLoaded(false);
                                setCurrentImageIndex(idx);
                              }}
                              className={`rounded-full transition-all duration-300 ${
                                idx === currentImageIndex
                                  ? 'w-6 h-2 bg-white'
                                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {property.status === 'RENTED' && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Already Rented
                      </div>
                    )}

                    {property.images.length > 1 && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full font-medium flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4" />
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Home className="h-20 w-20 mb-4" />
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {property.images && property.images.length > 1 && (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setImageLoaded(false);
                          setCurrentImageIndex(idx);
                        }}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                          idx === currentImageIndex
                            ? 'ring-2 ring-primary-500 ring-offset-2 scale-105 shadow-lg shadow-primary-500/20'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === currentImageIndex && (
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent" />
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowFullscreenGallery(true)}
                      className="flex-shrink-0 w-24 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-purple-100 hover:from-primary-200 hover:to-purple-200 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-primary-700 hover:text-primary-800 hover:scale-105"
                    >
                      <Grid3X3 className="h-5 w-5" />
                      <span className="text-xs font-semibold">View All</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 group">
                    <MapPin className="h-5 w-5 mr-1 text-primary-500" />
                    <span>{property.address}, {property.locality}, {property.city}</span>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 text-sm font-medium rounded-full">
                  {getPropertyTypeLabel(property.propertyType)}
                </span>
              </div>

              <div className="flex items-center text-3xl font-bold mb-6">
                <IndianRupee className="h-8 w-8 text-primary-600" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">{formatRent(property.rentAmount)}</span>
                <span className="text-lg font-normal text-gray-500 ml-2">/month</span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 group cursor-default">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary-600 transition-transform group-hover:scale-110" />
                  <div className="font-semibold text-gray-800">{getRoomConfigLabel(property.roomConfig)}</div>
                </div>
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 group cursor-default">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-primary-600 transition-transform group-hover:scale-110" />
                    <div className="font-semibold text-gray-800">{property.bathrooms} Bathrooms</div>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 group cursor-default">
                    <Ruler className="h-6 w-6 mx-auto mb-2 text-primary-600 transition-transform group-hover:scale-110" />
                    <div className="font-semibold text-gray-800">{property.squareFeet} sq.ft</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 group cursor-default">
                  <Building className="h-6 w-6 mx-auto mb-2 text-primary-600 transition-transform group-hover:scale-110" />
                  <div className="font-semibold text-gray-800">{getFurnishingLabel(property.furnishing)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></span>
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></span>
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, idx) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm transition-all duration-300 hover:shadow-md hover:scale-105"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenant Preference */}
              {property.tenantPreference && property.tenantPreference.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></span>
                    Preferred Tenants
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.tenantPreference.map((pref) => (
                      <span
                        key={pref}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
                      >
                        {getTenantPreferenceLabel(pref)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 animate-slide-left" style={{ animationDelay: '0.2s' }}>
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-primary-600" />
                  </div>
                  Pricing Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">₹{formatRent(property.rentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-bold text-lg">₹{formatRent(property.depositAmount)}</span>
                  </div>
                  {property.maintenanceAmount && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                      <span className="text-gray-600">Maintenance</span>
                      <span className="font-bold">₹{formatRent(property.maintenanceAmount)}/month</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Property Owner</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {property.owner?.firstName} {property.owner?.lastName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Verified Owner
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                  <Eye className="h-4 w-4" />
                  <span>{property.viewCount} people viewed this property</span>
                </div>

                {property.status !== 'RENTED' ? (
                  <button
                    onClick={handleContactOwner}
                    disabled={isStartingChat}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 hover:from-primary-500 hover:via-primary-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                  >
                    {isStartingChat ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Starting Chat...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span>Contact Owner</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center text-gray-500 py-4 bg-gray-100 rounded-xl">
                    This property is already rented
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Phone number will be shared after owner approval
                </p>
              </div>

              {/* Report */}
              <div className="text-center">
                <button className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1.5 mx-auto transition-all duration-200 hover:scale-105 group">
                  <Flag className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && property && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          property={property}
        />
      )}

      {/* Fullscreen Gallery */}
      {showFullscreenGallery && property.images && property.images.length > 0 && (
        <FullscreenGallery
          images={property.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowFullscreenGallery(false)}
          onNavigate={(idx) => {
            setCurrentImageIndex(idx);
            setImageLoaded(false);
          }}
          propertyTitle={property.title}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
