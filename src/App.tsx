import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserForm from "./pages/UserForm";
import WorkoutPlan from "./pages/WorkoutPlan";
import WorkoutCamera from "./pages/WorkoutCamera";
import NotFound from "./pages/NotFound";
import { generateWorkoutPlan, type UserProfile, type WorkoutPlan as WPType } from "./lib/workoutData";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WPType | null>(null);

  const handleProfileSubmit = (p: UserProfile) => {
    setProfile(p);
    setPlan(generateWorkoutPlan(p));
  };

  return (
    <Routes>
      <Route path="/" element={<UserForm onSubmit={handleProfileSubmit} />} />
      <Route path="/plan" element={<WorkoutPlan profile={profile} plan={plan} />} />
      <Route path="/workout" element={<WorkoutCamera plan={plan} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
