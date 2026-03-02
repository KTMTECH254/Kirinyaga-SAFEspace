'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Shield,
  AlertTriangle,
  Info,
  ArrowLeft,
  Loader2
} from 'lucide-react';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      setUploadStatus('Please agree to the terms and guidelines.');
      return;
    }

    if (!selectedFile) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      // 1. Upload file to Supabase Storage with progress tracking
      let fileUrl = '';
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      console.log('Attempting to upload to bucket: uploads, path:', filePath);
      setUploadStatus('Uploading file...');

      // Create a custom XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          setUploadStatus(`Uploading file... ${percentComplete}%`);
        }
      });

      // Get the upload URL from Supabase
      const { data: uploadData, error: uploadUrlError } = await supabase.storage
        .from('uploads')
        .createSignedUploadUrl(filePath);

      if (uploadUrlError) {
        throw new Error(`Failed to get upload URL: ${uploadUrlError.message}`);
      }

      // Upload the file
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('PUT', uploadData.signedUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(selectedFile);
      });

      await uploadPromise;

      console.log('File uploaded successfully');

      // Get public URL
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      fileUrl = data.publicUrl;
      console.log('Public URL:', fileUrl);

      setUploadProgress(100);
      setUploadStatus('Saving resource information...');

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
          file_size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
          status: 'pending',
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          upvotes: 0,
          downvotes: 0,
          downloads: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setUploadStatus('Upload completed successfully!');
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Error uploading resource. Please try again.');
      setUploading(false);
      setUploadProgress(0);
      return;
    } finally {
      setUploading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    router.replace('/education?section=community-resource');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-hidden relative">
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Resource submitted</h3>
                <p className="text-sm text-gray-300">
                  Your resource was uploaded successfully and is awaiting admin approval.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSuccessOk}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating calming elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl animate-pulse delay-300"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gray-800/80 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-gray-700 shadow-lg">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">
              📚 Academic Resource Upload
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Share Your
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              {' '}Knowledge
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Contribute to our academic community by sharing research papers, guides, and educational resources
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700 p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title */}
                <div>
                  <label className="block text-gray-200 font-semibold mb-2">
                    Resource Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., CBT for Anxiety in Kenyan Students"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-200 font-semibold mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Provide a detailed description of the resource..."
                  />
                </div>

                {/* Author and Institution */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 font-semibold mb-2">
                      Author <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Dr. Jane Mwangi"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 font-semibold mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., University of Nairobi"
                    />
                  </div>
                </div>

                {/* File Type and File Upload */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 font-semibold mb-2">
                      File Type
                    </label>
                    <select
                      name="fileType"
                      value={formData.fileType}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="pdf">📄 PDF Document</option>
                      <option value="doc">📝 Word Document (.doc)</option>
                      <option value="docx">📝 Word Document (.docx)</option>
                      <option value="video">🎥 Video</option>
                      <option value="audio">🎵 Audio</option>
                      <option value="other">📎 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-200 font-semibold mb-2">
                      File <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      required
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:bg-indigo-600 file:text-white file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 file:hover:bg-indigo-700"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-400 mt-2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{uploadStatus}</span>
                      <span className="text-indigo-400 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-gray-200 font-semibold mb-2">
                    Tags <span className="text-sm font-normal text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., anxiety, CBT, Kenya"
                  />
                </div>

                {/* Terms Agreement */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border border-gray-600 bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to share this resource under the community guidelines <span className="text-red-400">*</span>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700 p-6 shadow-xl sticky top-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Upload Guidelines
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Academic Quality</p>
                    <p className="text-sm text-gray-400">Only share peer-reviewed research, academic papers, or educational materials</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Proper Attribution</p>
                    <p className="text-sm text-gray-400">Include complete author information and institutional affiliation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Copyright Respect</p>
                    <p className="text-sm text-gray-400">Only upload content you have permission to share or public domain materials</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Review Process</p>
                    <p className="text-sm text-gray-400">All submissions are reviewed by our academic team before publication</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">No Personal Data</p>
                    <p className="text-sm text-gray-400">Do not include any personal health information or identifiable patient data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Community Benefit</p>
                    <p className="text-sm text-gray-400">Resources should benefit the mental health education community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/education')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Education Center
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pt-8 pb-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            📚 Contribute to our academic community • All submissions are reviewed for quality and relevance
          </p>
        </div>
      </footer>
    </div>
  );
}
