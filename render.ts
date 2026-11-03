 
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import Replicate from 'replicate';
import path from 'path';
import fs from 'fs';

const replicate = new Replicate();

async function run() {
  try {
    console.log("⏳ [1/4] Open-source AI Video Model started...");
    
    const imagePath = path.resolve('./9e428efed4e54d7c3db3c8e55b237e8b.jpg'); 
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found at: ${imagePath}`);
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/JPG;base64,${imageBuffer.toString('base64')}`;

    const prediction = await replicate.run(
      "stability-ai/stable-video-diffusion:3f045714",
      { input: { input_image: base64Image } }
    );

    const aiVideoUrl = (prediction as string[])[0];
    if (!aiVideoUrl) throw new Error("AI Model failed to generate video URL.");
    
    console.log(`✅ [2/4] AI Video URL generated successfully: ${aiVideoUrl}`);

    console.log("📦 [3/4] Remotion is bundling your React components...");
    const bundleLocation = await bundle(path.resolve('./src/index.ts'));
    
    const composition = await selectComposition({
      bundleLocation,
      id: "AiGeneratedVideo",
      inputProps: { aiVideoUrl }
    });

    console.log("🎬 [4/4] Remotion is rendering the final MP4 video...");
    const outputLocation = path.resolve('./output/final-video.mp4');
    
    await renderMedia({
      bundleLocation,
      composition,
      outputLocation,
      codec: 'h264',
    });

    console.log(`🎉 Success! Video saved at: ${outputLocation}`);
  } catch (e) {
    console.error("🔴 Error occurred during execution:", e);
  }
}

run();