import React from "react";
import UploadLottie from "./UploadLottie";
import { Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="lg" style={{ textAlign: "left", padding: "20px" }}>
      <Typography variant="h3" gutterBottom>
        Lottie конвертер в видео
      </Typography>
      <UploadLottie />
    </Container>
  );
}

export default App;
