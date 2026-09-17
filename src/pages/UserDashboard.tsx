import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Enquiry } from '../types';
import { User as UserIcon, Calendar, MessageSquare, Clock } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const fetchEnquiries = async () => {
      if (user) {
        const data = await api.getEnquiriesByUser(user.id);
        setEnquiries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      setLoading(false);
    };
    fetchEnquiries();
  }, [isAuthenticated, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                  <p className="text-sm font-medium text-blue-600 capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Mobile Number</p>
                  <p className="text-slate-900">+91 {user.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Member Since
                  </p>
                  <p className="text-slate-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enquiries List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-6 w-6 text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900">My Enquiries</h2>
              </div>
              
              {enquiries.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <p className="text-slate-500 mb-4">You haven't enquired about any properties yet.</p>
                  <button 
                    onClick={() => navigate('/properties')}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map(enquiry => (
                    <div key={enquiry.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                          {enquiry.property?.title || 'Unknown Property'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-3">{enquiry.property?.location}</p>
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3 w-3" /> {formatDate(enquiry.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-md ${
                            enquiry.status === 'New' ? 'bg-blue-100 text-blue-700' :
                            enquiry.status === 'Closed' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            Status: {enquiry.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col justify-end">
                        <button 
                          onClick={() => navigate(`/property/${enquiry.propertyId}`)}
                          className="text-sm font-medium text-blue-600 hover:underline text-right"
                        >
                          View Property
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
