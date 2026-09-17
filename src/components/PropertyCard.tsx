import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, FileCheck } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const coverImage = property.images && property.images.length > 0 
    ? property.images[0].imageUrl 
    : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={coverImage} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-sm">
          {property.propertyType}
        </div>
        <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
          {property.status === 'available' ? 'Available' : 'Sold'}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-1">{property.title}</h3>
        </div>
        
        <p className="text-slate-500 text-sm flex items-center gap-1 mb-4">
          <MapPin className="h-4 w-4" /> {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-blue-500" />
            <span>{property.plotSize} sq.ft</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-blue-500" />
            <span>{property.approval}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-0.5">Price</p>
            <p className="text-xl font-extrabold text-blue-600">{formatPrice(property.price)}</p>
            <p className="text-xs text-slate-400 mt-1">{formatPrice(property.pricePerSqft)}/sq.ft</p>
          </div>
          <Link 
            to={`/property/${property.id}`}
            className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
