const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addConversionTask, conversionQueue, cancelCurrentJob } = require('./queue');

const app = express();
const PORT = process.env.PORT || 5001; // ✅ Используем переменную окружения

const upload = multer({ 
  dest: 'uploads/', 
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/json') {
      return cb(new Error('Only JSON files are allowed.'));
    }
    cb(null, true);
  }
});

app.use(cors()); 
app.use(express.json());

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
app.use('/output', express.static(outputDir));

app.post('/cancel', async (req, res) => {
  try {
      cancelCurrentJob();
      await conversionQueue.clean(0, 'delayed');
      await conversionQueue.clean(0, 'wait');
      await conversionQueue.clean(0, 'active');

      res.json({ message: 'Обработка отменена' });
  } catch (error) {
      console.error("Ошибка при отмене задачи:", error);
      res.status(500).json({ error: 'Ошибка при отмене' });
  }
});

app.post('/convert', upload.single('lottie'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const jsonPath = path.join(__dirname, req.file.path);
  let fps = req.body.fps;

  try {
    const lottieJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!lottieJson || !lottieJson.op) {
      throw new Error('Invalid Lottie JSON file');
    }

    if (fps === "auto") {
      fps = lottieJson.fr || 30; 
    } else {
      fps = parseInt(fps, 10);
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid Lottie JSON file' });
  }

  const videoFileName = `${Date.now()}.mp4`;
  const videoPath = path.join(outputDir, videoFileName);

  console.log(`Файл загружен: ${jsonPath}, FPS: ${fps}`);
  console.log(`Видео будет сохранено как: ${videoPath}`);

  try {
    addConversionTask(jsonPath, videoPath, fps);
    console.log(`Добавляем задачу в очередь: ${videoFileName}`);

    res.json({ message: 'Файл поставлен в очередь на обработку', videoFileName });
  } catch (error) {
    console.error("Ошибка при добавлении задачи:", error);
    res.status(500).json({ error: 'Ошибка при добавлении задачи в очередь' });
  }
});

// ✅ Новый API-метод для проверки готовности видео
app.get('/check-video/:videoFile', (req, res) => {
  const videoPath = path.join(outputDir, req.params.videoFile);
  res.json({ ready: fs.existsSync(videoPath) });
});

// ✅ Улучшенная отдача видео с отложенным удалением
app.get('/output/:videoFile', (req, res) => {
  const videoPath = path.join(outputDir, req.params.videoFile);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Видео не найдено' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${req.params.videoFile}"`);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  res.sendFile(videoPath, (err) => {
    if (!err) {
      console.log(`Видео ${req.params.videoFile} скачано, запущено удаление через 5 минуты`);
      setTimeout(() => {
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`Видео ${req.params.videoFile} удалено.`);
        }
      }, 5 * 60 * 1000);
    }
  });
});

// ❌ Удаляем дублирующийся `app.listen(port, () => {})`

// ✅ Оставляем только ОДИН `app.listen()`
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
