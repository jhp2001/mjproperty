import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Building, ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminProperties: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    propertyType: 'Residential Plot',
    location: '',
    address: '',
    plotSize: 0,
    price: 0,
    pricePerSqft: 0,
    approval: 'DTCP',
    roadWidth: '',
    facing: '',
    status: 'available',
    images: [],
    amenities: []
  });
  const [imageUrl, setImageUrl] = useState('');

  const fetchProperties = async () => {
    const data = await api.getProperties();
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProperties();
  }, [isAuthenticated, user, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await api.deleteProperty(id);
      fetchProperties();
    }
  };

  const handleStatusChange = async (property: Property, newStatus: string) => {
    await api.saveProperty({ id: property.id, status: newStatus as any });
    fetchProperties();
  };
  
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare property object
    const newProp = {
      ...formData,
      pricePerSqft: formData.plotSize && formData.plotSize > 0 
        ? Math.round(Number(formData.price) / Number(formData.plotSize)) 
        : 0,
      images: imageUrl ? [{ id: `img-${Date.now()}`, propertyId: '', imageUrl, sortOrder: 0 }] : []
    };
    
    await api.saveProperty(newProp);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      title: '', description: '', propertyType: 'Residential Plot', location: '', address: '',
      plotSize: 0, price: 0, pricePerSqft: 0, approval: 'DTCP', roadWidth: '', facing: '', status: 'available', images: [], amenities: []
    });
    setImageUrl('');
    fetchProperties();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Properties</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Property
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">Property</th>
                  <th className="p-4 font-semibold text-slate-600">Price</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => (
                    <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={property.images?.[0]?.imageUrl || 'https://via.placeholder.com/150'} 
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{property.title}</p>
                            <p className="text-sm text-slate-500">{property.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{formatPrice(property.price)}</p>
                      </td>
                      <td className="p-4">
                        <select
                          className={`text-sm font-semibold rounded-lg px-3 py-1.5 border-2 ${
                            property.status === 'available' ? 'border-green-200 bg-green-50 text-green-700' :
                            property.status === 'sold' ? 'border-red-200 bg-red-50 text-red-700' :
                            'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                          value={property.status}
                          onChange={(e) => handleStatusChange(property, e.target.value)}
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="unpublished">Unpublished</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleDelete(property.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-slate-900">Add New Property</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProperty} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. DTCP Approved Corner Plot" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                  <select value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Land">Land</option>
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Approval</label>
                  <select value={formData.approval} onChange={e => setFormData({...formData, approval: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="DTCP">DTCP</option>
                    <option value="RERA">RERA</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Panchayat">Panchayat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location Area (e.g. Othakadai)</label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                  <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plot Size (sq.ft)</label>
                  <input type="number" required min="0" value={formData.plotSize || ''} onChange={e => setFormData({...formData, plotSize: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Price (₹)</label>
                  <input type="number" required min="0" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facing</label>
                  <input type="text" value={formData.facing} onChange={e => setFormData({...formData, facing: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. North" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Road Width</label>
                  <input type="text" value={formData.roadWidth} onChange={e => setFormData({...formData, roadWidth: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 30 ft" />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Main Image URL</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com/image.jpg" />
                  <p className="text-xs text-slate-500 mt-1">For MVP, please provide a direct URL to an image.</p>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Describe the property..."></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Property</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
