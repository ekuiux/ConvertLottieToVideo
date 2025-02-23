const Queue = require('bull');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');

//const conversionQueue = new Queue('lottie-conversion', {
//    redis: { host: '127.0.0.1', port: 6379 }
//});

const videoQueue = new Queue('videoQueue', {
  redis: {
    host: 'red-cXXXXXXXXXXXXX', // Замени на свой хост
    port: 6379,
    password: 'твой_пароль_если_есть' // Если пароль не указан, удали эту строку
  }
});

let currentJob = null;
let currentBrowser = null;
let currentFFmpegProcess = null;
let isCancelled = false; // 🔥 Флаг отмены задачи

function addConversionTask(jsonPath, videoPath, fps) {
    conversionQueue.add({ jsonPath, videoPath, fps });
}

conversionQueue.process(2, async (job) => {  
    currentJob = job;
    isCancelled = false;  // Сбрасываем флаг отмены

    const { jsonPath, videoPath, fps } = job.data;
    const framesDir = path.join(__dirname, `frames_${Date.now()}`);
    fs.mkdirSync(framesDir);

    console.log(`Началась обработка: ${jsonPath}`);
    
    try {
        if (isCancelled) {
            console.log(`⛔ Задача ${job.id} отменена перед началом`);
            return;
        }

        const lottieJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const browser = await puppeteer.launch();
        currentBrowser = browser;
        
        if (isCancelled) {
            console.log(`⛔ Задача ${job.id} отменена перед запуском Puppeteer`);
            await browser.close();
            return;
        }

        const page = await browser.newPage();
        const width = lottieJson.w || 800;
        const height = lottieJson.h || 600;
        await page.setViewport({ width, height });

        await page.setContent(`
            <html>
              <body style="margin:0; overflow:hidden;">
                <div id="lottie" style="width:100%; height:100%;"></div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"></script>
                <script>
                  window.animation = lottie.loadAnimation({
                    container: document.getElementById('lottie'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: false,
                    animationData: ${JSON.stringify(lottieJson)}
                  });
                </script>
              </body>
            </html>
        `);

        await page.waitForSelector('#lottie');
        console.log("Начинаем рендеринг кадров...");

        const originalFps = lottieJson.fr || 30;
        const totalFrames = lottieJson.op;
        const originalDuration = totalFrames / originalFps;
        const newFrameCount = Math.round(originalDuration * fps);

        console.log(`🔄 Оригинальная анимация: ${originalDuration} сек., FPS: ${originalFps}, всего кадров: ${totalFrames}`);
        console.log(`🎯 Новые параметры: ${fps} FPS, рендерим ${newFrameCount} кадров`);

        for (let i = 0; i < newFrameCount; i++) {
            if (isCancelled || !fs.existsSync(framesDir)) {
                console.log(`⛔ Отмена рендеринга. Выходим из цикла на кадре ${i}.`);
                if (currentBrowser) {
                    await currentBrowser.close();
                    currentBrowser = null;
                }
                return;
            }
        
            const frameToRender = Math.round((i / newFrameCount) * totalFrames);
        
            try {
                await page.evaluate((frame) => {
                    return new Promise(resolve => {
                        window.animation.goToAndStop(frame, true);
                        setTimeout(resolve, 10);
                    });
                }, frameToRender);
        
                if (isCancelled || !fs.existsSync(framesDir)) {
                    console.log(`⛔ Отмена перед скриншотом кадра ${i}, прерываем цикл.`);
                    return;
                }
        
                const framePath = path.join(framesDir, `frame_${i}.png`);
                await page.screenshot({ path: framePath });
        
                console.log(`📸 Кадр ${i + 1}/${newFrameCount} → Lottie frame ${frameToRender}`);
            } catch (err) {
                console.error(`❌ Ошибка при рендеринге кадра ${i}:`, err);
                return; // ❗ Немедленно выходим из функции
            }
        }

        await browser.close();
        console.log("Кадры рендерены, начинаем конвертацию...");

        if (isCancelled) {
            console.log("⛔ Отмена перед FFmpeg, прерываем...");
            return;
        }

        await new Promise((resolve, reject) => {
            currentFFmpegProcess = ffmpeg()
                .input(path.join(framesDir, 'frame_%d.png'))
                .inputFps(fps)
                .output(videoPath)
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-q:v 1',
                    '-c:v libx264',
                    '-crf 18',
                    '-b:v 10M',
                    '-preset slow',
                    `-t ${originalDuration}`,
                    `-r ${fps}`
                ])
                .on('end', () => {
                    if (isCancelled) {
                        console.log("⛔ Отмена во время FFmpeg, удаляем видео...");
                        fs.unlinkSync(videoPath);
                        reject(new Error("FFmpeg был отменён"));
                        return;
                    }
                    console.log(`✅ Видео успешно создано: ${videoPath}`);
                    setTimeout(() => {
                        if (fs.existsSync(videoPath)) {
                            fs.unlinkSync(videoPath);
                            console.log(`Видео ${videoPath} удалено.`);
                        }
                    }, 5 * 60 * 1000);
                    
                    fs.removeSync(framesDir);
                    fs.unlinkSync(jsonPath);
                    resolve();
                })
                .on('error', (err) => {
                    console.error("❌ Ошибка FFmpeg:", err);
                    reject(err);
                })
                .run();
        });

    } catch (error) {
        console.error("❌ Ошибка обработки задачи:", error);
    }
});

