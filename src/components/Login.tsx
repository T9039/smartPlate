import React, { useState } from "react";
import { useAuthStore } from "../store/useStore";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { username, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-[40px] shadow-2xl p-8 relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)] transform rotate-6 animate-pulse">
            <span className="text-black font-black text-3xl">sP</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-white mb-2 uppercase tracking-tighter">smartPlate</h1>
        <p className="text-text-dim text-center mb-8 font-medium">Reduce waste, eat better.</p>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest pl-4">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-dim focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="pick a username"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest pl-4">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-dim focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest pl-4">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-dim focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-danger text-xs font-bold pl-4 uppercase tracking-tighter">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary hover:brightness-110 text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-wider text-sm mt-4"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-text-dim text-sm">
          {isRegister ? "Already have an account?" : "New to smartPlate?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary font-black hover:underline uppercase text-xs tracking-widest ml-1"
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}
