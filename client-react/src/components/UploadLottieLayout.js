import React, { useState } from "react";
import "../styles/UploadLottieLayout.css";
import imgLogo from '../styles/img/logo.jpg';

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
  isVideoReady,
  lottieFps,
  lottieDuration,
  videoSize,
  videoRenderFps,
  previewKey,
  selectedFileName,
  handleNewFileChange,
  handleFpsChange
}) {

  const uploadIcon = (
    <svg width="40%" height="40%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.5844 15.5499L16.3311 27.8033C14.83 29.3045 12.794 30.1478 10.6711 30.1478C8.54822 30.1478 6.51226 29.3045 5.01114 27.8033C3.51001 26.3022 2.66669 24.2662 2.66669 22.1433C2.66669 20.0203 3.51001 17.9845 5.01114 16.4833L17.2644 4.22995C18.2652 3.22921 19.6226 2.66699 21.0378 2.66699C22.4531 2.66699 23.8104 3.22921 24.8111 4.22995C25.8119 5.23071 26.3742 6.58802 26.3742 8.00329C26.3742 9.41857 25.8119 10.7759 24.8111 11.7766L12.5445 24.0299C12.0441 24.5303 11.3654 24.8114 10.6578 24.8114C9.95017 24.8114 9.27151 24.5303 8.77114 24.0299C8.27077 23.5295 7.98965 22.851 7.98965 22.1433C7.98965 21.4357 8.27077 20.757 8.77114 20.2566L20.0911 8.94995" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    </svg>
  );

  const convertIcon = (
    <svg width="40%" height="40%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M23.319 17.9997L1.83356 17.9997L1.83356 13.9997L23.319 13.9997L12.3129 3.05446L15.1335 0.21821L29.5767 14.5816C29.9542 14.957 30.1664 15.4674 30.1664 15.9997C30.1664 16.5321 29.9542 17.0425 29.5767 17.4179L15.1335 31.7812L12.3129 28.945L23.319 17.9997Z" fill="currentColor"/>
    </svg>
  );

  const downloadIcon = (
    <svg width="100%" height="100%" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 51H50" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <path d="M27 1V39M27 39L42 23.9167M27 39L12 23.9167" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
    </svg>
  );

  const linkIcon = (
    <svg width="100%" height="100%" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 27C4.5 39.4263 14.5736 49.5 27 49.5C39.4263 49.5 49.5 39.4263 49.5 27C49.5 14.5736 39.4263 4.5 27 4.5C14.5736 4.5 4.5 14.5736 4.5 27Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M29.25 4.61133C29.25 4.61133 36 13.5002 36 27.0001C36 40.5001 29.25 49.3892 29.25 49.3892" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24.75 49.3892C24.75 49.3892 18 40.5001 18 27.0001C18 13.5002 24.75 4.61133 24.75 4.61133" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.91675 34.875H48.0835" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.91675 19.125H48.0835" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );

  return (
    <div className="container">
      <div className="grid-container" style={{ height: "64.8%" }}>
        <div className="grid-item" style={{ width: "63.5%" }}>
          <div className="box box-white">
            <h1>
              <span className="convert">Convert</span>
              <span className="lottie">Lottie</span>
              <span className="to">to</span>
              <span className="video">Video</span>
            </h1>
            <input
              key={inputKey}
              type="file"
              accept=".json"
              onChange={handleNewFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <div className="controls-container">
              <button
                className="upload-button"
                onClick={() => fileInputRef.current.click()}
                style={{ width: selectedFileName !== "Select File" ? "100%" : "auto" }} // Добавлено условие для установки ширины
              >
                <span className="text">{selectedFileName}</span> {/* Добавлено обертывание текста в span */}
                <div className="icon">{uploadIcon}</div> {/* Заменено на SVG иконку */}
              </button>
              {file && !loading && !isVideoReady && (
                <div className="fps-selector">
                  <label>FPS:</label>
                  <button
                    className={fps === "auto" ? "selected" : ""}
                    onClick={() => handleFpsChange("auto")}
                    disabled={isFpsDisabled}
                    data-tooltip="Default (from file)" // Добавлено для кастомного тултипа
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
                  <span className="text">Convert</span> {/* Добавлено обертывание текста в span */}
                  <div className="icon">{convertIcon}</div> {/* Заменено на SVG иконку */}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="grid-item" style={{ width: "36.5%" }}>
          <div className="box box-blue">
            <div className="inner-container">
              <div className={`border-box full-size ${loading ? 'loading' : ''}`}></div>
              <div className={`border-box half-height ${loading ? 'loading' : ''}`}></div>
              <div className={`border-box half-width ${loading ? 'loading' : ''}`}></div>
              <div className="padded-container" style={{ width: "min(32vw, 52vh)", height: "min(32vw, 52vh)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, aspectRatio: "1 / 1" }}>
                {file && !loading && !isVideoReady && (
                  <div key={previewKey} ref={lottieContainerRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1 }}></div>
                )}
                {loading ? (
                  <div className="video-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1 }}>
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
        <a href="https://eugenekosinski.com" target="blank" className="grid-item" style={{ width: "19.8%" }}>
          <div className="box box-blue">
            <div className="link-content">
              <div className="link-text">eugenekosinski.com</div>
              <div className="link-icon">{linkIcon}</div>
            </div>
            <div className="link-second-text">
              converter by<br /><span>Eugene<br />Kosinski</span>
            </div>
          </div>
        </a>
        <a href="https://dribbble.com/EugeneKosinski" target="blank" className="grid-item" style={{ width: "43.8%" }}>
          <div className="box box-dark">
            <div className="link-content">
              <div className="link-text">dribbble.com/eugenekosinski</div>
              <div className="link-icon">{linkIcon}</div>
            </div>
            <div className="dribbble-text">Dribbble</div> {/* Добавлено для декоративного элемента */}
            <div className="dark-box-content">
              <img src={imgLogo} alt="Image" className="dark-box-image" />
              <div className="dark-box-text">
                <h5>Eugene Kosinski</h5>
                Mobile Design, UI / Visual Design, UX Design / Research
              </div>
            </div>
          </div>
        </a>
        <div className="grid-item" style={{ width: "36.5%", padding: 0 }}>
          <div className="box box-light" style={{ padding: 0 }}>
            {file && !showVideo && (
              <>
                <div className="fps-text">FPS</div>
                <div className="fps-value">{lottieFps}</div>
                <div className="decorative-line"></div> {/* Добавлено для декоративного элемента */}
                <div className="duration-value">{lottieDuration}S</div>
                <div className="duration-text">Duration</div>
              </>
            )}
            {showVideo && videoUrl && (
              <button 
                className="download-button" 
                onClick={downloadVideo}
              >
                <div className="download-text">
                  <div>
                    <span className="number">{videoRenderFps}</span><span>FPS</span> <span className="slash">/</span> <span className="number">{videoSize}</span>
                  </div>
                  <div>DOWNLOAD</div>
                </div>
                <div className="download-icon">{downloadIcon}</div>
              </button>
            )}
            {!file && (
              <>
                <div className="file-text">FILE</div> {/* Обновлено для использования класса */}
                <div className="info-text">INFO</div> {/* Обновлено для использования класса */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadLottieLayout;