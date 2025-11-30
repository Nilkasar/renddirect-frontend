import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, IndianRupee, Bookmark, Eye, ArrowRight } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showBookmark = false,
  isBookmarked = false,
  onBookmark,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatRent = (amount: number) => {
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
      FULLY_FURNISHED: 'Furnished',
      SEMI_FURNISHED: 'Semi-Furnished',
      UNFURNISHED: 'Unfurnished',
    };
    return labels[furnishing] || furnishing;
  };

  return (
    <div
      className="card group hover-lift overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer" />
            )}
            <img
              src={property.images[0]}
              alt={property.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <Home className={`h-12 w-12 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Status badge */}
        {property.status === 'RENTED' && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            Rented
          </div>
        )}

        {/* Property type badge */}
        <div className={`absolute top-2 right-2 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
          {getPropertyTypeLabel(property.propertyType)}
        </div>

        {/* Bookmark button */}
        {showBookmark && onBookmark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onBookmark(property.id);
            }}
            className={`absolute bottom-2 right-2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white ${isBookmarked ? 'ring-2 ring-primary-500' : ''}`}
          >
            <Bookmark
              className={`h-5 w-5 transition-all duration-300 ${isBookmarked ? 'fill-primary-600 text-primary-600 scale-110' : 'text-gray-600'}`}
            />
          </button>
        )}

        {/* Quick view button on hover */}
        <Link
          to={`/properties/${property.id}`}
          className={`absolute bottom-2 left-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 transition-all duration-300 flex items-center gap-1 hover:bg-white ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          Quick View
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-center text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
          <IndianRupee className={`h-5 w-5 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          <span className="tabular-nums">{formatRent(property.rentAmount)}</span>
          <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
        </div>

        {/* Title */}
        <h3 className={`text-lg font-semibold text-gray-900 mb-2 line-clamp-1 transition-colors duration-300 ${isHovered ? 'text-primary-600' : ''}`}>
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3 group">
          <MapPin className={`h-4 w-4 mr-1 flex-shrink-0 transition-all duration-300 ${isHovered ? 'text-primary-500' : ''}`} />
          <span className="line-clamp-1">{property.locality}, {property.city}</span>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge bg-gray-100 text-gray-700 transition-all duration-300 ${isHovered ? 'bg-primary-50 text-primary-700' : ''}`}>
            {getRoomConfigLabel(property.roomConfig)}
          </span>
          <span className={`badge bg-gray-100 text-gray-700 transition-all duration-300 ${isHovered ? 'bg-primary-50 text-primary-700' : ''}`}>
            {getFurnishingLabel(property.furnishing)}
          </span>
          {property.squareFeet && (
            <span className={`badge bg-gray-100 text-gray-700 transition-all duration-300 ${isHovered ? 'bg-primary-50 text-primary-700' : ''}`}>
              {property.squareFeet} sq.ft
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-sm">
            <Eye className={`h-4 w-4 mr-1 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
            <span className="tabular-nums">{property.viewCount} views</span>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group/link"
          >
            View Details
            <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
