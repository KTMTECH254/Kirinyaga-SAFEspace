'use client';

import { useState, useEffect } from 'react';
import { supabase, Resource } from '@/supabase';

export default function AcademicResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      await supabase
        .from('resources')
        .update({ upvotes: resource.upvotes + 1 })
        .eq('id', resourceId);

      fetchResources();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownload = async (resourceId: string, resource: Resource) => {
    try {
      await supabase
        .from('resources')
        .update({ downloads: resource.downloads + 1 })
        .eq('id', resourceId);

      fetchResources();

      if (resource.file_url) {
        window.open(resource.file_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-500 mb-4">Academic Resources</h1>
          <p className="text-zinc-400">Share and access educational materials for mental health</p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="text-zinc-400">
            Showing {resources.length} approved resources
          </div>
          <button
            onClick={() => window.location.href = '/academic-resources/upload'}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium"
          >
            Upload Resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 rounded-lg">
            <p className="text-zinc-400">No resources available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-green-800 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{resource.title}</h2>
                    <p className="text-zinc-400 text-sm">By {resource.author}</p>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                    {resource.file_type || 'PDF'}
                  </span>
                </div>

                <p className="text-zinc-300 mb-6 line-clamp-2">{resource.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {resource.tags?.map(tag => (
                    <span key={tag} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                  <div className="flex gap-6">
                    <button
                      onClick={() => handleUpvote(resource.id)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-green-400"
                    >
                      <span className="text-lg">👍</span>
                      <span>{resource.upvotes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-zinc-400">
                      <span className="text-lg">⬇️</span>
                      <span>{resource.downloads}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleDownload(resource.id, resource)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}