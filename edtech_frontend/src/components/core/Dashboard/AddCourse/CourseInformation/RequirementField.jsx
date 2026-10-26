import React, { useEffect, useState } from 'react'

const RequirementField = ({ name, label, register, errors, setValue, getValues }) => {
  const [requirement, setRequirement] = useState("")
  const [requirementList, setRequirementList] = useState([])

  useEffect(() => {
    const val = getValues(name)
    if (val) {
      if (Array.isArray(val)) setRequirementList(val)
      else if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val)
          setRequirementList(Array.isArray(parsed) ? parsed : [parsed])
        } catch {
          setRequirementList([val])
        }
      }
    }
    register(name, {
      required: true,
    })
  }, [])

  useEffect(() => {
    setValue(name, requirementList)
  }, [requirementList])

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementList([...requirementList, requirement])
      // setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirementList = [...requirementList]
    updatedRequirementList.splice(index, 1)
    setRequirementList(updatedRequirementList)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* LABEL */}
      <label className="text-[13px] font-semibold text-slate-700">
        {label} <sup className="text-red-500">*</sup>
      </label>

      {/* INPUT + BUTTON */}
      <div className="flex gap-3">
        <input
          type='text'
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. Basic JavaScript knowledge"
          className="flex-1 rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm placeholder:text-slate-400"
        />

        <button
          type='button'
          onClick={handleAddRequirement}
          className="rounded-xl bg-orange-500 px-6 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-orange-600 transition"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {requirementList.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">

          {requirementList.map((requirement, index) => (
            <div
              key={index}
              className="group flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 border border-slate-200 transition"
            >
              <span className="text-[13px] text-slate-700">
                {requirement}
              </span>

              <button
                type='button'
                onClick={() => handleRemoveRequirement(index)}
                className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition hover:text-red-600 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}

        </div>
      )}

      {/* ERROR */}
      {errors[name] && (
        <span className="text-[11px] font-semibold text-red-500">
          {label} is required
        </span>
      )}

    </div>
  )
}

export default RequirementField