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
  const [selectedFileName, setSelectedFileName] = useState("Select File");

  const handleNewFileChange = (event) => {
    setPreviewKey(previewKey + 1);
    handleFileChange(event);
    if (event.target.files.length > 0) {
      setSelectedFileName(event.target.files[0].name);
    }
  };

  const handleFpsChange = (value) => {
    setFps(value);
  };

  return (
    <div className="container">
      <div className="grid-container" style={{ height: "64.8%" }}>
        <div className="grid-item" style={{ width: "63.5%" }}>
          <div className="box box-white">
            <h4>Convert Lottie to Video</h4>
            <input
              key={inputKey}
              type="file"
              accept=".json"
              onChange={handleNewFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button className="upload-button" onClick={() => fileInputRef.current.click()}>
              {selectedFileName}
              <div className="icon">+</div>
            </button>
            {file && !loading && !isVideoReady && (
              <div className="fps-selector">
                <label>FPS:</label>
                <button
                  className={fps === "auto" ? "selected" : ""}
                  onClick={() => handleFpsChange("auto")}
                  disabled={isFpsDisabled}
                >
                  D
                </button>
                <button
                  className={fps === 24 ? "selected" : ""}
                  onClick={() => handleFpsChange(24)}
                  disabled={isFpsDisabled}
                >
                  24
                </button>
                <button
                  className={fps === 30 ? "selected" : ""}
                  onClick={() => handleFpsChange(30)}
                  disabled={isFpsDisabled}
                >
                  30
                </button>
                <button
                  className={fps === 60 ? "selected" : ""}
                  onClick={() => handleFpsChange(60)}
                  disabled={isFpsDisabled}
                >
                  60
                </button>
              </div>
            )}
            {file && !loading && !isVideoReady && (
              <button className="convert-button" onClick={handleUpload}>
                Convert
                <div className="icon">+</div>
              </button>
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
                      Your browser does not support video. 
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
              <p style={{ padding: "3vh" }}>FPS {lottieFps}, Duration {lottieDuration} S</p>
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
                Download (FPS: {videoRenderFps}, {videoSize})
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