import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Home, IndianRupee, Bookmark, Eye, ArrowRight,
  Bath, BedDouble, Maximize, Sparkles
} from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  variant?: 'default' | 'compact' | 'featured';
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showBookmark = false,
  isBookmarked = false,
  onBookmark,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatRent = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FLAT: 'Flat',
      PG: 'PG',
      INDEPENDENT_HOUSE: 'House',
      SHARED_ROOM: 'Shared',
    };
    return labels[type] || type;
  };

  const getRoomConfigLabel = (config: string) => {
    const labels: Record<string, string> = {
      SINGLE_ROOM: 'Single',
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
      FULLY_FURNISHED: 'Furnished',
      SEMI_FURNISHED: 'Semi',
      UNFURNISHED: 'Unfurnished',
    };
    return labels[furnishing] || furnishing;
  };

  const getFurnishingColor = (furnishing: string) => {
    const colors: Record<string, string> = {
      FULLY_FURNISHED: 'from-emerald-500 to-green-600',
      SEMI_FURNISHED: 'from-amber-500 to-orange-600',
      UNFURNISHED: 'from-gray-400 to-gray-600',
    };
    return colors[furnishing] || 'from-gray-400 to-gray-600';
  };

  const hasMultipleImages = property.images && property.images.length > 1;

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/properties/${property.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-200/30 transition-all duration-500 border border-gray-100">
          {/* Image Container */}
          <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                )}
                <motion.img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  onLoad={() => setImageLoaded(true)}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                />

                {/* Image Navigation Arrows */}
                {hasMultipleImages && isHovered && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </>
                )}

                {/* Image Dots */}
                {hasMultipleImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {property.images.slice(0, 5).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={false}
                        animate={{
                          scale: currentImageIndex === idx ? 1.2 : 1,
                          backgroundColor: currentImageIndex === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                      />
                    ))}
                    {property.images.length > 5 && (
                      <span className="text-white text-xs ml-1">+{property.images.length - 5}</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home className="h-16 w-16 text-gray-300" />
                </motion.div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                {/* Property Type Badge */}
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800 shadow-lg"
                >
                  {getPropertyTypeLabel(property.propertyType)}
                </motion.span>

              </div>

              {/* Status Badge */}
              {property.status === 'RENTED' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-500 rounded-full text-xs font-bold text-white shadow-lg"
                >
                  Rented Out
                </motion.div>
              )}
            </div>

            {/* Bookmark Button */}
            {showBookmark && onBookmark && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  onBookmark(property.id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                  isBookmarked
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-white'
                }`}
              >
                <Bookmark
                  className={`h-5 w-5 transition-all duration-300 ${
                    isBookmarked ? 'fill-current' : ''
                  }`}
                />
              </motion.button>
            )}

            {/* Price Tag - Floating */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-3 left-3"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl">
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-4 w-4 text-gray-700" />
                  <span className="text-xl font-bold text-gray-900">
                    {formatRent(property.rentAmount)}
                  </span>
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
              </div>
            </motion.div>

            {/* Furnishing Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-3 right-3"
            >
              <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getFurnishingColor(property.furnishing)} text-white text-xs font-semibold shadow-lg`}>
                {getFurnishingLabel(property.furnishing)}
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors duration-300">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <MapPin className="h-4 w-4 mr-1.5 text-primary-500 flex-shrink-0" />
              <span className="line-clamp-1">{property.locality}, {property.city}</span>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                <BedDouble className="h-4 w-4 text-gray-400 mb-1" />
                <span className="text-sm font-semibold text-gray-800">
                  {getRoomConfigLabel(property.roomConfig)}
                </span>
              </div>
              {property.bathrooms && (
                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <Bath className="h-4 w-4 text-gray-400 mb-1" />
                  <span className="text-sm font-semibold text-gray-800">
                    {property.bathrooms} Bath
                  </span>
                </div>
              )}
              {property.squareFeet && (
                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <Maximize className="h-4 w-4 text-gray-400 mb-1" />
                  <span className="text-sm font-semibold text-gray-800">
                    {property.squareFeet} ft²
                  </span>
                </div>
              )}
              {!property.bathrooms && !property.squareFeet && (
                <>
                  <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                    <Bath className="h-4 w-4 text-gray-300 mb-1" />
                    <span className="text-sm text-gray-400">-</span>
                  </div>
                  <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                    <Maximize className="h-4 w-4 text-gray-300 mb-1" />
                    <span className="text-sm text-gray-400">-</span>
                  </div>
                </>
              )}
            </div>

            {/* Amenities Preview */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="tabular-nums">{property.viewCount}</span>
                </span>
                {property.depositAmount && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="tabular-nums">₹{formatRent(property.depositAmount)} deposit</span>
                  </span>
                )}
              </div>

              <motion.span
                className="flex items-center gap-1 text-primary-600 font-semibold text-sm"
                animate={{ x: isHovered ? 5 : 0 }}
              >
                View
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
