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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No plan generated yet.</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {plan.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Hey {profile.name}, here's your personalized workout
          </p>
        </div>

        <div className="space-y-3">
          {plan.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50"
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
                  <p className="font-semibold text-foreground">{ex.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ex.sets} sets × {ex.reps} reps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ex.hasDetection && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    AI Tracked
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
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
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          🎥 Start Workout
        </Button>

        <button
          onClick={() => navigate("/")}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to profile
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlan;
