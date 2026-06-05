"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, RefreshCw, Ruler } from "lucide-react";

interface BodyMeasurements {
  height?: number;
  shoulders?: number;
  bust?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  armLength?: number;
  thigh?: number;
}

interface BodyScannerProps {
  onMeasurementsDetected: (measurements: BodyMeasurements) => void;
  onClose: () => void;
}

const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

function distance(p1: any, p2: any, width: number, height: number): number {
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  return Math.sqrt(dx * dx + dy * dy);
}

function pixelsToCmCalibrated(pixels: number, bodyHeightPx: number, realHeightCm: number): number {
  return Math.round((pixels / bodyHeightPx) * realHeightCm);
}

export default function BodyScanner({ onMeasurementsDetected, onClose }: BodyScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Tous les états au niveau du composant
  const [step, setStep] = useState<"calibrate" | "scan">("calibrate");
  const [knownHeight, setKnownHeight] = useState<number>(170);
  const [status, setStatus] = useState<"loading" | "scanning" | "detected" | "error">("loading");
  const [message, setMessage] = useState("Chargement de la camera...");
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [progress, setProgress] = useState(0);

  const calculateMeasurements = useCallback((
    landmarks: any[],
    width: number,
    height: number,
    realHeightCm: number
  ): BodyMeasurements | null => {
    try {
      const lm = landmarks;
      const nose = lm[POSE_LANDMARKS.NOSE];
      const leftShoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = lm[POSE_LANDMARKS.RIGHT_SHOULDER];
      const leftHip = lm[POSE_LANDMARKS.LEFT_HIP];
      const rightHip = lm[POSE_LANDMARKS.RIGHT_HIP];
      const leftKnee = lm[POSE_LANDMARKS.LEFT_KNEE];
      const leftAnkle = lm[POSE_LANDMARKS.LEFT_ANKLE];
      const leftWrist = lm[POSE_LANDMARKS.LEFT_WRIST];
      const leftElbow = lm[POSE_LANDMARKS.LEFT_ELBOW];

      if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle) {
        return null;
      }

      const anklesMidY = (leftAnkle.y + (lm[POSE_LANDMARKS.RIGHT_ANKLE]?.y || leftAnkle.y)) / 2;
      const heightPx = distance(nose, { x: nose.x, y: anklesMidY }, width, height) * 1.1;

      if (heightPx < 50) return null;

      const shoulderWidthPx = distance(leftShoulder, rightShoulder, width, height);
      const hipWidthPx = distance(leftHip, rightHip, width, height);
      const bustWidthPx = shoulderWidthPx * 0.95;
      const waistWidthPx = hipWidthPx * 0.8;
      const thighWidthPx = hipWidthPx * 0.45;

      let armLengthPx = 0;
      if (leftShoulder && leftElbow && leftWrist) {
        armLengthPx = distance(leftShoulder, leftElbow, width, height) +
                      distance(leftElbow, leftWrist, width, height);
      }

      let inseamPx = 0;
      if (leftHip && leftKnee && leftAnkle) {
        inseamPx = (distance(leftHip, leftKnee, width, height) +
                   distance(leftKnee, leftAnkle, width, height)) * 0.85;
      }

      const C = Math.PI;

      return {
        height: realHeightCm,
        shoulders: pixelsToCmCalibrated(shoulderWidthPx, heightPx, realHeightCm),
        bust: Math.round(pixelsToCmCalibrated(bustWidthPx, heightPx, realHeightCm) * C * 0.85),
        waist: Math.round(pixelsToCmCalibrated(waistWidthPx, heightPx, realHeightCm) * C * 0.75),
        hips: Math.round(pixelsToCmCalibrated(hipWidthPx, heightPx, realHeightCm) * C * 0.9),
        armLength: armLengthPx > 0 ? pixelsToCmCalibrated(armLengthPx, heightPx, realHeightCm) : undefined,
        inseam: inseamPx > 0 ? pixelsToCmCalibrated(inseamPx, heightPx, realHeightCm) : undefined,
        thigh: Math.round(pixelsToCmCalibrated(thighWidthPx, heightPx, realHeightCm) * C * 0.7),
      };
    } catch {
      return null;
    }
  }, []);

  const averageMeasurements = useCallback((list: BodyMeasurements[]): BodyMeasurements => {
    const keys = ['height', 'shoulders', 'bust', 'waist', 'hips', 'armLength', 'inseam', 'thigh'] as const;
    const result: BodyMeasurements = {};
    for (const key of keys) {
      const values = list.map(m => m[key]).filter(v => v !== undefined) as number[];
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        result[key] = values.length % 2 !== 0
          ? values[mid]
          : Math.round((values[mid - 1] + values[mid]) / 2);
      }
    }
    return result;
  }, []);

  useEffect(() => {
    if (step !== "scan") return;

    let mounted = true;
    let frameCount = 0;
    const FRAMES_NEEDED = 30;
    const collected: BodyMeasurements[] = [];

    const initMediaPipe = async () => {
      try {
        setStatus("loading");
        setMessage("Chargement de MediaPipe...");

        const { Pose } = await import('@mediapipe/pose');
        const { Camera } = await import('@mediapipe/camera_utils');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

        if (!mounted) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });

        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const pose = new Pose({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        pose.onResults((results: any) => {
          if (!mounted || !canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = results.image.width;
          canvas.height = results.image.height;
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, (Pose as any).POSE_CONNECTIONS, { color: '#5E35B1', lineWidth: 2 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#EC407A', lineWidth: 1, radius: 4 });

            if (frameCount < FRAMES_NEEDED) {
              const m = calculateMeasurements(results.poseLandmarks, canvas.width, canvas.height, knownHeight);
              if (m && m.bust && m.bust > 50 && m.bust < 200) {
                frameCount++;
                collected.push(m);
                setProgress(Math.round((frameCount / FRAMES_NEEDED) * 100));

                if (frameCount >= FRAMES_NEEDED) {
                  const avg = averageMeasurements(collected);
                  setMeasurements(avg);
                  setStatus('detected');
                  setMessage('Mesures detectees avec succes !');
                }
              }
            }
          }
        });

        poseRef.current = pose;

        const camera = new Camera(videoRef.current!, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        cameraRef.current = camera;

        if (mounted) {
          setStatus('scanning');
          setMessage('Placez-vous face a la camera, corps entier visible');
        }

      } catch (error: any) {
        if (mounted) {
          setStatus('error');
          setMessage(`Erreur: ${error.message}`);
        }
      }
    };

    initMediaPipe();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cameraRef.current?.stop();
    };
  }, [step, knownHeight, calculateMeasurements, averageMeasurements]);

  const handleConfirm = () => {
    if (measurements) onMeasurementsDetected(measurements);
  };

  const handleRetry = () => {
    setStatus('scanning');
    setMeasurements(null);
    setProgress(0);
    setMessage('Placez-vous face a la camera, corps entier visible');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.9)" }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" style={{ color: "#5E35B1" }} />
            <h2 className="font-semibold text-[#212121]">Scanner corporel IA</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#616161]">✕</button>
        </div>

        {/* Étape 1 : Calibration */}
        {step === "calibrate" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EDE7FF" }}>
              <Ruler className="w-8 h-8" style={{ color: "#5E35B1" }} />
            </div>
            <h3 className="font-semibold text-[#212121] mb-2 text-lg">Calibration</h3>
            <p className="text-sm text-[#616161] mb-6 max-w-xs mx-auto">
              Entrez votre taille reelle pour calibrer les mesures avec precision
            </p>
            <div className="flex items-center gap-3 justify-center mb-8">
              <input
                type="number"
                value={knownHeight}
                onChange={e => setKnownHeight(Number(e.target.value))}
                className="w-28 px-3 py-3 text-center rounded-xl border-2 border-gray-200 text-2xl font-bold focus:outline-none focus:border-[#5E35B1]"
                min={140}
                max={220}
              />
              <span className="text-lg text-[#616161] font-medium">cm</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              {[
                { icon: "📏", text: "Reculez a 2-3m de la camera" },
                { icon: "🧍", text: "Corps entier visible, bras ecartes" },
                { icon: "💡", text: "Bonne luminosite, fond clair" },
              ].map(tip => (
                <div key={tip.text} className="p-3 rounded-xl bg-gray-50">
                  <div className="text-2xl mb-1">{tip.icon}</div>
                  <p className="text-xs text-[#616161]">{tip.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep("scan")}
              className="px-8 py-3 rounded-xl font-medium text-white text-lg"
              style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
            >
              Commencer le scan
            </button>
          </div>
        )}

        {/* Étape 2 : Scan */}
        {step === "scan" && (
          <>
            <div className="px-4 py-3 text-sm text-center" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
              {message}
            </div>

            <div className="relative bg-black" style={{ height: "360px" }}>
              <video ref={videoRef} className="hidden" playsInline muted />
              <canvas ref={canvasRef} className="w-full h-full object-contain" />

              {status === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-dashed rounded-full opacity-30"
                    style={{ width: "160px", height: "320px", borderColor: "#5E35B1" }} />
                </div>
              )}

              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Initialisation...</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white p-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              )}

              {status === 'scanning' && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #5E35B1, #EC407A)" }} />
                  </div>
                  <p className="text-white text-xs text-center mt-1">Analyse en cours... {progress}%</p>
                </div>
              )}

              {status === 'detected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-white">
                    <CheckCircle className="w-16 h-16 mx-auto mb-2 text-green-400" />
                    <p className="font-semibold">Mesures detectees !</p>
                  </motion.div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {measurements && status === 'detected' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4"
                >
                  <h3 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4" style={{ color: "#5E35B1" }} />
                    Mesures estimees (calibrees sur {knownHeight}cm)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Hauteur", value: measurements.height },
                      { label: "Epaules", value: measurements.shoulders },
                      { label: "Poitrine", value: measurements.bust },
                      { label: "Tour taille", value: measurements.waist },
                      { label: "Hanches", value: measurements.hips },
                      { label: "Entrejambe", value: measurements.inseam },
                      { label: "Longueur bras", value: measurements.armLength },
                      { label: "Cuisse", value: measurements.thigh },
                    ].filter(m => m.value).map((m, idx) => (
                      <div key={idx} className="text-center p-2 rounded-xl" style={{ background: "#EDE7FF" }}>
                        <p className="text-xs text-[#9E9E9E]">{m.label}</p>
                        <p className="font-bold text-lg" style={{ color: "#5E35B1" }}>{m.value}</p>
                        <p className="text-xs text-[#9E9E9E]">cm</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#9E9E9E] mb-4 text-center">
                    Precision estimee : ±3-5cm. Vous pourrez ajuster manuellement.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleRetry}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#424242] hover:bg-gray-50">
                      <RefreshCw className="w-4 h-4" /> Rescanner
                    </button>
                    <button onClick={handleConfirm}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white"
                      style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                      <CheckCircle className="w-4 h-4" /> Utiliser ces mesures
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}