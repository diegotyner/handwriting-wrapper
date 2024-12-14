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
    <main>
      <div className='fixed inset-y-1/3 inset-x-0 flex space-x-4'>
        <div className='flex-1'>
          <h1 className='text-3xl w-full'>Handwriting Recognition</h1>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>

        <div className='flex-1'>
          {/* Image Preview */}
          {preview && (
              <div>
                <h2>Image Preview</h2>
                <img
                  src={preview}
                  alt="Preview"
                  className='max-w-full max-h-[300px] mb-5 border border-gray-300 rounded'
                />
              </div>
            )}
          {loading && <p>Processing...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {extractedText && (
            <div>
              <h2>Recognized Text</h2>
              <pre>{extractedText}</pre>
            </div>
          )}
        </div>  
      </div>
    </main>
  );
}
