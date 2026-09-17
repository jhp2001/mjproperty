import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { 
  MapPin, Maximize, FileCheck, Compass, Map, 
  ArrowLeft, CheckCircle2, MessageCircle
} from 'lucide-react';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        const data = await api.getPropertyById(id);
        setProperty(data);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const handleEnquire = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!property) return;

    // 1. Save Enquiry to DB
    await api.createEnquiry(user.id, property.id);

    // 2. Open WhatsApp
    const adminPhone = import.meta.env.VITE_ADMIN_WHATSAPP || '919876543210'; // Fallback for dev
    const message = `Hi MJ Properties,

I am interested in this property:

Property: ${property.title}
Location: ${property.address}
Plot Size: ${property.plotSize} sq.ft
Price: ₹${property.price.toLocaleString('en-IN')}

My name: ${user.name}
I am a: ${user.role === 'admin' ? 'Buyer' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}

Please share more details.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Property Not Found</h2>
        <Link to="/properties" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {property.propertyType}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {property.status === 'available' ? 'Available' : 'Sold'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
            <p className="text-slate-500 flex items-center gap-1.5 text-lg">
              <MapPin className="h-5 w-5" /> {property.address}
            </p>
          </div>
          
          <div className="text-left lg:text-right bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Asking Price</p>
            <p className="text-3xl md:text-4xl font-extrabold text-blue-600 my-1">{formatPrice(property.price)}</p>
            <p className="text-sm text-slate-400 font-medium">{formatPrice(property.pricePerSqft)} / sq.ft</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Images + Details) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 p-2">
              <div className="aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 mb-2">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[activeImage].imageUrl} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No image available</div>
                )}
              </div>
              
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {property.images.map((img, idx) => (
                    <button 
                      key={img.id}
                      onClick={() => setActiveImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-blue-600' : 'border-transparent'}`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Property Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* CTA Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interested in this property?</h3>
              <p className="text-slate-500 text-sm mb-6">Contact us directly to get more details or arrange a site visit.</p>
              
              <button 
                onClick={handleEnquire}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <MessageCircle className="h-6 w-6" />
                <span>Enquire on WhatsApp</span>
              </button>
              
              {!isAuthenticated && (
                <p className="text-xs text-center text-slate-400 mt-4">
                  You will be asked to log in to proceed.
                </p>
              )}
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                    <Maximize className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Plot Size</p>
                    <p className="font-semibold text-slate-900">{property.plotSize} sq.ft</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Approval</p>
                    <p className="font-semibold text-slate-900">{property.approval}</p>
                    {property.reraNumber && (
                      <p className="text-xs text-slate-400 mt-1">RERA: {property.reraNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Facing</p>
                    <p className="font-semibold text-slate-900">{property.facing || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                    <Map className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Road Width</p>
                    <p className="font-semibold text-slate-900">{property.roadWidth || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};

export default PropertyDetails;
