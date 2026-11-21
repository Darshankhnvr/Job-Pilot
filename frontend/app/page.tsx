"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import { clearToken } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user was previously logged in
    const token = localStorage.getItem("jobpilot_token");
    const savedUser = localStorage.getItem("jobpilot_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("jobpilot_user", JSON.stringify(loggedInUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("jobpilot_user");
    setUser(null);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
      {/* Top navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="text-white font-bold text-xl">JobPilot AI</span>
          <span className="text-blue-300 text-xs bg-blue-900/50 px-2 py-0.5 rounded-full ml-1">
            MVP
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-sm hidden sm:block">
                👋 {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Left sidebar — info */}
        <aside className="hidden lg:flex flex-col gap-6 w-72 flex-shrink-0 pr-6">
          {/* Welcome card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-white">
            <h2 className="font-bold text-lg mb-2">How it works</h2>
            <ol className="space-y-3 text-sm text-blue-100">
              {[
                "Describe your ideal job in natural language",
                "AI extracts your requirements automatically",
                "Jobs discovered from multiple sources",
                "Results ranked by relevance to your needs",
                "Refine with follow-up messages",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500/50 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Example prompts */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-white">
            <h2 className="font-bold text-lg mb-3">Try asking...</h2>
            <div className="space-y-2">
              {[
                "Find Node.js jobs in Bangalore for freshers",
                "Remote React developer positions, 3-5 years exp",
                "Python ML engineer at product startups, 10+ LPA",
                "Entry level full-stack roles in Mumbai or Pune",
              ].map((example) => (
                <div
                  key={example}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 cursor-pointer text-blue-100 transition-colors"
                >
                  &ldquo;{example}&rdquo;
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-white">
            <h2 className="font-bold text-lg mb-3">Features</h2>
            <ul className="space-y-2 text-sm text-blue-100">
              {[
                "🤖 AI-powered intent extraction",
                "🔍 Multi-source job discovery",
                "📊 Relevance scoring (100-point)",
                "💾 Deduplication & persistence",
                "💬 Conversational refinement",
                "⭐ Save interesting jobs",
                "📜 Search history",
              ].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat panel */}
        <div className="flex-1 min-h-[600px] lg:min-h-0 flex flex-col">
          {!user && (
            <div className="mb-4 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 text-amber-200 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>
                <strong>Sign in</strong> to save jobs and maintain chat history.
                Search still works without an account.
              </span>
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-auto text-amber-300 underline hover:text-white whitespace-nowrap"
              >
                Sign in
              </button>
            </div>
          )}
          <div className="flex-1">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </main>
  );
}
