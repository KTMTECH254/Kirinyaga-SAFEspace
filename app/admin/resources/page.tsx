'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, Eye, Download, Search, RefreshCw, LogOut } from 'lucide-react';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Check if already logged in
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_logged_in');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchResources();
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('admin-resources-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resources' },
        (payload) => {
          setResources(prev => {
            if (payload.eventType === 'INSERT') {
              const exists = prev.some(r => r.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            }

            if (payload.eventType === 'UPDATE') {
              return prev.map(r => (r.id === payload.new.id ? payload.new : r));
            }

            if (payload.eventType === 'DELETE') {
              return prev.filter(r => r.id !== payload.old.id);
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Fetch all resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert('Error loading resources');
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_logged_in', 'true');
      fetchResources();
    } else {
      alert('Invalid password. Use: admin123');
    }
  };

  // 🔴 CRITICAL FIX: Updated approve/reject function with updated_at
  const updateResourceStatus = async (id: string, status: 'approved' | 'rejected', notes: string = '') => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          status,
          admin_notes: notes,
          reviewed_by: 'admin',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString() // 🔴 ADD THIS LINE - TRIGGERS REAL-TIME
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setResources(resources.map(resource =>
        resource.id === id 
          ? { 
              ...resource, 
              status, 
              admin_notes: notes,
              reviewed_by: 'admin',
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString() // 🔴 ADD THIS LINE
            }
          : resource
      ));

      alert(`Resource marked as ${status}! It will appear immediately in the education hub.`);
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Error updating resource');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_logged_in');
    setResources([]);
    setAdminPassword('');
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    if (filter !== 'all' && resource.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.author?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Count by status
  const pendingCount = resources.filter(r => r.status === 'pending').length;
  const approvedCount = resources.filter(r => r.status === 'approved').length;
  const rejectedCount = resources.filter(r => r.status === 'rejected').length;

  // 🔴 LOGIN PAGE (if not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-gray-400">Enter password to manage resources</p>
            <p className="text-gray-500 text-sm mt-2">Default password: admin123</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🟢 ADMIN PANEL (if authenticated)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
            <p className="text-gray-600 mt-1">
              Approve or reject submitted resources • 
              <span className="text-green-600 font-medium ml-2">⚡ Real-time updates enabled</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchResources}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                All ({resources.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
            
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No resources found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column - Resource Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{resource.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            resource.status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : resource.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {resource.status.toUpperCase()}
                          </span>
                          <span className="text-gray-600">By: {resource.author}</span>
                          {resource.institution && (
                            <span className="text-gray-600">• {resource.institution}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700">{resource.description}</p>

                    {/* File Info */}
                    {resource.file_url && (
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          onClick={() => window.open(resource.file_url, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View File
                        </button>
                        <span className="text-sm text-gray-600">
                          Type: {resource.file_type || 'N/A'} • Size: {resource.file_size || 'N/A'}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {resource.tags.slice(0, 5).map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                      <span>👍 {resource.upvotes || 0} upvotes</span>
                      <span>👎 {resource.downvotes || 0} downvotes</span>
                      <span>📥 {resource.downloads || 0} downloads</span>
                    </div>
                  </div>

                  {/* Right Column - Admin Actions */}
                  <div className="md:w-64 space-y-4">
                    {resource.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => {
                            const notes = prompt('Approval notes (optional):') || '';
                            updateResourceStatus(resource.id, 'approved', notes);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <Check className="w-5 h-5" />
                          Approve Resource
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Rejection reason (required):') || '';
                            if (notes) {
                              updateResourceStatus(resource.id, 'rejected', notes);
                            } else {
                              alert('Please provide a reason for rejection');
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                          Reject Resource
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                          <p className="mt-1 text-sm text-gray-600">{resource.admin_notes || 'No notes provided'}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            Reviewed by: {resource.reviewed_by || 'admin'} • 
                            {resource.reviewed_at && ` On: ${new Date(resource.reviewed_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newStatus = resource.status === 'approved' ? 'rejected' : 'approved';
                            const notes = prompt(`Change status to ${newStatus}. Notes:`) || '';
                            if (notes !== null) {
                              updateResourceStatus(resource.id, newStatus, notes);
                            }
                          }}
                          className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        >
                          Change Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
