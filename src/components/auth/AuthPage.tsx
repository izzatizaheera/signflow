import React from "react";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";
import { ForgotPassword } from "./ForgotPassword";

export function AuthPage({ 
  authMode, setAuthMode, authEmail, setAuthEmail, authPassword, setAuthPassword, 
  handleAuthSubmit, handleForgotPassword, authLoading, notify, resetEmail, setResetEmail 
}: any) {
  return (
    <div className="min-h-screen bg-[#f9f9fb] p-4 flex items-center justify-center">
      {authMode === "forgot" ? (
        <ForgotPassword 
          resetEmail={resetEmail} 
          setResetEmail={setResetEmail} 
          handleForgotPassword={handleForgotPassword} 
          setAuthMode={setAuthMode} 
          authLoading={authLoading} 
          notify={notify} 
        />
      ) : authMode === "signup" ? (
        <SignUp 
          authEmail={authEmail} 
          setAuthEmail={setAuthEmail} 
          authPassword={authPassword} 
          setAuthPassword={setAuthPassword} 
          handleAuthSubmit={handleAuthSubmit} 
          setAuthMode={setAuthMode} 
          authLoading={authLoading} 
          notify={notify} 
        />
      ) : (
        <SignIn 
          authEmail={authEmail} 
          setAuthEmail={setAuthEmail} 
          authPassword={authPassword} 
          setAuthPassword={setAuthPassword} 
          handleAuthSubmit={handleAuthSubmit} 
          setAuthMode={setAuthMode} 
          authLoading={authLoading} 
          notify={notify} 
        />
      )}
    </div>
  );
}
