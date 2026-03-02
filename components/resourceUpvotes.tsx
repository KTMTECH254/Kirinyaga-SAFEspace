'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ThumbsUp } from 'lucide-react';

export default function ResourceUpvote({ resourceId }: { resourceId: string }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get current upvote count
  useEffect(() => {
    fetchUpvoteCount();
    checkIfUpvoted();
  }, [resourceId]);

  const fetchUpvoteCount = async () => {
    const { data } = await supabase
      .from('resources')
      .select('upvotes')
      .eq('id', resourceId)
      .single();
    
    if (data) {
      setUpvoteCount(data.upvotes || 0);
    }
  };

  const checkIfUpvoted = async () => {
    const userData = localStorage.getItem('anonymousUser');
    const userId = userData ? JSON.parse(userData).id : null;
    
    if (!userId) return;

    const { data } = await supabase
      .from('resource_upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    setUpvoted(!!data);
  };

  const handleUpvote = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('anonymousUser');
      const userId = userData ? JSON.parse(userData).id : null;

      if (!userId) {
        alert('Please refresh the page to get a user ID');
        return;
      }

      if (upvoted) {
        // Remove upvote
        await supabase
          .from('resource_upvotes')
          .delete()
          .eq('user_id', userId)
          .eq('resource_id', resourceId);

        // Update count in resources table
        await supabase
          .from('resources')
          .update({ upvotes: upvoteCount - 1 })
          .eq('id', resourceId);

        setUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      } else {
        // Add upvote
        await supabase
          .from('resource_upvotes')
          .insert([{
            user_id: userId,
            resource_id: resourceId
          }]);

        // Update count in resources table
        await supabase
          .from('resources')
          .update({ upvotes: upvoteCount + 1 })
          .eq('id', resourceId);

        setUpvoted(true);
        setUpvoteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        upvoted 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ThumbsUp className="w-5 h-5" />
      <span className="font-medium">{upvoteCount}</span>
      <span>{upvoted ? 'Upvoted' : 'Upvote'}</span>
    </button>
  );
}