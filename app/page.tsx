'use client'

import Image from "next/image";
import { useState } from 'react';

export default function Home() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Handwriting Recognition</h1>
    <input type="file" accept="image/*" onChange={handleFileUpload} />
    {loading && <p>Processing...</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}
    {extractedText && (
      <div>
        <h2>Recognized Text</h2>
        <pre>{extractedText}</pre>
      </div>
    )}
  </div>
  );
}
