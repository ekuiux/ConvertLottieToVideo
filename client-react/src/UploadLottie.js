import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import UploadLottieLayout from "./UploadLottieLayout";
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
    <UploadLottieLayout
      file={file}
      inputKey={inputKey}
      fileInputRef={fileInputRef}
      handleFileChange={handleFileChange}
      fps={fps}
      setFps={setFps}
      isFpsDisabled={isFpsDisabled}
      handleUpload={handleUpload}
      loading={loading}
      lottieContainerRef={lottieContainerRef}
      showVideo={showVideo}
      videoUrl={videoUrl}
      downloadVideo={downloadVideo}
      snackbarOpen={snackbarOpen}
      handleSnackbarClose={handleSnackbarClose}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      isVideoReady={isVideoReady}
    />
  );
}

export default UploadLottie;