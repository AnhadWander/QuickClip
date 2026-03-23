"use client";

/*
 * Navbar.tsx
 * Main navigation and layout header
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Zap, History, LogOut, LogIn, Menu, X, User } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Handles user sign out with feedback notifications
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  /**
   * Generates user initials for avatar display
   */
  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <nav
      aria-label="Main Navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.9)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        className="container-app"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <Link
          href="/"
          aria-label="QuickClip Home Page"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(255, 69, 58, 0.3)",
            }}
          >
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.15rem",
              color: "var(--color-text)",
              letterSpacing: "-0.03em",
            }}
          >
            Quick<span className="gradient-text">Clip</span>
          </span>
        </Link>

        <div
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          className="desktop-nav"
        >
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/history"
                    aria-label="View your previous summaries"
                    className="btn-ghost"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                    }}
                  >
                    <History size={16} />
                    History
                  </Link>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "white",
                        cursor: "default",
                      }}
                      title={user.displayName || user.email || ""}
                    >
                      {userInitials}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="btn-ghost"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              )}
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn-ghost mobile-menu-btn"
            style={{ display: "none" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {user ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  color: "var(--color-text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                <User size={15} />
                {user.displayName || user.email}
              </div>
              <Link
                href="/history"
                className="btn-ghost"
                style={{ textDecoration: "none", justifyContent: "flex-start" }}
                onClick={() => setMenuOpen(false)}
              >
                <History size={16} /> History
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
                className="btn-ghost"
                style={{ justifyContent: "flex-start" }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="btn-primary"
              style={{ textDecoration: "none", justifyContent: "center" }}
              onClick={() => setMenuOpen(false)}
            >
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav > a, .desktop-nav > div { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
