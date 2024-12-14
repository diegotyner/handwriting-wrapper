import { NextResponse } from 'next/server';
import sharp from 'sharp';


export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new NextResponse('Invalid content type', { status: 400 });
    }
    
    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof Blob)) {
      return new NextResponse('No file provided', { status: 400 });
    }


    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const processedBuffer = await sharp(buffer)
        .grayscale()
        .resize(1024) 
        .toBuffer();

    const API_KEY = process.env.API_KEY
    const ocrApiUrl = 'https://api.ocr.space/parse/image';
    
    const formData = new FormData();
    formData.append('apikey', API_KEY);
    formData.append('language', 'eng');
    formData.append('scale', 'true'); 
    formData.append('detectOrientation', 'true');
    formData.append('file', new Blob([processedBuffer]), file.name);

    const ocrResponse = await fetch(ocrApiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      console.error('OCR.space API error:', await ocrResponse.text());
      return new NextResponse('Failed to process the image', { status: 500 });
    }
    const ocrResult = await ocrResponse.json();
    console.log(ocrResult)

    
    const extractedText =
      ocrResult?.ParsedResults?.map((result) => result.ParsedText).join('\n') || '';

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('Error processing image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
