import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { propertiesAPI } from '../../lib/api';
import { LoadingSpinner, BackButton } from '../../components/Common';
import {
  Upload, X, Save, Send, Home, MapPin, IndianRupee, Users, Sparkles,
  Building2, BedDouble, Bath, Maximize, ArrowRight, ArrowLeft, Check,
  Image as ImageIcon, Wifi, Car, Shield, Dumbbell, Trees, Droplets,
  Zap, Phone, Tv, Wind, Refrigerator, Waves
} from 'lucide-react';
import toast from 'react-hot-toast';

// Step configuration
const STEPS = [
  { id: 1, title: 'Basic Info', icon: Home, description: 'Property title & description' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Where is your property?' },
  { id: 3, title: 'Details', icon: Building2, description: 'Property specifications' },
  { id: 4, title: 'Pricing', icon: IndianRupee, description: 'Rent & deposit' },
  { id: 5, title: 'Preferences', icon: Users, description: 'Ideal tenants' },
  { id: 6, title: 'Amenities', icon: Sparkles, description: 'What you offer' },
  { id: 7, title: 'Photos', icon: ImageIcon, description: 'Showcase your property' },
];

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Refrigerator': <Refrigerator className="h-4 w-4" />,
  'Washing Machine': <Waves className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Power Backup': <Zap className="h-4 w-4" />,
  'Security': <Shield className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Garden': <Trees className="h-4 w-4" />,
  'Water Supply 24x7': <Droplets className="h-4 w-4" />,
  'Intercom': <Phone className="h-4 w-4" />,
};

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState(1);

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
    { value: 'FLAT', label: 'Flat', icon: '🏢' },
    { value: 'PG', label: 'PG', icon: '🛏️' },
    { value: 'INDEPENDENT_HOUSE', label: 'Independent House', icon: '🏠' },
    { value: 'SHARED_ROOM', label: 'Shared Room', icon: '👥' },
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
    { value: 'FULLY_FURNISHED', label: 'Fully Furnished', icon: '✨', desc: 'Ready to move in' },
    { value: 'SEMI_FURNISHED', label: 'Semi Furnished', icon: '🛋️', desc: 'Basic furniture included' },
    { value: 'UNFURNISHED', label: 'Unfurnished', icon: '📦', desc: 'Empty space' },
  ];

  const tenantOptions = [
    { value: 'ANY', label: 'Anyone', icon: '👋', color: 'from-gray-400 to-gray-600' },
    { value: 'STUDENTS', label: 'Students', icon: '🎓', color: 'from-blue-400 to-blue-600' },
    { value: 'WORKING_PROFESSIONALS', label: 'Professionals', icon: '💼', color: 'from-purple-400 to-purple-600' },
    { value: 'FAMILY', label: 'Families', icon: '👨‍👩‍👧‍👦', color: 'from-green-400 to-green-600' },
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

  const handleSubmit = async (publish = false) => {
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

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepProgress = () => {
    return (currentStep / STEPS.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 text-lg"
                placeholder="e.g., Spacious 2BHK in Koramangala"
              />
              <p className="text-sm text-gray-500 mt-2">
                Create an attractive title that highlights your property's best features
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 min-h-[150px] resize-none"
                placeholder="Describe your property in detail - location highlights, nearby landmarks, unique features..."
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Be detailed to attract the right tenants</span>
                <span>{formData.description.length} characters</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {propertyTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, propertyType: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.propertyType === type.value
                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <span className={`font-medium ${
                      formData.propertyType === type.value ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality *
                </label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                  placeholder="e.g., Koramangala, HSR Layout"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                placeholder="Street address, building name, landmark..."
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                placeholder="560034"
                maxLength={6}
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Pro Tip</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Include nearby landmarks, metro stations, or famous locations to help tenants find your property easily.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Room Configuration *
              </label>
              <div className="flex flex-wrap gap-2">
                {roomConfigs.map((config) => (
                  <motion.button
                    key={config.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, roomConfig: config.value })}
                    className={`px-5 py-2.5 rounded-full border-2 font-medium transition-all duration-200 ${
                      formData.roomConfig === config.value
                        ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-200'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {config.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Furnishing Status *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {furnishingOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, furnishing: option.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.furnishing === option.value
                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <h4 className={`font-semibold mt-2 ${
                      formData.furnishing === option.value ? 'text-primary-700' : 'text-gray-800'
                    }`}>
                      {option.label}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Maximize className="h-4 w-4 inline mr-1" />
                  Area (sq.ft)
                </label>
                <input
                  type="number"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bath className="h-4 w-4 inline mr-1" />
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BedDouble className="h-4 w-4 inline mr-1" />
                  Balconies
                </label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Floor
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                    placeholder="3"
                  />
                  <span className="flex items-center text-gray-400">/</span>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Monthly Rent *</h3>
                  <p className="text-sm text-green-700">Set a competitive price</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₹</span>
                <input
                  type="number"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 text-3xl font-bold rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  placeholder="25,000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Security Deposit *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    name="depositAmount"
                    value={formData.depositAmount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 text-lg font-semibold rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="75,000"
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">Usually 2-3 months rent</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Maintenance (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    name="maintenanceAmount"
                    value={formData.maintenanceAmount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 text-lg font-semibold rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    placeholder="2,000"
                  />
                </div>
                <p className="text-xs text-purple-600 mt-2">Monthly maintenance charges</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-medium text-amber-900">Pricing Tip</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Research similar properties in your area to set a competitive price. Properties priced right get 3x more inquiries!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Who's your ideal tenant?</h3>
              <p className="text-gray-600 mb-4">Select one or more options to find the right match</p>

              <div className="grid grid-cols-2 gap-4">
                {tenantOptions.map((option) => {
                  const isSelected = formData.tenantPreference.includes(option.value);
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTenantPreferenceChange(option.value)}
                      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? 'border-transparent shadow-xl'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-10`}
                        />
                      )}
                      <div className="relative">
                        <span className="text-4xl block mb-3">{option.icon}</span>
                        <h4 className={`font-semibold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {option.label}
                        </h4>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-0 right-0 p-1 bg-green-500 rounded-full"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What amenities do you offer?</h3>
              <p className="text-gray-600 mb-4">Select all that apply to attract more tenants</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenityOptions.map((amenity) => {
                  const isSelected = formData.amenities.includes(amenity);
                  const icon = amenityIcons[amenity];
                  return (
                    <motion.button
                      key={amenity}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md shadow-primary-100'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {icon || <Sparkles className="h-4 w-4" />}
                      <span className="font-medium text-sm">{amenity}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 ml-auto text-primary-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">
                  {formData.amenities.length} amenities selected
                </span>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Showcase your property</h3>
              <p className="text-gray-600 mb-4">Add high-quality photos to attract more tenants</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                      {index === 0 ? 'Cover Photo' : `Photo ${index + 1}`}
                    </div>
                  </motion.div>
                ))}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, borderColor: '#6366f1' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImageAdd}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 transition-all bg-gray-50 hover:bg-primary-50"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Add Photo</span>
                  <span className="text-xs mt-1">URL only</span>
                </motion.button>
              </div>

              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="font-medium text-indigo-900 mb-2">📸 Photo Tips</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Use natural lighting for best results</li>
                  <li>• Include photos of all rooms and spaces</li>
                  <li>• Highlight unique features and amenities</li>
                  <li>• Properties with 5+ photos get 2x more views</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${getStepProgress()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">
        {/* Header */}
        <div className="mb-8">
          <BackButton fallbackPath="/owner/dashboard" className="mb-4" />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            {isEdit ? 'Edit Property' : 'List Your Property'}
          </motion.h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update your property details' : 'Fill in the details to list your property'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <motion.button
                  key={step.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                  <span className="font-medium text-sm whitespace-nowrap">{step.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </motion.button>

            <div className="flex items-center gap-3">
              {currentStep === STEPS.length ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit(false)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit(true)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-200 hover:shadow-xl transition-all"
                  >
                    <Send className="h-4 w-4" />
                    {isSaving ? 'Publishing...' : 'Publish Now'}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-200 hover:shadow-xl transition-all"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
