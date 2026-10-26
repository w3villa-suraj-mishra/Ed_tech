import { useState, useEffect } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import axios from "axios"
import toast from "react-hot-toast"
import { useDispatch } from "react-redux"
import { setToken } from "../../../services/slices/authSlice"
import { setUser } from "../../../services/slices/profileSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { BASE_URL, endpoints } from "../../../services/apis"
import LoginIllustrationImg from "../../../assests/Images/login_illustration.png"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(endpoints.LOGIN_API, {
        email,
        password,
        accountType: accountType,
        account_type: accountType,
      })

      const userObj = response.data.user
      const account_type = userObj.accountType || userObj.account_type || "Student"
      const first_name = userObj.firstName || userObj.first_name || ""
      const last_name = userObj.lastName || userObj.last_name || ""

      const userImage = userObj?.image
        ? userObj.image
        : `https://api.dicebear.com/9.x/initials/svg?seed=${first_name}${last_name}`

      const userData = {
        ...userObj,
        account_type,
        accountType: account_type,
        first_name,
        last_name,
        image: userImage,
      }

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(userData))

      dispatch(setToken(response.data.token))
      dispatch(setUser(userData))

      toast.success("Login Successful")

      if (account_type === "Instructor") {
        navigate("/dashboard/instructor")
      } else {
        navigate("/dashboard/my-profile")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")

    if (error === "not_registered") {
      toast.error("No account found. Please sign up first.", {
        id: "not-registered",
      })
    } else if (error === "no_email") {
      toast.error("Could not retrieve email from GitHub. Please make your email public in GitHub settings.", {
        id: "no-email",
      })
    } else if (error === "auth_failed") {
      toast.error("Authentication failed. Please try again.", {
        id: "auth-failed",
      })
    }

    if (error) {
      window.history.replaceState({}, document.title, "/login")
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center bg-[#F9FAFE] relative overflow-hidden py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      {/* Left Dot Matrix Decoration */}
      <div className="absolute left-6 lg:left-10 top-[40%] -translate-y-1/2 hidden md:grid grid-cols-3 gap-2 opacity-35 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
        ))}
      </div>

      <div className="w-full max-w-[1040px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 relative z-10">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[44%] max-w-[380px] flex flex-col items-start text-left">
          
          {/* Header Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Welcome Back
          </h1>
          <div className="mt-1 text-xs sm:text-[13px] text-gray-500 leading-relaxed">
            <p>Build skills for today, tomorrow, and beyond.</p>
            <p className="font-semibold italic text-[#13AA92]">
              Education to future-proof your career.
            </p>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex bg-[#F1F5F9] p-1 gap-x-1 my-3 rounded-full border border-gray-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setAccountType(ACCOUNT_TYPE.STUDENT)}
              className={`${
                accountType === ACCOUNT_TYPE.STUDENT
                  ? "bg-[#1E293B] text-white shadow-xs"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              } py-1 px-5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200`}
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
              } py-1 px-5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200`}
            >
              Instructor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-2.5">
            {/* Email Address */}
            <label className="w-full text-left">
              <p className="mb-1 text-xs font-semibold text-gray-700">
                Email Address <span className="text-[#13AA92]">*</span>
              </p>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-gray-400 text-sm pointer-events-none" />
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  placeholder="superadmin@gmail.com"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
            </label>

            {/* Password */}
            <label className="w-full text-left">
              <p className="mb-1 text-xs font-semibold text-gray-700">
                Password <span className="text-[#13AA92]">*</span>
              </p>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-gray-400 text-sm pointer-events-none" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="••••"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={16} />
                  ) : (
                    <AiOutlineEye fontSize={16} />
                  )}
                </button>
              </div>
              <Link to="/forgot-password" className="block text-right mt-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#3BA7F2] hover:underline transition-all">
                  Forgot Password?
                </span>
              </Link>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] py-2.5 px-4 font-bold text-xs sm:text-sm text-white shadow-[0_2px_10px_rgba(59,167,242,0.3)] transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex w-full items-center my-1.5 gap-x-2">
              <div className="h-[1px] flex-1 bg-gray-200"></div>
              <p className="text-[11px] font-bold text-gray-400 px-2 uppercase tracking-wider">OR</p>
              <div className="h-[1px] flex-1 bg-gray-200"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={() => {
                const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || "https://ed-tech-backend-2kha.vercel.app"
                window.location.href = `${backendHost}/auth/google_oauth2?mode=login&role=${accountType}`
              }}
              className="flex w-full items-center justify-center gap-x-2.5 rounded-xl border border-gray-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
            >
              <FcGoogle className="text-lg" />
              <span>Sign in with Google</span>
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              onClick={() => {
                const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || "https://ed-tech-backend-2kha.vercel.app"
                window.location.href = `${backendHost}/auth/github?mode=login&role=${accountType}`
              }}
              className="flex w-full items-center justify-center gap-x-2.5 rounded-xl border border-gray-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
            >
              <FaGithub className="text-lg text-gray-900" />
              <span>Continue with GitHub</span>
            </button>

            {/* Join for Free prompt */}
            <div className="mt-2 text-xs sm:text-[13px] text-gray-500 text-left">
              <span>Don't have an account? </span>
              <Link
                to="/signup"
                className="font-bold text-[#3BA7F2] hover:underline ml-1 inline-flex items-center gap-1 transition-all"
              >
                <span>Join for Free</span>
                <FiArrowRight className="text-xs" />
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: 3D Tech Still Life & Badges */}
        <div className="w-full lg:w-[54%] max-w-[490px] lg:max-w-[500px] flex items-center justify-center relative shrink-0">
          <img
            src={LoginIllustrationImg}
            alt="CodeLearn Interactive Workspace"
            className="w-full h-auto object-contain select-none pointer-events-none"
          />
        </div>

      </div>
    </div>
  )
}

export default LoginForm
