import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { WorkoutPlan as WorkoutPlanType } from "@/lib/workoutData";
import type { UserProfile } from "@/lib/workoutData";

import squatImg from "@/assets/exercise-squat.jpg";
import pushupImg from "@/assets/exercise-pushup.jpg";
import jumpingJacksImg from "@/assets/exercise-jumping-jacks.jpg";

const exerciseImages: Record<string, string> = {
  Squats: squatImg,
  Pushups: pushupImg,
  "Jumping Jacks": jumpingJacksImg,
};

interface Props {
  profile: UserProfile | null;
  plan: WorkoutPlanType | null;
}

const WorkoutPlan = ({ profile, plan }: Props) => {
  const navigate = useNavigate();

  if (!profile || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 grain">
        <div className="text-center space-y-4 relative z-10">
          <p className="text-muted-foreground uppercase tracking-wide">No plan generated yet.</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grain">
      <div className="w-full max-w-md glass rounded-lg p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight uppercase text-foreground">
            {plan.title}
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide uppercase">
            Let's go, {profile.name}
          </p>
        </div>

        <div className="space-y-3">
          {plan.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={exerciseImages[ex.name]}
                  alt={ex.name}
                  className="w-14 h-14 rounded-lg object-cover"
                  loading="lazy"
                  width={56}
                  height={56}
                />
                <div>
                  <p className="font-bold text-foreground uppercase text-sm">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.sets} sets × {ex.reps} reps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ex.hasDetection && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-accent/15 text-accent glow-green uppercase">
                    AI
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs font-bold uppercase border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => navigate(`/workout?start=${i}`)}
                >
                  ▶ Start
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => navigate("/workout")}
          className="w-full h-14 text-base font-black uppercase tracking-wider rounded-lg glow-red"
        >
          🔥 Start Workout
        </Button>

        <button
          onClick={() => navigate("/")}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide font-semibold"
        >
          ← Back to profile
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlan;
