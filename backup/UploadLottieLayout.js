import React from "react";
import { Button, Typography, Container, CircularProgress, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, LinearProgress, Box } from "@mui/material";
import Grid from '@mui/material/Grid2';

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
  isVideoReady
}) {
    return (
        <Container maxWidth={false} disableGutters style={{ height: "100vh", padding: "0" }}>
          <Grid container spacing={0} style={{ height: "61vh", padding: "0", margin: "0" }}>

            <Grid item xs={12} md={4} style={{ height: "100%", width: "44%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightblue', overflow: 'hidden', padding: "5%"}}>
                  <Typography variant="h4" gutterBottom>
                    Загрузить Lottie файл
                  </Typography>
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
                    sx={{ mr: 2 }}
                  >
                    Выбрать файл
                  </Button>
                  {file && (
                    <Typography variant="body1" sx={{ mr: 2 }}>Файл: {file.name}</Typography>
                  )}
                  {file && !loading && !isVideoReady && (
                    <FormControl sx={{ mr: 2 }}>
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
                  {file && !loading && !isVideoReady && (
                    <Button variant="contained" color="primary" onClick={handleUpload}>
                      Загрузить
                    </Button>
                  )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} style={{ height: "100%", width: "28%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightgreen', overflow: 'hidden', padding: "5%" }}>
                {file && (
                  <Box ref={lottieContainerRef} sx={{ width: "100%", height: "300px", border: "1px solid #ccc", borderRadius: "8px" }}></Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} style={{ height: "100%", width: "28%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightcoral', overflow: 'hidden', padding: "5%" }}>
                {loading ? (
                  <Box sx={{ width: "100%", height: "300px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              </Box>
            </Grid>

          </Grid>
          <Grid container spacing={0} style={{ height: "39vh", padding: "0", margin: "0" }}>
            <Grid item xs={12} md={4} style={{ height: "100%", width: "44%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightyellow', overflow: 'hidden', padding: "5%" }}>
                {/* Пустой блок */}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} style={{ height: "100%", width: "28%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightgray', overflow: 'hidden', padding: "5%" }}>
                {/* Пустой блок */}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} style={{ height: "100%", width: "28%" }}>
              <Box sx={{ height: "100%", backgroundColor: 'lightpink', textAlign: 'center', overflow: 'hidden', padding: "5%" }}>
                {showVideo && videoUrl && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={downloadVideo}
                  >
                    Скачать
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
    
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      );
}

export default UploadLottieLayout;
