const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const app = express();
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

app.post('/render', async (req, res) => {
  const { audio_url, background_video_url } = req.body;

  if (!audio_url || !background_video_url) {
    return res.status(400).json({ error: "Missing audio_url or background_video_url" });
  }

  const audioPath = path.join(__dirname, 'input.mp3');
  const videoPath = path.join(__dirname, 'background.mp4');
  const outputPath = path.join(OUTPUT_DIR, `${Date.now()}.mp4`);

  try {
    const audioFile = await axios.get(audio_url, { responseType: 'arraybuffer' });
    fs.writeFileSync(audioPath, Buffer.from(audioFile.data));

    const videoFile = await axios.get(background_video_url, { responseType: 'arraybuffer' });
    fs.writeFileSync(videoPath, Buffer.from(videoFile.data));

    const ffmpegCmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v libx264 -t 60 -c:a aac -shortest -vf "scale=1080:1920" "${outputPath}"`;

    exec(ffmpegCmd, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'FFmpeg failed' });
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/output/${path.basename(outputPath)}`;
      res.json({ fileUrl });
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to download or process media.' });
  }
});

app.use('/output', express.static(OUTPUT_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
