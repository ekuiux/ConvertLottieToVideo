const cors = require('cors');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const multer = require('multer');

const app = express();
const port = 5001;
const upload = multer({ dest: 'uploads/' });

// Разрешаем CORS для всех запросов
app.use(cors());

app.use(express.static('public'));

app.post('/convert', upload.single('lottie'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');

    const jsonPath = path.join(__dirname, req.file.path);
    const framesDir = path.join(__dirname, 'frames');
    const outputVideo = path.join(__dirname, 'output.mp4');
    
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    const lottieJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Запуск Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });  // Размер окна для высокого качества

    // Подгрузка Lottie анимации с SVG
    await page.setContent(`
        <html>
          <body style="margin:0; overflow:hidden;">
            <div id="lottie" style="width:100%; height:100%;"></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"></script>
            <script>
              window.animation = lottie.loadAnimation({
                container: document.getElementById('lottie'),
                renderer: 'svg',  // Рендеринг в SVG
                loop: false,
                autoplay: false,
                animationData: ${JSON.stringify(lottieJson)}
              });
            </script>
          </body>
        </html>
    `);

    await page.waitForSelector('#lottie');

    // Сохранение кадров
    const totalFrames = 1 * 60; // 10 секунд, 60 кадров в секунду
    for (let i = 0; i < totalFrames; i++) {
        await page.evaluate((frame) => {
            window.animation.goToAndStop(frame, true);
        }, i);
        await page.screenshot({ path: path.join(framesDir, `frame_${i}.png`) });
        await new Promise(resolve => setTimeout(resolve, 16.67));  // Задержка для 60 кадров в секунду
    }

    await browser.close();

    // Конвертация кадров в видео с FFmpeg
    ffmpeg()
        .input(path.join(framesDir, 'frame_%d.png'))
        .inputFps(60)
        .output(outputVideo)
        .outputOptions([
            '-pix_fmt yuv420p',
            '-s 1600x1200',
            '-q:v 1',
            '-c:v libx264',
            '-crf 18',
            '-b:v 10M',
            '-preset slow'
        ])
        .on('end', () => {
            res.download(outputVideo, 'output.mp4', () => {
                fs.removeSync(framesDir); // Удаляем временные кадры
                fs.unlinkSync(outputVideo);
                fs.unlinkSync(jsonPath);
            });
        })
        .on('error', (err) => res.status(500).send('FFmpeg error: ' + err))
        .run();
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
