// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "./utilities";
import "./phoneDetect.css";

function PhoneDetect({ onCapture, socket }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownRef = useRef(null);

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [waitingForDecision, setWaitingForDecision] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [modelStatus, setModelStatus] = useState("กำลังตรวจสอบ...");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [net, setNet] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // โหลดโมเดลและเริ่มการตรวจจับ
  useEffect(() => {
    const runCoco = async () => {
      try {
        // กำหนดค่า TensorFlow ให้ save ในเครื่อง
        await tf.ready();
        tf.setBackend("webgl");

        // แทนที่ tf.io.setLocalStorageManager() ด้วยวิธีที่รองรับ
        // ตรวจสอบว่ามีโมเดลใน indexedDB หรือไม่
        const models = await tf.io.listModels();
        console.log("Available models in IndexedDB:", models);

        // Try to load model (with caching)
        console.log("Loading COCO-SSD model...");
        const model = await cocossd.load();
        console.log("Model loaded successfully:", model);

        // บันทึกโมเดลลงใน IndexedDB หากยังไม่เคยบันทึก
        const modelPath = "indexeddb://coco-ssd-model";
        if (!models[modelPath]) {
          try {
            await model.model.save(modelPath);
            console.log("Model saved to IndexedDB for future use");
          } catch (saveError) {
            console.warn("Failed to save model to IndexedDB:", saveError);
          }
        }

        setNet(model);
        setModelLoaded(true);
        setModelStatus("โมเดลถูกโหลดแล้ว พร้อมใช้งาน");
      } catch (error) {
        console.error("Error loading model:", error);
        setModelStatus("ไม่สามารถโหลดโมเดลได้: " + error.message);
      }
    };

    runCoco();
  }, []);

  // ตรวจสอบสถานะการโหลดโมเดลและจัดการ caching
  useEffect(() => {
    const checkModelStatus = () => {
      if (!navigator.onLine) {
        setModelStatus("อยู่ในโหมด Offline");
        return;
      }

      // ดูว่าโมเดลถูกโหลดหรือยัง - แก้ไขวิธีการตรวจสอบ
      if (modelLoaded) {
        setModelStatus("โมเดลถูกโหลดแล้ว พร้อมใช้งาน");
        return;
      }

      const modelExists = window.performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("model"));

      setModelStatus(
        modelExists
          ? "กำลังโหลดโมเดล..."
          : "ยังไม่ได้โหลดโมเดล (จะดาวน์โหลดเมื่อใช้งานครั้งแรก)"
      );
    };

    // เช็คสถานะทุกครั้งที่ online/offline status เปลี่ยน
    window.addEventListener("online", checkModelStatus);
    window.addEventListener("offline", checkModelStatus);

    // เช็คสถานะครั้งแรก
    checkModelStatus();

    return () => {
      window.removeEventListener("online", checkModelStatus);
      window.removeEventListener("offline", checkModelStatus);
    };
  }, [modelLoaded]);

  // ตรวจจับตลอดเวลาหลังจากโมเดลโหลดเสร็จ
  useEffect(() => {
    let detectionInterval;

    if (net && isDetecting) {
      detectionInterval = setInterval(() => {
        detect(net);
      }, 10);
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [net, isDetecting]);

  // Modify handleCancel to reset the waiting state
  const handleCancel = () => {
    setIsCapturing(false);
    setCapturedImage(null);
    setWaitingForDecision(false);
    setIsCountingDown(false);
    setIsDetecting(true);
    setShowWebcam(true);
  };

  // Modify handleAccept to reset the waiting state
  const handleAccept = () => {
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    // ส่งรูปผ่าน WebSocket ไปแสดงที่ CheckSlip
    if (socket) {
      const message = {
        type: "NEW_SLIP",
        data: capturedImage,
      };
      socket.send(JSON.stringify(message));
    }
    setCapturedImage(null);
    setShowWebcam(true);
    // ปิด modal ทันทีหลังส่งรูป
    onCapture(null);
  };

  const detect = async (model) => {
    if (!isDetecting || !model) {
      return;
    }

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        // Make Detections
        const obj = await model.detect(video);
        console.log("Detected objects:", obj);
        const cellPhoneDetections = obj.filter(
          (detection) => detection.class === "cell phone"
        );
        // ตีกรอบ detect เจอ
        if (cellPhoneDetections.length > 0) {
          setIsDetecting(false);
          startCountdown();
          setWaitingForDecision(true);
        }

        // Draw mesh
        const ctx = canvasRef.current.getContext("2d");
        drawRect(cellPhoneDetections, ctx);
      } catch (error) {
        console.error("Error during detection:", error);
      }
    }
  };

  const captureImage = () => {
    // Clear the canvas before capturing
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowWebcam(false);
    }
  };

  const startCountdown = () => {
    if (!isCountingDown && !isCapturing) {
      setIsCountingDown(true);
      countdownRef.current = setTimeout(() => {
        setIsCapturing(true);
        captureImage();
        setIsCountingDown(false);
      }, 1000);
    }
  };

  return (
    <div>
      <div className="camera-section">
        {/* Model Status */}
        {/* <div className="model-status mb-2 mt-4 text-sm text-gray-600">
          สถานะโมเดล {modelStatus}
        </div> */}

        <div className="flex">
          {showWebcam && (
            <Webcam
              ref={webcamRef}
              muted={true}
              screenshotFormat="image/png"
              videoConstraints={{
                frameRate: 12,
              }}
              style={{
                transform: "rotate(90deg)",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 480,
                height: 640,
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            style={{
              transform: "rotate(90deg)",
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 8,
              height: 480,
            }}
          />
        </div>
      </div>

      {/* Wave Animation Text */}
      {showWebcam && !capturedImage && (
        <div className="mt-4 text-xl text-gray-600">
          <div className="wave-text flex items-center gap-1">
            <span>ขณะนี้กำลังตรวจจับภาพหน้าจอ</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      )}

      {capturedImage && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={capturedImage}
            alt="Captured phone"
            style={{
              transform: "rotate(90deg)",
              width: 480,
              height: 640,
              objectFit: "contain",
            }}
          />

          <div className="w-full flex justify-between mt-4">
            <button
              onClick={handleCancel}
              className="w-[200px] py-2 border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
            >
              ถ่ายใหม่
            </button>
            <button
              onClick={handleAccept}
              className="w-[200px] py-2 bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
            >
              ส่งให้พนักงาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhoneDetect;
