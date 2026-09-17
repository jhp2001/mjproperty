import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Enquiry } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const AdminEnquiries: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    const data = await api.getEnquiries();
    setEnquiries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchEnquiries();
  }, [isAuthenticated, user, navigate]);

  const handleStatusChange = async (id: string, status: string) => {
    await api.updateEnquiryStatus(id, status);
    fetchEnquiries();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Enquiries</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600">Customer</th>
                  <th className="p-4 font-semibold text-slate-600">Property</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm text-slate-600">
                        {formatDate(enquiry.createdAt)}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{enquiry.user?.name}</p>
                        <p className="text-sm text-slate-500">+91 {enquiry.user?.mobile}</p>
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">{enquiry.user?.role}</span>
                      </td>
                      <td className="p-4">
                        <Link to={`/property/${enquiry.propertyId}`} className="font-semibold text-blue-600 hover:underline">
                          {enquiry.property?.title}
                        </Link>
                        <p className="text-sm text-slate-500">{enquiry.property?.location}</p>
                      </td>
                      <td className="p-4">
                        <select
                          className={`text-sm font-semibold rounded-lg px-3 py-1.5 border-2 ${
                            enquiry.status === 'New' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            enquiry.status === 'Closed' ? 'border-green-200 bg-green-50 text-green-700' :
                            enquiry.status === 'Contacted' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                            'border-yellow-200 bg-yellow-50 text-yellow-700'
                          }`}
                          value={enquiry.status}
                          onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Site Visit">Site Visit</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Booked">Booked</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
