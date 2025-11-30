import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI } from '../../lib/api';
import { LoadingSpinner, BackButton } from '../../components/Common';
import { Upload, X, Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    locality: '',
    address: '',
    pincode: '',
    propertyType: 'FLAT',
    roomConfig: 'ONE_BHK',
    furnishing: 'SEMI_FURNISHED',
    rentAmount: '',
    depositAmount: '',
    maintenanceAmount: '',
    tenantPreference: ['ANY'] as string[],
    amenities: [] as string[],
    images: [] as string[],
    squareFeet: '',
    bathrooms: '',
    balconies: '',
    floorNumber: '',
    totalFloors: '',
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

  const tenantOptions = [
    { value: 'ANY', label: 'Anyone' },
    { value: 'STUDENTS', label: 'Students' },
    { value: 'WORKING_PROFESSIONALS', label: 'Working Professionals' },
    { value: 'FAMILY', label: 'Families' },
  ];

  const amenityOptions = [
    'WiFi', 'AC', 'Geyser', 'TV', 'Refrigerator', 'Washing Machine',
    'Parking', 'Power Backup', 'Security', 'Lift', 'Gym', 'Swimming Pool',
    'Club House', 'Garden', 'Intercom', 'CCTV', 'Water Supply 24x7',
  ];

  useEffect(() => {
    if (isEdit) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertiesAPI.getById(id!);
      if (response.data.success) {
        const property = response.data.data;
        setFormData({
          title: property.title,
          description: property.description,
          city: property.city,
          locality: property.locality,
          address: property.address,
          pincode: property.pincode || '',
          propertyType: property.propertyType,
          roomConfig: property.roomConfig,
          furnishing: property.furnishing,
          rentAmount: property.rentAmount.toString(),
          depositAmount: property.depositAmount.toString(),
          maintenanceAmount: property.maintenanceAmount?.toString() || '',
          tenantPreference: property.tenantPreference,
          amenities: property.amenities,
          images: property.images,
          squareFeet: property.squareFeet?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          balconies: property.balconies?.toString() || '',
          floorNumber: property.floorNumber?.toString() || '',
          totalFloors: property.totalFloors?.toString() || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load property');
      navigate('/owner/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTenantPreferenceChange = (value: string) => {
    setFormData((prev) => {
      if (value === 'ANY') {
        return { ...prev, tenantPreference: ['ANY'] };
      }
      const newPrefs = prev.tenantPreference.filter((p) => p !== 'ANY');
      if (newPrefs.includes(value)) {
        return { ...prev, tenantPreference: newPrefs.filter((p) => p !== value) };
      }
      return { ...prev, tenantPreference: [...newPrefs, value] };
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      if (prev.amenities.includes(amenity)) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== amenity) };
      }
      return { ...prev, amenities: [...prev.amenities, amenity] };
    });
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.city || !formData.locality) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        ...formData,
        rentAmount: parseInt(formData.rentAmount),
        depositAmount: parseInt(formData.depositAmount),
        maintenanceAmount: formData.maintenanceAmount ? parseInt(formData.maintenanceAmount) : undefined,
        squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        balconies: formData.balconies ? parseInt(formData.balconies) : undefined,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : undefined,
      };

      let propertyId = id;

      if (isEdit) {
        await propertiesAPI.update(id!, data);
      } else {
        const response = await propertiesAPI.create(data);
        propertyId = response.data.data.id;
      }

      if (publish && propertyId) {
        await propertiesAPI.updateStatus(propertyId, 'ACTIVE');
        toast.success('Property published successfully!');
      } else {
        toast.success(isEdit ? 'Property updated!' : 'Property saved as draft');
      }

      navigate('/owner/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton fallbackPath="/owner/dashboard" className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Spacious 2BHK in Koramangala"
                  required
                />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[120px]"
                  placeholder="Describe your property, its features, nearby landmarks, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Locality *</label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Koramangala"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Full Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="Street address, building name, etc."
                  required
                />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="input"
                  placeholder="560034"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="input"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Room Configuration *</label>
                <select
                  name="roomConfig"
                  value={formData.roomConfig}
                  onChange={handleChange}
                  className="input"
                >
                  {roomConfigs.map((config) => (
                    <option key={config.value} value={config.value}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Furnishing *</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="input"
                >
                  {furnishingOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Area (sq.ft)</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleChange}
                  className="input"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="label">Balconies</label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  className="input"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="label">Floor Number</label>
                <input
                  type="number"
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="label">Total Floors</label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  className="input"
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="input"
                  placeholder="25000"
                  required
                />
              </div>
              <div>
                <label className="label">Security Deposit (₹) *</label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  className="input"
                  placeholder="75000"
                  required
                />
              </div>
              <div>
                <label className="label">Maintenance (₹/month)</label>
                <input
                  type="number"
                  name="maintenanceAmount"
                  value={formData.maintenanceAmount}
                  onChange={handleChange}
                  className="input"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          {/* Tenant Preference */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Preferred Tenants</h2>
            <div className="flex flex-wrap gap-3">
              {tenantOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTenantPreferenceChange(option.value)}
                  className={`px-4 py-2 rounded-full border-2 transition-colors ${
                    formData.tenantPreference.includes(option.value)
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleImageAdd}
                className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-sm">Add Image URL</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Tip: Use high-quality images from image hosting services
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              {isSaving ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
