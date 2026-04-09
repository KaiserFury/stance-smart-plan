import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { WorkoutPlan, Exercise } from "@/lib/workoutData";
import { evaluateSquat, evaluatePushup, type PostureFeedback } from "@/lib/poseUtils";

interface Props {
  plan: WorkoutPlan | null;
}

const WorkoutCamera = ({ plan }: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [currentExIndex, setCurrentExIndex] = useState(() => {
    const start = parseInt(searchParams.get("start") || "0", 10);
    return isNaN(start) ? 0 : start;
  });
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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

      const connections = [
        [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 12], [11, 23], [12, 24], [23, 24],
        [23, 25], [25, 27], [24, 26], [26, 28],
      ];
      ctx.strokeStyle = "#FF3B30";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#FF3B30";
      ctx.shadowBlur = 8;
      for (const [a, b] of connections) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
        ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF88";
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

      if (fb.angle < 110) {
        setPhase((prev) => (prev === "up" ? "down" : prev));
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

      if (!fb.isCorrect) speak(fb.message);
    },
    [exerciseType, currentExercise, speak]
  );

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;

    const init = async () => {
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });

      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");

      if (cancelled) return;

      const mp = window as any;
      const pose = new mp.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      pose.onResults(onResults);
      poseRef.current = pose;

      if (!videoRef.current) return;
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
      cameraRef.current?.stop();

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: 640, height: 480 } });
      if (cancelled) return;
      videoRef.current.srcObject = stream;

      const camera = new mp.Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) await poseRef.current.send({ image: videoRef.current });
        },
        width: 640, height: 480,
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
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [plan, onResults, facingMode]);

  useEffect(() => {
    setReps(0);
    setPhase("up");
    setFeedback({ isCorrect: true, message: "Get into position", angle: 0 });
  }, [currentExIndex]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center grain">
        <div className="text-center space-y-4 relative z-10">
          <p className="text-muted-foreground uppercase">No workout loaded.</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 gap-4 grain">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/plan")}
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wide"
        >
          ← Back
        </button>
        <h2 className="font-black text-foreground text-lg uppercase tracking-wide">
          {currentExercise?.name || "Workout"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-secondary overflow-hidden border border-border">
            <button
              onClick={() => setFacingMode("user")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                facingMode === "user"
                  ? "bg-primary text-primary-foreground glow-red"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setFacingMode("environment")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                facingMode === "environment"
                  ? "bg-primary text-primary-foreground glow-red"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Back
            </button>
          </div>
          <span className="text-sm text-muted-foreground font-bold">
            {currentExIndex + 1}/{plan.exercises.length}
          </span>
        </div>
      </div>

      {/* Camera */}
      <div className="relative w-full max-w-2xl aspect-[4/3] rounded-lg overflow-hidden bg-secondary border border-border z-10">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-wide">Loading AI…</p>
            </div>
          </div>
        )}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }} />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }} />
      </div>

      {/* Feedback Panel */}
      <div className="w-full max-w-2xl grid grid-cols-3 gap-3 relative z-10">
        <div className={`rounded-lg p-4 text-center transition-colors border ${
          feedback.isCorrect
            ? "bg-accent/10 border-accent/30"
            : "bg-destructive/10 border-destructive/30"
        }`}>
          <p className="text-2xl mb-1">{feedback.isCorrect ? "✅" : "❌"}</p>
          <p className={`text-xs font-black uppercase tracking-wide ${feedback.isCorrect ? "text-accent" : "text-destructive"}`}>
            {feedback.isCorrect ? "Correct" : "Fix Form"}
          </p>
        </div>

        <div className="rounded-lg p-4 text-center bg-secondary border border-border">
          <p className="text-2xl font-black text-foreground">{reps}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Reps</p>
        </div>

        <div className="rounded-lg p-4 text-center bg-secondary border border-border">
          <p className="text-2xl font-black text-foreground">{Math.round(feedback.angle)}°</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Angle</p>
        </div>
      </div>

      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide relative z-10">{feedback.message}</p>

      {/* Navigation */}
      <div className="w-full max-w-2xl flex gap-3 relative z-10">
        {currentExIndex > 0 && (
          <Button variant="outline" className="flex-1 rounded-lg font-black uppercase tracking-wide" onClick={() => setCurrentExIndex((i) => i - 1)}>
            ← Previous
          </Button>
        )}
        {currentExIndex < plan.exercises.length - 1 ? (
          <Button className="flex-1 rounded-lg font-black uppercase tracking-wide glow-red" onClick={() => setCurrentExIndex((i) => i + 1)}>
            Next Exercise →
          </Button>
        ) : (
          <Button className="flex-1 rounded-lg font-black uppercase tracking-wide glow-red" onClick={() => { speak("Workout complete! Great job!"); navigate("/plan"); }}>
            🔥 Finish Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkoutCamera;
