import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function VerifyEmailChange() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const verifyEmailChange = useAuthStore((state) => state.verifyEmailChange);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [status, setStatus] = useState("Verifying your new email...");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await verifyEmailChange(token);
        setStatus("Email updated. Redirecting...");

        setTimeout(() => {
          navigate(isAuthenticated ? "/dashboard/settings" : "/");
        }, 1800);
      } catch (error) {
        setStatus("Email change failed. The link may be expired or invalid.");
        console.error(
          "Email Change Verification Error:",
          error.response?.data || error.message,
        );
      }
    };

    if (token && !hasFetched.current) {
      hasFetched.current = true;
      verifyToken();
    }
  }, [token, verifyEmailChange, navigate, isAuthenticated]);

  return (
    <div className="theme-dark min-h-screen flex items-center justify-center" style={{ background: "var(--bg-canvas)" }}>
      <div className="p-8 rounded-[var(--radius-lg)] max-w-md text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-2">
          Email change
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)]">{status}</p>
      </div>
    </div>
  );
}
