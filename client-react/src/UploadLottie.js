import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button, Typography, Container, CircularProgress, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, LinearProgress, Box, Grid } from "@mui/material"; 
import lottie from 'lottie-web';

function UploadLottie() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [fps, setFps] = useState("auto");
  const [isFpsDisabled, setIsFpsDisabled] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const fileInputRef = useRef(null);
  const videoCheckTimer = useRef(null);
  const lottieContainerRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lottieData = JSON.parse(event.target.result);
        lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: lottieData,
        });
      };
      reader.readAsText(file);
    }
  }, [file]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
  
    if (videoCheckTimer.current) {
      clearTimeout(videoCheckTimer.current);
    }
  
    try {
      await axios.post("http://localhost:5001/cancel");
      console.log("⛔ Предыдущая обработка отменена");
    } catch (error) {
      console.error("Ошибка при отмене обработки:", error);
    }
  
    setFile(selectedFile);
    setVideoUrl("");
    setShowVideo(false);
    setLoading(false);
    setIsFpsDisabled(false);
    setIsVideoReady(false);
    setInputKey(Date.now());
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
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      console.log('Сервер вернул:', response.data);
      const videoFileName = response.data.videoFileName;
      waitForVideo(videoFileName);
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      setSnackbarMessage("Ошибка загрузки файла");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
      setIsFpsDisabled(false);
    }
  };

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
        setLoading(true);
        setIsFpsDisabled(true);
        setIsVideoReady(true);
  
        setTimeout(() => {
          console.log("🎬 Показываем видео через 1 секунду.");
          setShowVideo(true);
          setLoading(false);
  
          setTimeout(() => {
            console.log("⏳ Скрываем видео через 3 минуты.");
            setShowVideo(false);
          }, 3 * 60 * 1000);
          
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
      setSnackbarMessage("Ошибка: видео не удалось загрузить.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" style={{ textAlign: "left", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Загрузить Lottie файл
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item>
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
        <Grid item>
          {file && (
            <Typography variant="body1">Файл: {file.name}</Typography>
          )}
        </Grid>
        <Grid item>
          {file && !loading && !isVideoReady && (
            <FormControl>
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
          )}
        </Grid>
        <Grid item>
          {file && !loading && !isVideoReady && (
            <Button variant="contained" color="primary" onClick={handleUpload}>
              Загрузить
            </Button>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          {file && (
            <Box ref={lottieContainerRef} sx={{ margin: "20px auto", width: "100%", height: "300px", border: "1px solid #ccc", borderRadius: "8px" }}></Box>
          )}
        </Grid>
        <Grid item xs={6}>
          {loading ? (
            <Box sx={{ margin: "20px auto", width: "100%", height: "300px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            showVideo && videoUrl && (
              <video key={videoUrl} controls width="100%" style={{ display: "block", margin: "0 auto", borderRadius: "8px" }}>
                <source src={videoUrl} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            )
          )}
        </Grid>
      </Grid>

      {showVideo && videoUrl && (
        <Box mt={2} textAlign="center">
          <Button
            variant="outlined"
            color="secondary"
            onClick={downloadVideo}
          >
            Скачать
          </Button>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UploadLottie;