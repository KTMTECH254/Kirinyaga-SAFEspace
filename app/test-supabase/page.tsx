'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [buckets, setBuckets] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check Supabase connection
        setStatus('✓ Supabase client initialized\n');
        
        // Test 2: List buckets
        const { data: bucketList, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          setStatus(prev => prev + `✗ Buckets error: ${bucketsError.message}\n`);
          return;
        }
        
        setStatus(prev => prev + `✓ Successfully listed buckets\n`);
        setBuckets(bucketList || []);
        
        if (bucketList && bucketList.length > 0) {
          setStatus(prev => prev + `✓ Found ${bucketList.length} bucket(s):\n`);
          bucketList.forEach(b => {
            setStatus(prev => prev + `  - ${b.name} (public: ${b.public})\n`);
          });
        } else {
          setStatus(prev => prev + `✗ No buckets found\n`);
        }
        
      } catch (error: any) {
        setStatus(prev => prev + `✗ Error: ${error.message}\n`);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 font-mono text-sm whitespace-pre-wrap">
          {status}
        </div>
        
        {buckets.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Buckets Available:</h2>
            <div className="space-y-2">
              {buckets.map(bucket => (
                <div key={bucket.name} className="bg-zinc-900 rounded p-4 border border-zinc-800">
                  <p className="font-bold">{bucket.name}</p>
                  <p className="text-gray-400">Public: {bucket.public ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
