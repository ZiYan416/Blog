import fs from 'fs';
import path from 'path';
import https from 'https';

const VIDEOS = [
  {
    name: 'v-golden-hour.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4'
  },
  {
    name: 'v-still-water.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4'
  },
  {
    name: 'v-deep-woods.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4'
  },
  {
    name: 'v-quiet-dawn.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4'
  }
];

const targetDir = path.join(process.cwd(), 'public', 'videos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} -> ${destPath}`);
    const file = fs.createWriteStream(destPath);
    
    const request = (targetUrl) => {
      https.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }

        if (response.statusCode !== 200) {
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          return reject(new Error(`Status ${response.statusCode}`));
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log(`Saved ${destPath}`);
            resolve();
          });
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  for (const vid of VIDEOS) {
    const dest = path.join(targetDir, vid.name);
    // Download if not existing or if file size is very small
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000000) {
      try {
        await downloadFile(vid.url, dest);
      } catch (err) {
        console.error(`Failed ${vid.name}:`, err.message);
      }
    } else {
      console.log(`Already exists: ${vid.name}`);
    }
  }
  console.log('ALL 4 DISTINCT VIDEOS DOWNLOADED!');
}

main();
