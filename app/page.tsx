'use client'

import { useState } from 'react';

export default function Home() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(false);
    setExtractedText(null);

    try {
      const response = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process the image');
      }

      const data = await response.json();
      setExtractedText(data.text);
      setError(false);
    } catch (error) {
      setError(true);
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-11/12 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white shadow-lg rounded-lg">
        {/* Left Column */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-semibold text-center mb-4">
            Handwriting Recognition
          </h1>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="mb-4"
          />
        </div>
  
        {/* Right Column */}
        <div className="flex flex-col items-center">
          {preview && (
            <div className="mb-4">
              <h2 className="text-xl font-medium mb-2">Image Preview</h2>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-[300px] border border-gray-300 rounded"
              />
            </div>
          )}
          {loading && <p className="text-blue-500">Processing...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {extractedText && (
            <div className="mt-4">
              <h2 className="text-xl font-medium mb-2">Recognized Text</h2>
              <pre className="bg-gray-100 p-4 rounded-md">{extractedText}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );  
}
