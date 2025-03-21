import React, { useEffect, useRef } from "react";

const CameraDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };
    startVideo();
  }, []);

  useEffect(() => {
    if (window.cv) {
      window.cv.onRuntimeInitialized = () => {
        console.log("OpenCV.js is fully initialized!");
        startProcessing();
      };
    } else {
      console.log("Waiting for OpenCV.js...");
    }
  }, []);

  const startProcessing = () => {
    let detectionTimer = 0; // Timer to track how long the phone screen has been detected
    let isPhoneScreenDetected = false;

    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !window.cv) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const src = window.cv.imread(canvas);
      const gray = new window.cv.Mat();
      const blurred = new window.cv.Mat();
      const edges = new window.cv.Mat();
      const binary = new window.cv.Mat();

      // Convert to grayscale
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);

      window.cv.GaussianBlur(
        gray,
        blurred,
        new window.cv.Size(5, 5),
        0,
        0,
        window.cv.BORDER_DEFAULT
      );

      // Threshold to get a binary image
      window.cv.threshold(blurred, binary, 150, 255, window.cv.THRESH_BINARY);

      // Use Canny edge detection
      window.cv.Canny(binary, edges, 100, 200);

      console.log("Processed image size:", edges.rows, "x", edges.cols);

      const contours = new window.cv.MatVector();
      const hierarchy = new window.cv.Mat();
      window.cv.findContours(
        edges,
        contours,
        hierarchy,
        window.cv.RETR_EXTERNAL,
        window.cv.CHAIN_APPROX_SIMPLE
      );

      console.log("Contours found:", contours.size());

      let phoneScreenContour = null;

      // Iterate over contours and try to detect a rectangular shape
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const epsilon = 0.05 * window.cv.arcLength(contour, true); // Adjust epsilon for contour approximation
        const approx = new window.cv.Mat();
        window.cv.approxPolyDP(contour, approx, epsilon, true);

        console.log(`Contour ${i}:`, approx);

        // We are looking for a rectangular contour with 4 points (approxPolyDP gives the corners)
        if (approx.rows === 4) {
          const rect = window.cv.boundingRect(approx);
          const aspectRatio = rect.width / rect.height;

          // Check if the aspect ratio is within a range typical for a phone screen (close to 16:9)
          if (aspectRatio > 1.5 && aspectRatio < 2.0) {
            phoneScreenContour = approx;
            break;
          }
        }

        approx.delete();
      }

      if (phoneScreenContour) {
        console.log("Phone screen detected!");

        // Draw the detected phone screen contour on the image
        const color = new window.cv.Scalar(255, 0, 0); // Red color for the rectangle
        window.cv.drawContours(
          src,
          contours,
          contours.indexOf(phoneScreenContour),
          color,
          2,
          window.cv.LINE_8
        );

        // Increment detection timer if phone screen is detected
        if (!isPhoneScreenDetected) {
          isPhoneScreenDetected = true;
          detectionTimer = 1; // Start the timer (1 frame detected)
        } else {
          detectionTimer++; // Increment timer on consecutive frames
        }

        // If the phone screen is detected for 2 seconds, capture the image
        if (detectionTimer >= 20) {
          // 20 frames ~ 2 seconds if the frame rate is 10 fps
          console.log("Phone screen captured!");
          captureImage(src);
          detectionTimer = 0; // Reset timer
          isPhoneScreenDetected = false; // Reset detection flag
        }
      } else {
        console.log("No phone screen detected");
        detectionTimer = 0; // Reset timer if screen is not detected
        isPhoneScreenDetected = false; // Reset detection flag
      }

      // Cleanup memory
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      binary.delete();
      contours.delete();
      hierarchy.delete();
    };

    setInterval(processFrame, 100); // Process frames every 100ms

    // Function to capture the image (you can modify it to save or display the image)
    const captureImage = (src) => {
      // Create a canvas to capture the image
      const capturedCanvas = document.createElement("canvas");
      capturedCanvas.width = src.cols;
      capturedCanvas.height = src.rows;
      const capturedCtx = capturedCanvas.getContext("2d");

      // Use canvasRef.current for the correct reference
      capturedCtx.drawImage(canvasRef.current, 0, 0, src.cols, src.rows);

      // Convert canvas to image (Base64 format)
      const imageUrl = capturedCanvas.toDataURL("image/png");
      console.log("Captured Image:", imageUrl);

      // Optionally, you can do something with the captured image (like displaying or saving it)
    };
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "auto", border: "1px solid #ccc" }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto" }}
      ></canvas>
    </div>
  );
};

export default CameraDetector;
