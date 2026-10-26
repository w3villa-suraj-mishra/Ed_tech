import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineTrophy } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { VscBook, VscCode } from "react-icons/vsc"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../services/slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { apiConnector } from "../../../services/apiConnector"
import { endpoints, BASE_URL } from "../../../services/apis"
import Tab from "../../Common/Tab"

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)
  const [agreedTerms, setAgreedTerms] = useState(false)

  // Data to pass to Tab component for accountType toggle
  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ]

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()

    if (!agreedTerms) {
      toast.error("Please agree to the Terms of Service & Privacy Policy")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return
    }

    setLoading(true)

    try {
      const cleanEmail = String(email || '').toLowerCase().trim()
      localStorage.setItem(
        "signupData",
        JSON.stringify({
          firstName,
          lastName,
          email: cleanEmail,
          password,
          confirmPassword,
          accountType,
        })
      )

      await apiConnector("POST", endpoints.SENDOTP_API, {
        email: cleanEmail,
        accountType: accountType,
        account_type: accountType
      })

      toast.success("OTP Sent Successfully")
      navigate("/verify-otp")

    } catch (error) {
      console.log(error)
      toast.error(
        error?.response?.data?.message || "Failed To Send OTP"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")

    if (error === "already_registered") {
      toast.error("This email is already registered. Please log in.", {
        id: "already-registered"
      })
      window.history.replaceState({}, document.title, "/signup")
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center bg-[#F9FAFE] relative overflow-hidden py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Left Dot Matrix Decoration */}
      <div className="absolute left-6 lg:left-10 top-[40%] -translate-y-1/2 hidden md:grid grid-cols-3 gap-2 opacity-35 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
        ))}
      </div>

      <div className="max-w-[1060px] w-full mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 relative z-10">

        {/* LEFT COLUMN: Signup Form */}
        <div className="w-full lg:w-[50%] max-w-[450px] flex flex-col items-start text-left">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-tight flex items-center gap-2">
              <span>Create your account</span>
              <span className="text-xl">✨</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-[13px] mt-1 leading-relaxed">
              Join millions of learners and start your <span className="text-[#3BA7F2] font-semibold">coding</span> journey today.
            </p>
          </div>

          {/* Student / Instructor Role Selection Toggle Pill */}
          <div className="flex bg-[#F1F5F9] p-1 gap-x-1 my-3.5 rounded-full border border-gray-200/80 shadow-2xs max-w-max">
            <button
              type="button"
              onClick={() => setAccountType(ACCOUNT_TYPE.STUDENT)}
              className={`${
                accountType === ACCOUNT_TYPE.STUDENT
                  ? "bg-[#1E293B] text-white shadow-xs"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              } py-1 px-5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setAccountType(ACCOUNT_TYPE.INSTRUCTOR)}
              className={`${
                accountType === ACCOUNT_TYPE.INSTRUCTOR
                  ? "bg-[#1E293B] text-white shadow-xs"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              } py-1 px-5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer`}
            >
              Instructor
            </button>
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-3 w-full">
            
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First Name <span className="text-[#13AA92]">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Name <span className="text-[#13AA92]">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder="Enter last name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-[#13AA92]">*</span>
              </label>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Create Password <span className="text-[#13AA92]">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-9 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-[#13AA92]">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-9 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-[#3BA7F2] accent-[#3BA7F2] focus:ring-indigo-200 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none">
                I agree to the{" "}
                <Link to="/terms" className="text-[#3BA7F2] hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-[#3BA7F2] hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] py-2.5 px-4 font-bold text-xs sm:text-sm text-white shadow-[0_2px_10px_rgba(59,167,242,0.3)] transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-[#F9FAFE] px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                OR
              </span>
              <div className="border-t border-gray-200 w-full" />
            </div>

            {/* Social Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                  window.location.href = `${backendHost}/auth/google_oauth2?mode=signup&role=${accountType}`;
                }}
                className="w-full flex items-center justify-center gap-x-2.5 rounded-xl border border-gray-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
              >
                <FcGoogle className="text-lg" />
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                  window.location.href = `${backendHost}/auth/github?mode=signup&role=${accountType}`;
                }}
                className="w-full flex items-center justify-center gap-x-2.5 rounded-xl border border-gray-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
              >
                <FaGithub className="text-lg text-gray-900" />
                <span>Sign up with GitHub</span>
              </button>
            </div>

            {/* Login Redirect Footer */}
            <p className="text-center text-xs text-gray-500 pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3BA7F2] font-bold hover:underline ml-1">
                Log in
              </Link>
            </p>

          </form>

        </div>

        {/* RIGHT COLUMN: Feature Preview Card */}
        <div className="w-full lg:w-[48%] max-w-[460px] flex items-center justify-center relative shrink-0">
          <div className="w-full bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col gap-5 relative overflow-hidden">
            
            {/* Top Image Banner */}
            <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100 border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                alt="Students collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 w-9 h-9 rounded-xl bg-[#3BA7F2] flex items-center justify-center text-white text-lg shadow-md">
                <VscCode />
              </div>
            </div>

            {/* Main Feature Content */}
            <div className="space-y-1.5 text-left">
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] leading-tight">
                Start learning. Start <span className="text-[#3BA7F2]">building.</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed">
                Unlock your potential with world-class courses and hands-on projects.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-1 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3BA7F2] text-base shrink-0 mt-0.5">
                  <VscBook />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A]">Learn from the best</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Access high-quality courses created by industry experts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3BA7F2] text-base shrink-0 mt-0.5">
                  <VscCode />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A]">Practice by building</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Build real-world projects and strengthen your coding skills.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3BA7F2] text-base shrink-0 mt-0.5">
                  <AiOutlineTrophy />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A]">Achieve your goals</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Earn certificates and advance your career in tech.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}

export default Signup



























