import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/lib/workoutData";

interface Props {
  onSubmit: (profile: UserProfile) => void;
}

const UserForm = ({ onSubmit }: Props) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    bodyType: "" as string,
    fitnessGoal: "" as string,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      name: form.name,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      bodyType: form.bodyType as UserProfile["bodyType"],
      fitnessGoal: form.fitnessGoal as UserProfile["fitnessGoal"],
    };
    onSubmit(profile);
    navigate("/plan");
  };

  const isValid =
    form.name && form.age && form.height && form.weight && form.bodyType && form.fitnessGoal;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grain">
      <div className="w-full max-w-md glass rounded-lg p-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 glow-red mb-2">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-foreground">
            AI Fitness Coach
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide uppercase">
            Build your personalized training plan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
              <Input id="age" type="number" placeholder="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
              <Input id="height" type="number" placeholder="175" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="70" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Body Type</Label>
            <Select value={form.bodyType} onValueChange={(v) => setForm({ ...form, bodyType: v })}>
              <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ectomorph">Ectomorph (Lean)</SelectItem>
                <SelectItem value="mesomorph">Mesomorph (Athletic)</SelectItem>
                <SelectItem value="endomorph">Endomorph (Stocky)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fitness Goal</Label>
            <Select value={form.fitnessGoal} onValueChange={(v) => setForm({ ...form, fitnessGoal: v })}>
              <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fat_loss">Fat Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-black uppercase tracking-wider rounded-lg glow-red"
            disabled={!isValid}
          >
            Generate My Plan →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
