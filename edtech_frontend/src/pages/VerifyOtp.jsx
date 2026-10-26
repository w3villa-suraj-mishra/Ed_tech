import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer, RxReload } from "react-icons/rx";
import { HiOutlineMail } from "react-icons/hi";
import { apiConnector } from "../services/apiConnector";
import { endpoints } from "../services/apis";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(59);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const signupData = JSON.parse(localStorage.getItem("signupData"));

  // Redirect if no signupData exists
  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);

  // Handle 59s Countdown Timer
  useEffect(() => {
    let interval = null;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change for individual boxes
  const handleChange = (e, index) => {
    const value = e.target.value;
    // Allow only numeric digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take last entered character if multiple typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto move focus to next box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle KeyDown (Backspace & Arrow keys)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Paste event for 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5].focus();
    } else {
      toast.error("Please paste a valid 6-digit OTP code.");
    }
  };

  // Submit OTP Verification & Complete Registration
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    const {
      firstName,
      lastName,
      password,
      confirmPassword,
      accountType,
    } = signupData || {};

    const cleanEmail = String(signupData?.email || '').toLowerCase().trim();

    try {
      // 1. Verify OTP with Backend
      await apiConnector("POST", endpoints.VERIFYOTP_API, {
        email: cleanEmail,
        code: fullOtp,
      });

      // 2. Complete User Signup & Auto-login
      const signupRes = await apiConnector("POST", endpoints.SIGNUP_API, {
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
        password,
        confirmPassword,
        passwordConfirmation: confirmPassword,
        password_confirmation: confirmPassword,
        accountType: accountType,
        account_type: accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      });

      localStorage.removeItem("signupData");

      // Auto login user if token returned
      if (signupRes?.data?.token) {
        const rawUser = signupRes.data?.user || {};
        const account_type = rawUser.accountType || rawUser.account_type || accountType || "Student";
        const first_name = rawUser.firstName || rawUser.first_name || firstName;
        const last_name = rawUser.lastName || rawUser.last_name || lastName;
        const userImage = rawUser.image || `https://api.dicebear.com/5.x/initials/svg?seed=${first_name} ${last_name}`;
        
        const fullUser = {
          ...rawUser,
          account_type,
          accountType: account_type,
          first_name,
          last_name,
          image: userImage
        };

        localStorage.setItem("token", signupRes.data.token);
        localStorage.setItem("user", JSON.stringify(fullUser));
        toast.success("Account Created & Logged In!");
        navigate("/dashboard/global");
      } else {
        toast.success("Account Created Successfully. Please log in.");
        navigate("/login");
      }
    } catch (error) {
      console.error("VERIFY OTP / SIGNUP ERROR:", error);
      const errMsg =
        error?.response?.data?.message || "Invalid verification code. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Functionality
  const handleResendOtp = async () => {
    if (isResendDisabled || resending) return;

    setResending(true);
    try {
      await apiConnector("POST", endpoints.SENDOTP_API, {
        email: signupData.email,
        accountType: signupData.accountType,
        account_type: signupData.accountType,
      });

      toast.success("New verification code sent successfully");
      
      // Clear inputs and reset focus
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      // Restart 59-second timer
      setTimer(59);
      setIsResendDisabled(true);
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to resend the verification code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-[#070913] relative overflow-hidden font-['Inter',sans-serif] px-4">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-blue-600 rounded-full blur-[160px] opacity-[0.15] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-yellow-500 rounded-full blur-[160px] opacity-[0.08]"></div>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-richblack-25 text-base font-semibold animate-pulse">Creating your account...</p>
        </div>
      ) : (
        <div className="max-w-[460px] w-full p-8 rounded-3xl bg-[#0c0e1a] border border-blue-950/40 shadow-2xl relative z-10 space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verify Email
            </h1>
            <p className="text-sm text-richblack-200 leading-relaxed">
              A 6-digit verification code has been sent to your email:
            </p>
            
            {/* DYNAMIC REGISTERED EMAIL DISPLAY BADGE */}
            {signupData?.email && (
              <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-xl text-yellow-50 text-xs sm:text-sm font-semibold mt-1">
                <HiOutlineMail className="text-blue-400 text-base shrink-0" />
                <span className="truncate max-w-[280px]">{signupData.email}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyAndSignup} className="space-y-6">
            {/* 6 SEPARATE OTP INPUT BOXES */}
            <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-[45px] sm:w-[54px] h-[52px] sm:h-[60px] border border-blue-950/50 bg-[#121526] rounded-xl text-white text-xl font-bold text-center focus:border-yellow-50 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-50 py-3.5 px-4 rounded-xl font-bold text-richblack-900 hover:bg-yellow-100 hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all duration-200 shadow-lg text-sm"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-blue-950/30 flex items-center justify-between text-xs sm:text-sm">
            <Link to="/signup">
              <span className="text-richblack-200 flex items-center gap-x-1.5 hover:text-white transition-all font-medium">
                <BiArrowBack className="text-base" /> Back To Signup
              </span>
            </Link>

            <button
              type="button"
              disabled={isResendDisabled || resending}
              onClick={handleResendOtp}
              className={`flex items-center gap-x-1.5 transition-all font-semibold ${
                isResendDisabled || resending
                  ? "text-richblack-400 cursor-not-allowed opacity-75"
                  : "text-blue-100 hover:text-yellow-50"
              }`}
            >
              {resending ? (
                <>
                  <RxReload className="animate-spin text-base" /> Sending...
                </>
              ) : isResendDisabled ? (
                <>
                  <RxCountdownTimer className="text-base" /> Resend in {timer}s
                </>
              ) : (
                <>
                  <RxReload className="text-base" /> Resend it
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default VerifyOtp;