function cancelCurrentJob() {
    if (!currentJob) {
        console.log("⚠️ Нет активной задачи для отмены.");
        return;
    }

    console.log(`⛔ Отмена задачи ${currentJob.id}...`);
    isCancelled = true; // Флаг отмены

    try {
        currentJob.discard();
    } catch (err) {
        console.error("⚠️ Ошибка discard() задачи:", err);
    }

    if (currentBrowser) {
        console.log("🛑 Закрываем Puppeteer...");
        currentBrowser.close().catch(err => console.error("❌ Ошибка закрытия браузера:", err));
        currentBrowser = null;
    }

    if (currentFFmpegProcess) {
        console.log("🛑 Прерываем FFmpeg...");
        currentFFmpegProcess.kill('SIGKILL');
        currentFFmpegProcess = null;
    }

    const { jsonPath, videoPath } = currentJob.data;

    // 🗑 Удаляем JSON-файл
    if (jsonPath && fs.existsSync(jsonPath)) {
        try {
            fs.unlinkSync(jsonPath);
            console.log(`🗑 Удалён JSON-файл: ${jsonPath}`);
        } catch (err) {
            console.error("❌ Ошибка при удалении JSON-файла:", err);
        }
    }

    // 🗑 Удаляем видеофайл
    if (videoPath && fs.existsSync(videoPath)) {
        try {
            fs.unlinkSync(videoPath);
            console.log(`🗑 Удалено видео: ${videoPath}`);
        } catch (err) {
            console.error("❌ Ошибка при удалении видеофайла:", err);
        }
    }

    // 🗑 Ищем и удаляем папку с кадрами
    const framesDirPattern = path.join(__dirname, "frames_*");
    const frameFolders = fs.readdirSync(__dirname).filter(file => file.startsWith("frames_"));

    for (const folder of frameFolders) {
        const folderPath = path.join(__dirname, folder);
        try {
            fs.removeSync(folderPath);
            console.log(`🗑 Удалена папка с кадрами: ${folderPath}`);
        } catch (err) {
            console.error(`❌ Ошибка при удалении ${folderPath}:`, err);
        }
    }

    conversionQueue.clean(0, 'delayed');
    conversionQueue.clean(0, 'wait');
    conversionQueue.clean(0, 'active');

    currentJob = null;
    console.log("✅ Задача отменена и очищена.");
}

module.exports = { addConversionTask, conversionQueue, cancelCurrentJob };
