import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/iconbtn"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)}>

      {/* Card */}
      <div className="my-10 rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 px-10 shadow-xl transition-all duration-300 hover:shadow-2xl">

        <h2 className="text-2xl font-bold text-richblack-5 mb-6">
          🔐 Update Password
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Current Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">
              Current Password
            </label>

            <input
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter Current Password"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("oldPassword", { required: true })}
            />

            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-[40px] cursor-pointer hover:scale-110 transition-all"
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={22} className="text-richblack-300" />
              ) : (
                <AiOutlineEye fontSize={22} className="text-richblack-300" />
              )}
            </span>

            {errors.oldPassword && (
              <span className="text-xs text-blue-400">
                Please enter your current password.
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">
              New Password
            </label>

            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter New Password"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("newPassword", { required: true })}
            />

            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[40px] cursor-pointer hover:scale-110 transition-all"
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={22} className="text-richblack-300" />
              ) : (
                <AiOutlineEye fontSize={22} className="text-richblack-300" />
              )}
            </span>

            {errors.newPassword && (
              <span className="text-xs text-blue-400">
                Please enter your new password.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/dashboard/my-profile")}
          className="rounded-lg bg-richblack-700 px-6 py-2 font-semibold text-white hover:bg-richblack-600 transition-all duration-200"
        >
          Cancel
        </button>

        <div className="transform hover:scale-105 transition-all duration-200">
          <IconBtn type="submit" text=" Update Password" />
        </div>
      </div>

    </form>
  )
}