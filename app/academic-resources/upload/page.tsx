'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FormData {
  title: string;
  description: string;
  author: string;
  institution: string;
  fileType: string;
  tags: string;
  agreeToTerms: boolean;
}

export default function UploadResourcePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    author: '',
    institution: '',
    fileType: '',
    tags: '',
    agreeToTerms: false
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and guidelines');
      return;
    }

    setUploading(true);

    try {
      // 1. Upload file to Supabase Storage (if file selected)
      let fileUrl = '';
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `resources/${fileName}`;
        
        console.log('Attempting to upload to bucket: uploads, path:', filePath);
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        console.log('File uploaded successfully:', uploadData);
        
        // Get public URL
        const { data } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);
        
        fileUrl = data.publicUrl;
        console.log('Public URL:', fileUrl);
      }

      // 2. Save resource to database
      const { data: resource, error } = await supabase
        .from('resources')
        .insert([{
          title: formData.title,
          description: formData.description,
          author: formData.author,
          institution: formData.institution,
          file_url: fileUrl,
          file_type: formData.fileType,
          file_size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'N/A',
          status: 'pending',
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          upvotes: 0,
          downvotes: 0,
          downloads: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setUploading(false);
      alert('✅ Resource submitted successfully! Awaiting admin approval.');
      router.push('/academic-resources');

    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Error uploading resource. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <main className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/academic-resources')}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to Resources
          </button>
          <h1 className="text-4xl font-bold mb-2">Upload Academic Resource</h1>
          <p className="text-gray-400">Share your academic materials with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Resource Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Advanced Calculus Notes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe your resource..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Institution</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Your school/university"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">File Type</label>
              <select
                name="fileType"
                value={formData.fileType}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select type</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File *</label>
              <input
                type="file"
                id="file-upload"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., calculus, mathematics, notes"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded border border-zinc-700"
              />
              <span className="text-sm">I agree to share this resource under the community guidelines *</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </main>
    </div>
  );
}