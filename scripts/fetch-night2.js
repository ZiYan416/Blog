import fs from 'fs';
import path from 'path';
import https from 'https';

const URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4";
const dest = path.join(process.cwd(), "public", "videos", "night-2.mp4");

function download(targetUrl) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    console.log(`Fetching ${targetUrl}...`);

    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        console.log(`Following redirect to ${res.headers.location}`);
        return download(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return reject(new Error(`Failed code ${res.statusCode}`));
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          console.log(`Download finished! Size: ${stats.size} bytes`);
          resolve(stats.size);
        });
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  let success = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Attempt ${attempt}...`);
      const size = await download(URL);
      if (size > 1000000) {
        console.log("SUCCESS! Video night-2.mp4 downloaded completely!");
        success = true;
        break;
      }
    } catch (e) {
      console.error(`Attempt ${attempt} error:`, e.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!success) {
    console.log("Fallback: copying night-1.mp4 to night-2.mp4 so it never breaks!");
    fs.copyFileSync(
      path.join(process.cwd(), "public", "videos", "night-1.mp4"),
      dest
    );
  }
}

run();
