import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Search, MapPin, Filter } from 'lucide-react';

const Properties: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [budget, setBudget] = useState('');
  const [approval, setApproval] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    let all = await api.getProperties();
    
    // Apply filters locally since we're using a mock DB
    if (location) {
      all = all.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (propertyType) {
      all = all.filter(p => p.propertyType === propertyType);
    }
    if (approval) {
      all = all.filter(p => p.approval === approval);
    }
    if (budget) {
      switch (budget) {
        case 'under-10':
          all = all.filter(p => p.price < 1000000);
          break;
        case '10-20':
          all = all.filter(p => p.price >= 1000000 && p.price < 2000000);
          break;
        case '20-30':
          all = all.filter(p => p.price >= 2000000 && p.price < 3000000);
          break;
        case '30-50':
          all = all.filter(p => p.price >= 3000000 && p.price < 5000000);
          break;
        case '50-plus':
          all = all.filter(p => p.price >= 5000000);
          break;
      }
    }
    
    setProperties(all);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties for Sale</h1>
          <p className="text-slate-600">Browse verified plots and lands in Madurai.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
                <Filter className="h-5 w-5" /> Filters
              </div>
              
              <form onSubmit={handleFilterSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g., Othakadai" 
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Land">Land</option>
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="under-10">Under ₹10L</option>
                    <option value="10-20">₹10L - ₹20L</option>
                    <option value="20-30">₹20L - ₹30L</option>
                    <option value="30-50">₹30L - ₹50L</option>
                    <option value="50-plus">₹50L+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Approval</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
                    value={approval}
                    onChange={e => setApproval(e.target.value)}
                  >
                    <option value="">Any Approval</option>
                    <option value="DTCP">DTCP</option>
                    <option value="RERA">RERA</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Panchayat">Panchayat</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
                >
                  <Search className="h-4 w-4" />
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-xl text-slate-500 mb-4">No properties found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setLocation('');
                    setPropertyType('');
                    setBudget('');
                    setApproval('');
                    fetchProperties();
                  }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
