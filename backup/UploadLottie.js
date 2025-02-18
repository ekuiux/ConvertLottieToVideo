import React, { useState, useRef } from "react";
import axios from "axios";
import { Button, Typography, Container, CircularProgress, Select, MenuItem, FormControl, InputLabel } from "@mui/material"; 
import Grid from '@mui/material/Grid2';

function UploadLottie() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [fps, setFps] = useState("auto");
  const [isFpsDisabled, setIsFpsDisabled] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const fileInputRef = useRef(null);
  const videoCheckTimer = useRef(null); // ✅ Добавлен таймер

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
  
    // Останавливаем предыдущую проверку видео
    if (videoCheckTimer.current) {
      clearTimeout(videoCheckTimer.current);
    }
  
    // Отправляем запрос на сервер для отмены обработки
    try {
      await axios.post("http://localhost:5001/cancel");
      console.log("⛔ Предыдущая обработка отменена");
    } catch (error) {
      console.error("Ошибка при отмене обработки:", error);
    }
  
    // Обновляем состояние
    setFile(selectedFile);
    setVideoUrl("");
    setShowVideo(false);
    setLoading(false);
    setIsFpsDisabled(false);
    setIsVideoReady(false); // ❗ Теперь селектор и кнопка появятся при новом файле
    setInputKey(Date.now()); // Перерисовываем input
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Выберите Lottie JSON файл!");
      return;
    }

    const formData = new FormData();
    formData.append("lottie", file);
    formData.append("fps", fps === "auto" ? "auto" : fps);

    setLoading(true);
    setIsFpsDisabled(true);

    try {
      const response = await axios.post("http://localhost:5001/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('Сервер вернул:', response.data);
      const videoFileName = response.data.videoFileName;
      waitForVideo(videoFileName);
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      alert("Ошибка загрузки файла");
      setLoading(false);
      setIsFpsDisabled(false);
    }
  };

  const [isVideoReady, setIsVideoReady] = useState(false); // 🔥 Новый стейт

  const waitForVideo = async (videoFileName, attempts = 0, delay = 2000) => {
    if (!file) {
      console.log("🚫 Проверка остановлена, так как файл был изменен.");
      return;
    }
  
    const maxAttempts = 50;
    const videoPath = `http://localhost:5001/output/${videoFileName}?nocache=${Date.now()}`;
  
    console.log(`🔍 Проверяем видео (попытка #${attempts + 1}/${maxAttempts})`);
  
    try {
      const response = await axios.head(videoPath);
      if (response.status === 200) {
        console.log("✅ Видео найдено:", videoPath);
        setVideoUrl(videoPath);
        setLoading(true); // 🔥 Спиннер крутится ещё 1 секунду
        setIsFpsDisabled(true);
        setIsVideoReady(true);
  
        setTimeout(() => {
          console.log("🎬 Показываем видео через 1 секунду.");
          setShowVideo(true);
          setLoading(false); // ❗ Останавливаем спиннер
  
          // ⏳ Таймер 3 минуты запускается только после появления видео
          setTimeout(() => {
            console.log("⏳ Скрываем видео через 3 минуты.");
            setShowVideo(false);
          }, 5 * 60 * 1000);
          
        }, 2000);
  
        return;
      }
    } catch (error) {
      console.error(`❌ Видео пока нет (попытка #${attempts + 1}/${maxAttempts})`);
    }
  
    if (attempts >= maxAttempts) {
      console.error("🚨 Превышено максимальное число попыток!");
      setLoading(false);
      setIsFpsDisabled(false);
      alert("Ошибка: видео не удалось загрузить.");
      return;
    }
  
    if (attempts >= 5) delay = 4000;
    if (attempts >= 10) delay = 6000;
  
    videoCheckTimer.current = setTimeout(() => waitForVideo(videoFileName, attempts + 1, delay), delay);
  };

  const downloadVideo = async () => {
    if (!videoUrl) {
      alert("Ошибка: видео не найдено!");
      return;
    }

    console.log("⬇️ Скачиваем видео:", videoUrl);
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Загрузить Lottie файл
      </Typography>

      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <input
            key={inputKey}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            color="secondary"
            onClick={() => fileInputRef.current.click()}
          >
            Выбрать файл
          </Button>
        </Grid>
        
        {file && (
          <Grid item xs={12}>
            <Typography variant="body1">Файл: {file.name}</Typography>
          </Grid>
        )}

        {file && !loading && !isVideoReady && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Частота кадров (FPS)</InputLabel>
              <Select
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                label="Частота кадров (FPS)"
                disabled={isFpsDisabled}
              >
                <MenuItem value="auto">По умолчанию (из файла)</MenuItem>
                <MenuItem value={1}>1 FPS</MenuItem>
                <MenuItem value={24}>24 FPS</MenuItem>
                <MenuItem value={30}>30 FPS</MenuItem>
                <MenuItem value={60}>60 FPS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {file && !loading && !isVideoReady && (
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleUpload}>
              Загрузить
            </Button>
          </Grid>
        )}
      </Grid>

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <CircularProgress size={50} color="primary" />
        </div>
      )}

      {showVideo && videoUrl && (
        <div>
          <Typography variant="h5" gutterBottom>
            Готовое видео:
          </Typography>
          <video key={videoUrl} controls width="400" style={{ display: "block", margin: "0 auto" }}>
            <source src={videoUrl} type="video/mp4" />
            Ваш браузер не поддерживает видео.
          </video>
          <br />
          <Button
            variant="outlined"
            color="secondary"
            onClick={downloadVideo}
            style={{ display: "block", margin: "20px auto" }}
          >
            Скачать
          </Button>
        </div>
      )}
    </Container>
  );
}

export default UploadLottie;