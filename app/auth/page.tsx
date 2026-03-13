"use client";

/**
 * app/auth/page.tsx
 * Sign-in and Sign-up page with email/password and Google OAuth options.
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { signUp, signIn, signInWithGoogle, user, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect them away
    if (!authLoading && user) {
      router.push("/history");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      router.push("/history");
    } catch (err: any) {
      // Firebase throws formatted errors
      let msg = err.message || "An error occurred";
      if (msg.includes("auth/invalid-credential")) msg = "Invalid email or password";
      else if (msg.includes("auth/email-already-in-use")) msg = "That email is already registered";
      else if (msg.includes("auth/weak-password")) msg = "Password should be at least 6 characters";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/history");
    } catch (err: any) {
      setError("Google sign in failed. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyItems: "center", padding: "2rem" }}>
      <div className="glass-card fade-in-up" style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "2.5rem 2rem" }}>
        
        {/* Header Tabs */}
        <div style={{ display: "flex", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            style={{
              flex: 1, padding: "1rem", background: "none", border: "none",
              color: isLogin ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              borderBottom: isLogin ? "2px solid var(--color-primary)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            style={{
              flex: 1, padding: "1rem", background: "none", border: "none",
              color: !isLogin ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              borderBottom: !isLogin ? "2px solid var(--color-primary)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ padding: "0.75rem 1rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "var(--color-error)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {!isLogin && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="email"
                required
                className="input-field"
                style={{ paddingLeft: "3rem" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                style={{ paddingLeft: "3rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.875rem" }}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="divider" style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2rem 0" }}>
          <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", background: "var(--color-surface)", padding: "0 1rem", color: "var(--color-text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>OR</span>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center", padding: "0.875rem", background: "white", color: "#1a1a27" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

      </div>
    </div>
  );
}
