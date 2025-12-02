import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { AlertCircle, CheckCircle, School, MapPin, ImagePlus, Plus, Grid, Search, X } from 'lucide-react';

type SchoolBase = {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image: string | null;
};

type School = SchoolBase & {
  id: number;
  createdAt: string;
};

type FormErrors = Partial<Record<keyof SchoolBase | 'submit', string>>;

const mockAPI = {
  addSchool: async (schoolData: SchoolBase): Promise<School> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    const newSchool = {
      id: schools.length + 1,
      ...schoolData,
      createdAt: new Date().toISOString()
    };
    schools.push(newSchool);
    localStorage.setItem('schools', JSON.stringify(schools));
    return newSchool;
  },
  getSchools: async (): Promise<School[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(localStorage.getItem('schools') || '[]');
  }
};

const AddSchoolForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState<SchoolBase>({
    name: '',
    address: '',
    city: '',
    state: '',
    contact: '',
    email_id: '',
    image: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'School name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10 digits';
    }
    if (!formData.email_id.trim()) {
      newErrors.email_id = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_id)) {
      newErrors.email_id = 'Invalid email format';
    }
    if (!formData.image) newErrors.image = 'School image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const field = name as keyof SchoolBase;
    setFormData(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5000000) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
      setErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await mockAPI.addSchool(formData);
      onSuccess();
    } catch {
      setErrors({ submit: 'Failed to add school. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <School className="w-8 h-8 text-indigo-600" />
              Add New School
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter school name" />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter complete address" />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter city" />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter state" />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.contact ? 'border-red-500' : 'border-gray-300'}`} placeholder="10-digit number" />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contact}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.email_id ? 'border-red-500' : 'border-gray-300'}`} placeholder="school@example.com" />
                {errors.email_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email_id}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Image *</label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImagePlus className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.image}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Adding School...' : 'Add School'}
              </button>
              <button onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                Cancel
              </button>
            </div>

            {errors.submit && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SchoolCard = React.memo(({ school }: { school: School }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-48 overflow-hidden bg-gray-200">
      {school.image ? (
        <img src={school.image} alt={school.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <School className="w-16 h-16 text-gray-400" />
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{school.name}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
          <span className="line-clamp-2">{school.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 text-indigo-600" />
          <span className="font-medium">{school.city}</span>
        </div>
      </div>
    </div>
  </div>
));

const ShowSchools = ({ onAddNew }: { onAddNew: () => void }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ name: string; city: string; state: string }>({ name: '', city: '', state: '' });
  const [tempFilters, setTempFilters] = useState<{ name: string; city: string; state: string }>({ name: '', city: '', state: '' });
  const [showSuggestions, setShowSuggestions] = useState<{ name: boolean; city: boolean; state: boolean }>({ name: false, city: false, state: false });
  const [isPending, startTransition] = useTransition();

  useEffect(() => { loadSchools(); }, []);

  const uniqueValues = useMemo<Record<'name' | 'city' | 'state', string[]>>(() => ({
    name: Array.from(new Set(schools.map(s => s.name))),
    city: Array.from(new Set(schools.map(s => s.city))),
    state: Array.from(new Set(schools.map(s => s.state)))
  }), [schools]);

  const filteredSchools = useMemo<School[]>(() => {
    let filtered = schools;
    if (filters.name.trim()) {
      const n = filters.name.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(n));
    }
    if (filters.city.trim()) {
      const c = filters.city.toLowerCase();
      filtered = filtered.filter(s => s.city.toLowerCase().includes(c));
    }
    if (filters.state.trim()) {
      const st = filters.state.toLowerCase();
      filtered = filtered.filter(s => s.state.toLowerCase().includes(st));
    }
    return filtered;
  }, [schools, filters]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getSchools();
      setSchools(data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTempFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
    setShowSuggestions(prev => ({ ...prev, [name]: value.length > 0 }));
  }, []);

  const getSuggestions = useCallback((field: 'name' | 'city' | 'state') => {
    const value = tempFilters[field].toLowerCase();
    if (!value) return [];
    return uniqueValues[field].filter(item => item.toLowerCase().startsWith(value)).slice(0, 5);
  }, [tempFilters, uniqueValues]);

  const selectSuggestion = useCallback((field: 'name' | 'city' | 'state', value: string) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  }, []);

  const handleSearch = useCallback(() => {
    startTransition(() => { setFilters(tempFilters); });
  }, [tempFilters, startTransition]);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setFilters({ name: '', city: '', state: '' });
      setTempFilters({ name: '', city: '', state: '' });
      setShowSuggestions({ name: false, city: false, state: false });
    });
  }, [startTransition]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const hasActiveFilters = filters.name || filters.city || filters.state;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
            <Grid className="w-8 h-8 text-indigo-600" />
            Schools Directory
          </h1>
          <button onClick={onAddNew} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
            Add New School
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Search & Filter Schools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              <input type="text" name="name" value={tempFilters.name} onChange={handleTempFilterChange} onKeyPress={handleKeyPress} onFocus={() => tempFilters.name && setShowSuggestions(prev => ({ ...prev, name: true }))} onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, name: false })), 200)} placeholder="Search by name..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {showSuggestions.name && getSuggestions('name').length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getSuggestions('name').map((suggestion, index) => (
                    <div key={index} onClick={() => selectSuggestion('name', suggestion)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0">{suggestion}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" name="city" value={tempFilters.city} onChange={handleTempFilterChange} onKeyPress={handleKeyPress} onFocus={() => tempFilters.city && setShowSuggestions(prev => ({ ...prev, city: true }))} onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, city: false })), 200)} placeholder="Search by city..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {showSuggestions.city && getSuggestions('city').length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getSuggestions('city').map((suggestion, index) => (
                    <div key={index} onClick={() => selectSuggestion('city', suggestion)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0">{suggestion}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" name="state" value={tempFilters.state} onChange={handleTempFilterChange} onKeyPress={handleKeyPress} onFocus={() => tempFilters.state && setShowSuggestions(prev => ({ ...prev, state: true }))} onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, state: false })), 200)} placeholder="Search by state..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {showSuggestions.state && getSuggestions('state').length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getSuggestions('state').map((suggestion, index) => (
                    <div key={index} onClick={() => selectSuggestion('state', suggestion)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0">{suggestion}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button onClick={handleSearch} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              <Search className="w-5 h-5" />
              Search Schools
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200">
                <X className="w-5 h-5" />
                Clear All Filters
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold text-indigo-600">{filteredSchools.length}</span> school{filteredSchools.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filters.name && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">Name: {filters.name}</span>
                  )}
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">City: {filters.city}</span>
                  )}
                  {filters.state && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">State: {filters.state}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredSchools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {hasActiveFilters ? (
              <>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Schools Found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search filters</p>
                <button onClick={clearFilters} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  <X className="w-5 h-5" />
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Schools Added Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first school to the directory</p>
                <button onClick={onAddNew} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add First School
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function SchoolManagementApp() {
  const [currentPage, setCurrentPage] = useState<'list' | 'add'>('list');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentPage('list');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600">School has been added successfully</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'list' ? (
        <ShowSchools onAddNew={() => setCurrentPage('add')} />
      ) : (
        <AddSchoolForm onSuccess={handleAddSuccess} onCancel={() => setCurrentPage('list')} />
      )}
    </>
  );
}
