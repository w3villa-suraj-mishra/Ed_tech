import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"

import "video-react/dist/video-react.css"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      previewFile(file)
      setSelectedFile(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false
  })

  const previewFile = (file) => {
    if (!file) return;
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }

    if (video) {
      const videoElement = document.createElement("video")
      videoElement.preload = "metadata"
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src)
        const durationInSeconds = Math.floor(videoElement.duration) || 0
        setValue("lectureDuration", durationInSeconds)
      }
      videoElement.src = URL.createObjectURL(file)
    }
  }

  useEffect(() => {
    register(name, { required: !viewData && !editData })
  }, [register, name, viewData, editData])

  useEffect(() => {
    setValue(name, selectedFile)
  }, [selectedFile, setValue, name])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[13px] font-semibold text-slate-700" htmlFor={name}>
        {label} {!viewData && <sup className="text-red-500">*</sup>}
      </label>
      <div
        {...getRootProps()}
        className={`${
          isDragActive ? "bg-slate-100 border-blue-400" : "bg-slate-50 border-slate-300"
        } flex min-h-[200px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all hover:bg-slate-100`}
      >
        <input {...getInputProps()} /> 
        {previewSource ? (
          <div className="flex w-full flex-col p-6 items-center">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="max-h-[300px] w-auto rounded-md object-contain"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-4 text-sm text-blue-600 font-semibold hover:underline"
              >
                Cancel / Change
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6 text-center">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-blue-50 text-blue-500 mb-4">
              <FiUploadCloud className="text-2xl" />
            </div>
            <p className="max-w-[220px] text-sm text-slate-600 mb-4">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-blue-600 hover:underline">browse</span>
            </p>
            <ul className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-wrap justify-center">
              <li>{!video ? "JPG, PNG or WEBP" : "MP4, WEBM"}</li>
              <li className="hidden sm:block">•</li>
              <li>Aspect ratio 16:9</li>
              <li className="hidden sm:block">•</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="text-[11px] font-semibold text-red-500">
          {label} is required
        </span>
      )}
    </div>
  )
}