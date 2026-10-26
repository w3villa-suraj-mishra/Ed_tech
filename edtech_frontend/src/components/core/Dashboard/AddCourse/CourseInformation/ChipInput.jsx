// Importing React hook for managing component state
import { useEffect, useState } from "react"
// Importing React icon component
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  const [chips, setChips] = useState([])

  useEffect(() => {
    if (editCourse && course?.tag) {
      let parsed = course.tag
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed)
        } catch {
          parsed = parsed.split(',').map(s => s.trim()).filter(Boolean)
        }
      }
      setChips(Array.isArray(parsed) ? parsed : [String(parsed)])
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
  }, [])

  useEffect(() => {
    setValue(name, chips)
  }, [chips])

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const chipValue = event.target.value.trim()

      if (chipValue && !chips.includes(chipValue)) {
        const newChips = [...chips, chipValue]
        setChips(newChips)
        event.target.value = ""
      }
    }
  }

  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  return (
    <div className="flex flex-col gap-2">

      {/* LABEL */}
      <label className="text-[13px] font-semibold text-slate-700">
        {label} <sup className="text-red-500">*</sup>
      </label>

      {/* INPUT CONTAINER */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[13px] border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">

        {/* CHIPS */}
        {chips.map((chip, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[12px] font-medium text-slate-700 transition-all hover:bg-slate-200"
          >
            {chip}
            <button
              type="button"
              onClick={() => handleDeleteChip(index)}
              className="rounded-full hover:bg-slate-300 p-0.5 transition text-slate-500 hover:text-slate-700"
            >
              <MdClose size={14} />
            </button>
          </div>
        ))}

        {/* INPUT */}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent text-slate-900 outline-none placeholder:text-slate-400 py-1"
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">Press Enter to add tags</p>

      {/* ERROR */}
      {errors[name] && (
        <span className="text-[11px] font-semibold text-red-500">
          {label} is required
        </span>
      )}
    </div>
  )
}