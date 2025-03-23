"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Camera, SwitchCamera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Webcam from "react-webcam";
import { Button } from "./ui/button";
import * as cocossd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { drawOnCanvas } from "@/utils/draw";
import { Card } from "./ui/card";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface ObjectDetectionProps {
  isDetecting: boolean;
}

export default function ObjectDetection({ isDetecting }: ObjectDetectionProps) {
  const webcamRef = useRef<Webcam>(null);
  const [mirrored, setMirrored] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<cocossd.DetectedObject[]>([]);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        setLoading(true);
        const loadedModel = await cocossd.load({ base: "mobilenet_v2" });
        setModel(loadedModel);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load model:", err);
        setError("Failed to load the object detection model. Please try again later.");
        setLoading(false);
      }
    }
    loadModel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  async function runPrediction() {
    if (model && webcamRef.current?.video?.readyState === 4) {
      const predictions = await model.detect(webcamRef.current.video);
      setDetections(predictions);
      resizeCanvas(canvasRef, webcamRef);
      drawOnCanvas(mirrored, predictions, canvasRef.current?.getContext("2d"));
    }
  }

  useEffect(() => {
    if (isDetecting) {
      const interval = setInterval(runPrediction, 500);
      return () => clearInterval(interval);
    }
  }, [isDetecting, model, mirrored]);

  return (
    <div className="relative w-full flex flex-col md:flex-row gap-6" ref={containerRef}>
    {/* Webcam & Canvas Section */}
    <div className="relative w-full md:w-3/5 aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {/* Camera Controls */}
      <div className="absolute flex flex-col z-10 gap-3 p-3 top-2 left-2 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-lg">
        <Button className="p-4" variant="outline" onClick={() => setMirrored((prev) => !prev)}>
          <SwitchCamera className="h-3 w-3" />
        </Button>
      </div>

      <Webcam ref={webcamRef} mirrored={mirrored} className="object-contain w-full h-full" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain" />

      {!isDetecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center p-4">
          <Camera className="h-14 w-14 mb-3" />
          <p className="text-lg font-medium">Click "Start Detection" to begin</p>
        </div>
      )}
    </div>

    {/* Detected Objects Section */}
    <Card className="w-full md:w-2/5 h-auto md:h-[500px] flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Detected Objects</h2>
      </div>
      <div className="p-4 h-full overflow-y-auto">
        {!isDetecting ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>Start detection to see objects</p>
          </div>
        ) : detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>No objects detected yet</p>
            <p className="text-sm mt-2">Try moving your camera around</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {detections.map((detection, index) => (
              <li key={index} className="text-lg font-medium">
                {detection.class} ({Math.round(detection.score * 100)}%)
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  </div>
  );
}

function resizeCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, webcamRef: RefObject<Webcam | null>) {
  const canvas = canvasRef.current;
  const video = webcamRef.current?.video;
  if (canvas && video) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
}
