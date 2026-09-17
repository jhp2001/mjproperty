import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Building, Users, MessageSquare, Plus } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    totalEnquiries: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const fetchStats = async () => {
      const properties = await api.getProperties();
      const enquiries = await api.getEnquiries();
      
      setStats({
        totalProperties: properties.length,
        availableProperties: properties.filter(p => p.status === 'available').length,
        soldProperties: properties.filter(p => p.status === 'sold').length,
        totalEnquiries: enquiries.length,
      });
      setLoading(false);
    };
    
    fetchStats();
  }, [isAuthenticated, user, navigate]);

  if (loading) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <Link 
            to="/admin/properties" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-slate-500 font-medium">Total Properties</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalProperties}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-slate-500 font-medium">Available</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.availableProperties}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-slate-500 font-medium">Sold</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.soldProperties}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-slate-500 font-medium">Total Enquiries</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalEnquiries}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Links</h2>
            <div className="space-y-4">
              <Link to="/admin/properties" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Building className="h-5 w-5 text-blue-600" /> Manage Properties
                </h3>
                <p className="text-sm text-slate-500">Add, edit, or remove property listings.</p>
              </Link>
              <Link to="/admin/enquiries" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <MessageSquare className="h-5 w-5 text-blue-600" /> Manage Enquiries
                </h3>
                <p className="text-sm text-slate-500">View and update customer leads.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
