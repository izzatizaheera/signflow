import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, User, RotateCcw } from "lucide-react";

export function ForgotPassword({
  resetEmail,
  setResetEmail,
  handleForgotPassword,
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
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#1a1c1d]">Reset Password</h2>
        <p className="text-[#3f484c]">Enter the email address associated with your account and we'll send you a secure link to reset your password.</p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-6">
        <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono">Email Address</label>
            <input
                type="email"
                placeholder="name@company.com"
                className="w-full p-4 text-sm bg-[#f9f9fb] border border-[#bec8cd] rounded-2xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={authLoading}
            />
        </div>
        
        <button
            type="submit"
            disabled={authLoading}
            className="w-full p-4 bg-[#005a71] text-white text-md font-extrabold rounded-2xl hover:bg-[#0e7490] transition-all flex justify-center items-center gap-2"
        >
            {authLoading ? "Sending Link..." : "Send Reset Link"}
            <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
            onClick={() => setAuthMode("login")}
            className="text-sm font-bold text-[#1a1c1d] hover:underline"
        >
            &larr; Back to Sign In
        </button>
      </div>
    </motion.div>
  );
}
