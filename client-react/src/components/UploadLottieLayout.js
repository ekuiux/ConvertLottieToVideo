import React, { useState } from "react";
import "../styles/UploadLottieLayout.css";

function UploadLottieLayout({
  file,
  inputKey,
  fileInputRef,
  handleFileChange,
  fps,
  setFps,
  isFpsDisabled,
  handleUpload,
  loading,
  lottieContainerRef,
  showVideo,
  videoUrl,
  downloadVideo,
  snackbarOpen,
  handleSnackbarClose,
  snackbarMessage,
  snackbarSeverity,
  isVideoReady,
  lottieFps,
  lottieDuration,
  videoSize,
  videoRenderFps
}) {
  const [previewKey, setPreviewKey] = useState(0);

  const handleNewFileChange = (event) => {
    setPreviewKey(previewKey + 1);
    handleFileChange(event);
  };

  return (
    <div className="container">
      <div className="grid-container" style={{ height: "64.8%" }}>
        <div className="grid-item" style={{ width: "63.5%" }}>
          <div className="box box-white">
            <h4>Загрузить Lottie файл</h4>
            <input
              key={inputKey}
              type="file"
              accept=".json"
              onChange={handleNewFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current.click()}>
              Выбрать файл
            </button>
            {file && <p>Файл: {file.name}</p>}
            {file && !loading && !isVideoReady && (
              <div>
                <label>Частота кадров (FPS)</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(e.target.value)}
                  disabled={isFpsDisabled}
                >
                  <option value="auto">По умолчанию (из файла)</option>
                  <option value={1}>1 FPS</option>
                  <option value={24}>24 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>
            )}
            {file && !loading && !isVideoReady && (
              <button onClick={handleUpload}>Загрузить</button>
            )}
          </div>
        </div>
        <div className="grid-item" style={{ width: "36.5%" }}>
          <div className="box box-blue">
            <div className="inner-container">
              <div className={`border-box full-size ${loading ? 'loading' : ''}`}></div>
              <div className={`border-box half-height ${loading ? 'loading' : ''}`}></div>
              <div className={`border-box half-width ${loading ? 'loading' : ''}`}></div>
              <div className="padded-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {file && !loading && !isVideoReady && (
                  <div key={previewKey} ref={lottieContainerRef} style={{ position: "relative", zIndex: 1 }}></div>
                )}
                {loading ? (
                  <div className="video-container" style={{ position: "relative", zIndex: 1 }}>
                    <div className="circular-progress"></div>
                  </div>
                ) : (
                  showVideo && videoUrl && (
                    <video
                      key={videoUrl}
                      controls
                      autoPlay
                      loop
                      className="video"
                      style={{ position: "relative", zIndex: 1 }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Ваш браузер не поддерживает видео.
                    </video>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container" style={{ height: "35.2%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="grid-item" style={{ width: "19.8%" }}>
          <div className="box box-blue"></div>
        </div>
        <div className="grid-item" style={{ width: "43.8%" }}>
          <div className="box box-dark"></div>
        </div>
        <div className="grid-item" style={{ width: "36.5%", padding: 0 }}>
          <div className="box box-light" style={{ padding: 0 }}>
            {file && !showVideo && (
              <p style={{ padding: "3vh" }}>FPS: {lottieFps}, Длительность: {lottieDuration} сек.</p>
            )}
            {showVideo && videoUrl && (
              <button 
                style={{ 
                  backgroundColor: "#D0FF13", 
                  width: "100%", 
                  height: "100%", 
                  border: "none", 
                  boxSizing: "border-box" 
                }} 
                onClick={downloadVideo}
              >
                Скачать (FPS: {videoRenderFps}, Размер: {videoSize})
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="snackbar">
        <div className="alert">
          {snackbarMessage}
        </div>
      </div>
    </div>
  );
}

export default UploadLottieLayout;