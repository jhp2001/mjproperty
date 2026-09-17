import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  
  // Search state
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  useEffect(() => {
    const loadProperties = async () => {
      const all = await api.getProperties();
      // Just show top 3 for featured
      setFeaturedProperties(all.slice(0, 3));
    };
    loadProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white pt-24 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Real Estate" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Find Your Next Property in Madurai
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12">
            Verified land and plot opportunities from trusted local sources.
          </p>
          
          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto backdrop-blur-sm bg-white/95">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Location (e.g., Othakadai)" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-900"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-900 appearance-none bg-white"
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                >
                  <option value="">Property Type</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                  <option value="House">House</option>
                </select>
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors md:w-auto w-full"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Properties</h2>
              <p className="text-slate-600">Discover our hand-picked real estate opportunities</p>
            </div>
            <Link to="/properties" className="hidden md:block text-blue-600 font-medium hover:underline">
              View all properties &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {featuredProperties.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No properties available right now.
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/properties" className="inline-block border border-slate-300 rounded-lg px-6 py-3 font-medium text-slate-700 hover:bg-slate-50">
              View all properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
