import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { WorkoutPlan, Exercise } from "@/lib/workoutData";
import { evaluateSquat, evaluatePushup, type PostureFeedback } from "@/lib/poseUtils";

interface Props {
  plan: WorkoutPlan | null;
}

const WorkoutCamera = ({ plan }: Props) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastSpokenRef = useRef("");

  const [feedback, setFeedback] = useState<PostureFeedback>({
    isCorrect: true,
    message: "Get into position",
    angle: 0,
  });
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"up" | "down">("up");
  const [isLoading, setIsLoading] = useState(true);
  const [currentExIndex, setCurrentExIndex] = useState(0);

  const currentExercise: Exercise | undefined = plan?.exercises[currentExIndex];
  const exerciseType = currentExercise?.name.toLowerCase().includes("pushup")
    ? "pushup"
    : currentExercise?.name.toLowerCase().includes("squat")
    ? "squat"
    : null;

  const speak = useCallback((text: string) => {
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.poseLandmarks) return;
      const lm = results.poseLandmarks;

      // Draw skeleton
      const connections = [
        [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 12], [11, 23], [12, 24], [23, 24],
        [23, 25], [25, 27], [24, 26], [26, 28],
      ];
      ctx.strokeStyle = "hsl(160, 84%, 39%)";
      ctx.lineWidth = 3;
      for (const [a, b] of connections) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
        ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        ctx.stroke();
      }
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "hsl(160, 84%, 39%)";
        ctx.fill();
      }

      if (!exerciseType || !currentExercise?.hasDetection) return;

      let fb: PostureFeedback;
      if (exerciseType === "squat") {
        const hip = { x: lm[23].x, y: lm[23].y };
        const knee = { x: lm[25].x, y: lm[25].y };
        const ankle = { x: lm[27].x, y: lm[27].y };
        fb = evaluateSquat(hip, knee, ankle);
      } else {
        const shoulder = { x: lm[11].x, y: lm[11].y };
        const elbow = { x: lm[13].x, y: lm[13].y };
        const wrist = { x: lm[15].x, y: lm[15].y };
        fb = evaluatePushup(shoulder, elbow, wrist);
      }

      setFeedback(fb);

      // Rep counting
      if (fb.angle < 110) {
        setPhase((prev) => {
          if (prev === "up") return "down";
          return prev;
        });
      }
      if (fb.angle >= 155) {
        setPhase((prev) => {
          if (prev === "down") {
            setReps((r) => {
              const newReps = r + 1;
              speak(`${newReps}`);
              return newReps;
            });
            return "up";
          }
          return prev;
        });
      }

      if (!fb.isCorrect) {
        speak(fb.message);
      }
    },
    [exerciseType, currentExercise, speak]
  );

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;

    const init = async () => {
      // Dynamically load MediaPipe
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });

      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
      );

      if (cancelled) return;

      const mp = (window as any);
      const pose = new mp.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);
      poseRef.current = pose;

      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (cancelled) return;
      videoRef.current.srcObject = stream;

      const camera = new mp.Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current = camera;
      await camera.start();
      setIsLoading(false);
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [plan, onResults]);

  // Reset reps when switching exercise
  useEffect(() => {
    setReps(0);
    setPhase("up");
    setFeedback({ isCorrect: true, message: "Get into position", angle: 0 });
  }, [currentExIndex]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No workout loaded.</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 gap-4">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => navigate("/plan")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h2 className="font-bold text-foreground text-lg">
          {currentExercise?.name || "Workout"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {currentExIndex + 1}/{plan.exercises.length}
        </span>
      </div>

      {/* Camera */}
      <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden bg-secondary">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading camera & AI…</p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Feedback Panel */}
      <div className="w-full max-w-2xl grid grid-cols-3 gap-3">
        <div
          className={`rounded-xl p-4 text-center transition-colors ${
            feedback.isCorrect
              ? "bg-success/10 border border-success/30"
              : "bg-destructive/10 border border-destructive/30"
          }`}
        >
          <p className="text-2xl mb-1">{feedback.isCorrect ? "✅" : "❌"}</p>
          <p
            className={`text-sm font-medium ${
              feedback.isCorrect ? "text-success" : "text-destructive"
            }`}
          >
            {feedback.isCorrect ? "Correct" : "Fix Form"}
          </p>
        </div>

        <div className="rounded-xl p-4 text-center bg-secondary/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">{reps}</p>
          <p className="text-sm text-muted-foreground">Reps</p>
        </div>

        <div className="rounded-xl p-4 text-center bg-secondary/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">{Math.round(feedback.angle)}°</p>
          <p className="text-sm text-muted-foreground">Angle</p>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-muted-foreground">{feedback.message}</p>

      {/* Navigation */}
      <div className="w-full max-w-2xl flex gap-3">
        {currentExIndex > 0 && (
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setCurrentExIndex((i) => i - 1)}
          >
            ← Previous
          </Button>
        )}
        {currentExIndex < plan.exercises.length - 1 ? (
          <Button
            className="flex-1 rounded-xl"
            onClick={() => setCurrentExIndex((i) => i + 1)}
          >
            Next Exercise →
          </Button>
        ) : (
          <Button
            className="flex-1 rounded-xl"
            onClick={() => {
              speak("Workout complete! Great job!");
              navigate("/plan");
            }}
          >
            🎉 Finish Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkoutCamera;
