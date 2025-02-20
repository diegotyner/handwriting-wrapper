'use client'

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState("");
  
  const processImage = async (file: File | Blob) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError("");
    setExtractedText("");

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
      setError("");
      setLoading(false)
    } catch (err) {
      setLoading(false)
      let message = "Error in processing image"
      setError(message);
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    await processImage(file);
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    if (loading) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          setPreviewImage(URL.createObjectURL(blob)); // Set pasted image
          await processImage(blob);
          return; // Stop after the first image is pasted
        }
      }
    }
  }, [loading, processImage]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);


  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(extractedText);
    setTimeout(() => setCopied(""), 3000);
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
            disabled={loading}
            className="mb-4"
          />
          {loading && <p>Processing...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {extractedText && (
            <div className="mt-4">
              <div className='w-full flex flex-row justify-between items-center'>
                <h2 className="text-xl font-medium mb-2 text-left">Recognized Text</h2>
                <div>
                  <div className='mr-4 w-7 h-7 rounded-full bg-white/10 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur flex justify-center items-center cursor-pointer'
                  onClick={handleCopy}>
                    <Image
                      src={
                        copied === extractedText
                          ? "/tick.svg"
                          : "/copy.svg"
                      }
                      alt={copied === extractedText ? "tick_icon" : "copy_icon"}
                      width={12}
                      height={12}
                    />
                  </div>
                </div>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md text-wrap">{extractedText}</pre>
            </div>
          )}
        </div>
  
        {/* Right Column */}
        <div className="flex flex-col items-center">
          {previewImage && (
            <div className="mb-4">
              <h2 className="text-xl font-medium mb-2">Selected Image</h2>
              <Image
                src={previewImage}
                alt="Submitted Image"
                width={500} 
                height={300}
                className="max-w-full max-h-[300px] border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );  
}
