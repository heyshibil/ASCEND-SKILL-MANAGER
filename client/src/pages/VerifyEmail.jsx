// client/src/pages/VerifyEmail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function VerifyEmail() {
  const { token } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Calls the endpoint in your authService
        await authService.verifyEmail(token);
        setStatus("Email verified! Redirecting...");

        // Wait 2 seconds, then redirect to login with the success flag we built!
        setTimeout(() => {
          navigate("/?verified=true");
        }, 2000);
      } catch (error) {
        setStatus("Verification failed. The link may be expired or invalid.");
        console.error(
          "Verification Error:",
          error.response?.data || error.message,
        );
      }
    };

    if (token && !hasFetched.current) {
      hasFetched.current = true;
      verifyToken();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center text-white">
      <div className="bg-white/5 border border-white/10 p-8 rounded-xl max-w-md text-center">
        <h2 className="text-xl font-semibold mb-2">Account Verification</h2>
        <p className="text-slate-400">{status}</p>
      </div>
    </div>
  );
}
