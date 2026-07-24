import fs from 'fs';
import path from 'path';
import https from 'https';

const URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4';
const dest = path.join(process.cwd(), 'public', 'videos', 'night-2.mp4');

function download() {
  const file = fs.createWriteStream(dest);
  https.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': '*/*'
    }
  }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return downloadRedirect(res.headers.location);
    }
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => console.log('night-2.mp4 (Quiet Dawn) saved successfully!'));
    });
  }).on('error', (err) => {
    console.error('Retry download...', err.message);
    setTimeout(download, 2000);
  });
}

function downloadRedirect(targetUrl) {
  const file = fs.createWriteStream(dest);
  https.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': '*/*'
    }
  }, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => console.log('night-2.mp4 (Quiet Dawn) saved successfully!'));
    });
  }).on('error', (err) => {
    console.error('Retry download...', err.message);
    setTimeout(download, 2000);
  });
}

download();
