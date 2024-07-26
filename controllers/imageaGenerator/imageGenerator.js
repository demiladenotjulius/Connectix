import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateEventImage = async (eventName, eventDate) => {
  try {
    const width = 1024;
    const height = 1024;
    
    // Create a unique filename using a timestamp
    const timestamp = Date.now();
    const filename = `event_image_${timestamp}.png`;
    const outputPath = path.resolve(__dirname, '..', '..', 'public', 'images', filename);

    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const eventNameStr = String(eventName);
    const eventDateStr = String(eventDate);

    const escapeXml = (unsafe) => {
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
        }
      });
    };

    const svgImage = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="black"/>
        <style>
          .title {
            fill: white;
            font-size: 80px;
            font-weight: 500;
            font-family: "Brush Script MT", cursive;
          }
          .date {
            fill: white;
            font-size: 40px;
            font-family: Arial, sans-serif;
          }
        </style>
        <text x="50%" y="45%" text-anchor="middle" class="title">${escapeXml(eventNameStr)}</text>
        <text x="50%" y="60%" text-anchor="middle" class="date">${escapeXml(eventDateStr)}</text>
      </svg>
    `;

    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite([{
      input: Buffer.from(svgImage),
      top: 0,
      left: 0
    }])
    .png()
    .toFile(outputPath);

    console.log(`Event image generated and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating event image:', error);
    throw error;
  }
}