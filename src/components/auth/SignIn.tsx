import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, User } from "lucide-react";

export function SignIn({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  handleAuthSubmit,
  setAuthMode,
  authLoading,
  notify
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-[#005a71]" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#1a1c1d]">Welcome Back</h2>
        <p className="text-[#3f484c]">Continue your mastery of American Sign Language</p>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-6">
        <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono">Email Address</label>
            <input
                type="email"
                placeholder="name@example.com"
                className="w-full p-4 text-sm bg-[#f9f9fb] border border-[#bec8cd] rounded-2xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                disabled={authLoading}
            />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono">Password</label>
                <button
                    type="button"
                    onClick={() => setAuthMode("forgot")}
                    className="text-xs font-semibold text-[#0e7490] hover:underline"
                >
                    Forgot Password?
                </button>
            </div>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 text-sm bg-[#f9f9fb] border border-[#bec8cd] rounded-2xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={authLoading}
            />
        </div>
        
        <button
            type="submit"
            disabled={authLoading}
            className="w-full p-4 bg-[#005a71] text-white text-md font-extrabold rounded-2xl hover:bg-[#0e7490] transition-all flex justify-center items-center gap-2"
        >
            {authLoading ? "Signing In..." : "Sign In"}
            <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 text-center">
        <p className="text-sm text-[#3f484c] mb-4">OR CONTINUE WITH</p>
        <button
            onClick={() => setAuthMode("signup")}
            className="w-full p-4 bg-[#f3f3f5] text-[#1a1c1d] font-bold rounded-2xl hover:bg-[#e8e8ea] transition-all"
        >
            Create Free Account
        </button>
      </div>
    </motion.div>
  );
}
