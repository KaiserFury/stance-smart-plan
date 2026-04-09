export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
  fitnessGoal: "fat_loss" | "muscle_gain" | "maintenance";
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  hasDetection: boolean;
}

export interface WorkoutPlan {
  title: string;
  exercises: Exercise[];
}

const plans: Record<string, Exercise[]> = {
  "ectomorph_fat_loss": [
    { name: "Jumping Jacks", sets: 3, reps: 20, hasDetection: false },
    { name: "Squats", sets: 3, reps: 12, hasDetection: true },
  ],
  "ectomorph_muscle_gain": [
    { name: "Pushups", sets: 4, reps: 10, hasDetection: true },
    { name: "Squats", sets: 4, reps: 12, hasDetection: true },
  ],
  "ectomorph_maintenance": [
    { name: "Squats", sets: 3, reps: 15, hasDetection: true },
    { name: "Pushups", sets: 3, reps: 12, hasDetection: true },
  ],
  "mesomorph_fat_loss": [
    { name: "Squats", sets: 4, reps: 15, hasDetection: true },
    { name: "Jumping Jacks", sets: 3, reps: 25, hasDetection: false },
  ],
  "mesomorph_muscle_gain": [
    { name: "Pushups", sets: 4, reps: 15, hasDetection: true },
    { name: "Squats", sets: 4, reps: 15, hasDetection: true },
  ],
  "mesomorph_maintenance": [
    { name: "Squats", sets: 3, reps: 12, hasDetection: true },
    { name: "Pushups", sets: 3, reps: 10, hasDetection: true },
  ],
  "endomorph_fat_loss": [
    { name: "Squats", sets: 4, reps: 15, hasDetection: true },
    { name: "Jumping Jacks", sets: 4, reps: 30, hasDetection: false },
  ],
  "endomorph_muscle_gain": [
    { name: "Pushups", sets: 3, reps: 12, hasDetection: true },
    { name: "Squats", sets: 3, reps: 12, hasDetection: true },
  ],
  "endomorph_maintenance": [
    { name: "Squats", sets: 3, reps: 15, hasDetection: true },
    { name: "Jumping Jacks", sets: 3, reps: 20, hasDetection: false },
  ],
};

export function generateWorkoutPlan(profile: UserProfile): WorkoutPlan {
  const key = `${profile.bodyType}_${profile.fitnessGoal}`;
  const exercises = plans[key] || plans["mesomorph_maintenance"];
  
  const goalLabels = {
    fat_loss: "Fat Loss",
    muscle_gain: "Muscle Gain",
    maintenance: "Maintenance",
  };

  return {
    title: `${goalLabels[profile.fitnessGoal]} Plan`,
    exercises,
  };
}
