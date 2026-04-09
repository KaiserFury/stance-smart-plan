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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-2">
            <span className="text-2xl">🏋️</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Fitness Coach
          </h1>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself to get a personalized plan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
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
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Body Type</Label>
            <Select
              value={form.bodyType}
              onValueChange={(v) => setForm({ ...form, bodyType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ectomorph">Ectomorph (Lean)</SelectItem>
                <SelectItem value="mesomorph">Mesomorph (Athletic)</SelectItem>
                <SelectItem value="endomorph">Endomorph (Stocky)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fitness Goal</Label>
            <Select
              value={form.fitnessGoal}
              onValueChange={(v) => setForm({ ...form, fitnessGoal: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fat_loss">Fat Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={!isValid}>
            Generate My Plan →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
