import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/iconbtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]
const LOCATIONIQ_KEY = "pk.21e378c598051d070ba51bb36833ddbb"

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [addressInput, setAddressInput] = useState(user?.additionalDetails?.address || "")
  const [suggestions, setSuggestions] = useState([])
  const [coordinates, setCoordinates] = useState(
    user?.additionalDetails?.latitude && user?.additionalDetails?.longitude
      ? { lat: user.additionalDetails.latitude, lon: user.additionalDetails.longitude }
      : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const handleAddressChange = async (val) => {
    setAddressInput(val)
    if (val.trim().length > 2) {
      try {
        const res = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(val)}&limit=5&format=json`
        )
        const data = await res.json()
        if (Array.isArray(data)) {
          setSuggestions(data)
        }
      } catch (err) {
        console.log("LocationIQ auto-suggest error", err)
      }
    } else {
      setSuggestions([])
    }
  }

  const [locating, setLocating] = useState(false)

  const handleUseCurrentLocation = () => {
    setLocating(true)

    const fetchIpLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/")
        const data = await res.json()
        if (data && data.latitude && data.longitude) {
          const lat = data.latitude
          const lon = data.longitude
          setCoordinates({ lat, lon })
          const address = `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`.replace(/^, /, "")
          if (address) {
            setAddressInput(address)
          }
        } else {
          alert("Could not detect location automatically. Please enter your address.")
        }
      } catch (err) {
        console.log("IP Geolocation fallback error", err)
        alert("Could not detect your live location. Please type your address.")
      } finally {
        setLocating(false)
      }
    }

    if (!navigator.geolocation) {
      fetchIpLocation()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setCoordinates({ lat, lon })

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`
          )
          const data = await res.json()
          if (data && data.display_name) {
            setAddressInput(data.display_name)
          } else {
            // Fallback to OpenStreetMap Nominatim
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
            const nomData = await nomRes.json()
            if (nomData && nomData.display_name) {
              setAddressInput(nomData.display_name)
            }
          }
        } catch (err) {
          console.log("Reverse geocoding error, trying Nominatim fallback...", err)
          try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
            const nomData = await nomRes.json()
            if (nomData && nomData.display_name) {
              setAddressInput(nomData.display_name)
            }
          } catch (nErr) {
            console.log("Nominatim error", nErr)
          }
        }
        setLocating(false)
      },
      (error) => {
        console.log("Browser Geolocation error/denied, trying IP fallback...", error)
        fetchIpLocation()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const selectSuggestion = (item) => {
    setAddressInput(item.display_name)
    setCoordinates({ lat: item.lat, lon: item.lon })
    setSuggestions([])
  }

  const submitProfileForm = async (data) => {
    try {
      const payload = {
        ...data,
        address: addressInput,
        latitude: coordinates?.lat,
        longitude: coordinates?.lon,
      }
      dispatch(updateProfile(token, payload))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitProfileForm)}>
      
      {/* Card */}
      <div className="my-10 rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 px-10 shadow-xl transition-all duration-300 hover:shadow-2xl">

        <h2 className="text-2xl font-bold text-richblack-5 mb-6">
          ✨ Profile Information
        </h2>

        {/* First + Last */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">First Name</label>
            <input
              type="text"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("firstName", { required: true })}
              defaultValue={user?.firstName}
            />
            {errors.firstName && (
              <span className="text-xs text-blue-400">
                Please enter your first name.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Last Name</label>
            <input
              type="text"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("lastName", { required: true })}
              defaultValue={user?.lastName}
            />
            {errors.lastName && (
              <span className="text-xs text-blue-400">
                Please enter your last name.
              </span>
            )}
          </div>
        </div>

        {/* DOB + Gender */}
        <div className="flex flex-col gap-6 lg:flex-row mt-6">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Date of Birth</label>
            <input
              type="date"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("dateOfBirth")}
              defaultValue={user?.additionalDetails?.dateOfBirth}
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Gender</label>
            <select
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("gender", { required: true })}
              defaultValue={user?.additionalDetails?.gender}
            >
              {genders.map((ele, i) => (
                <option key={i} value={ele}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact + About */}
        <div className="flex flex-col gap-6 lg:flex-row mt-6">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Contact Number</label>
            <input
              type="tel"
              placeholder="Enter Contact Number"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("contactNumber")}
              defaultValue={user?.additionalDetails?.contactNumber}
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">About</label>
            <input
              type="text"
              placeholder="Enter Bio Details"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("about")}
              defaultValue={user?.additionalDetails?.about}
            />
          </div>
        </div>

        {/* Address & LocationIQ Auto-Suggestion */}
        <div className="flex flex-col gap-3 mt-6 relative">
          <label className="text-sm text-richblack-300 font-medium flex items-center gap-2">
            📍 Address (Auto-suggest powered by LocationIQ)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Start typing your street address or city..."
              className="w-full rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 pr-40 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="absolute right-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {locating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  🎯 Current Location
                </>
              )}
            </button>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 w-full mt-1 bg-richblack-800 border border-richblack-600 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectSuggestion(s)}
                    className="p-3 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white cursor-pointer border-b border-richblack-700 last:border-0 transition-colors"
                  >
                    📍 {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map Preview */}
          {coordinates && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-richblack-600 h-64 relative shadow-inner">
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lon}&z=15&output=embed`}
              />
            </div>
          )}
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
          <IconBtn type="submit" text="💾 Save Changes" />
        </div>
      </div>
    </form>
  )
}