import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, User } from "lucide-react";

export function SignUp({
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
        <h2 className="text-3xl font-extrabold text-[#1a1c1d]">Create Account</h2>
        <p className="text-[#3f484c]">Begin your journey to professional sign fluency.</p>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-6">
        <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono">Full Name</label>
            <input
                type="text"
                placeholder="John Doe"
                className="w-full p-4 text-sm bg-[#f9f9fb] border border-[#bec8cd] rounded-2xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
            />
        </div>
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
            <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono">Password</label>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 text-sm bg-[#f9f9fb] border border-[#bec8cd] rounded-2xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={authLoading}
            />
        </div>
        
        <label className="flex items-center gap-2 text-sm italic">
          <input type="checkbox" className="accent-[#005a71]" />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>

        <button
            type="submit"
            disabled={authLoading}
            className="w-full p-4 bg-[#005a71] text-white text-md font-extrabold rounded-2xl hover:bg-[#0e7490] transition-all flex justify-center items-center gap-2"
        >
            {authLoading ? "Creating Account..." : "Join Free"}
            <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 text-center">
        <button
            onClick={() => setAuthMode("login")}
            className="text-sm font-semibold text-[#3f484c] hover:underline"
        >
            Already have an account? <span className="text-[#005a71] font-bold">Sign In</span>
        </button>
      </div>
    </motion.div>
  );
}
