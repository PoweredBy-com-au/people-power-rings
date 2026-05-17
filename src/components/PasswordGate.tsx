import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "training_insights_unlocked";
const PASSWORD = "Gregisagoldengod";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Training Insights</h1>
          <p className="text-sm text-white/50">Enter the password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 h-11 ${
              error ? "border-red-500 focus-visible:ring-red-500/30" : ""
            }`}
          />
          {error && (
            <p className="text-sm text-red-400">Incorrect password. Please try again.</p>
          )}
          <Button
            type="submit"
            className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
          >
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
