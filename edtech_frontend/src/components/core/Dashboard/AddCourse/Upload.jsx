import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud, FiTrash2, FiRefreshCw } from "react-icons/fi"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
  onDeleteExisting = null,
}) {
  const resolveMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return ""
    if (url.startsWith('blob:') || url.startsWith('data:')) return url
    if (url.startsWith('http://res.cloudinary.com')) return url.replace('http://', 'https://')
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'
    const cleanBase = base.replace(/\/+$/, '')
    const cleanPath = url.startsWith('/') ? url : `/${url}`
    return `${cleanBase}${cleanPath}`
  }

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? resolveMediaUrl(viewData) : editData ? resolveMediaUrl(editData) : ""
  )

  useEffect(() => {
    if (viewData) {
      setPreviewSource(resolveMediaUrl(viewData))
      setSelectedFile(null)
    } else if (editData) {
      setPreviewSource(resolveMediaUrl(editData))
      setSelectedFile(null)
    }
  }, [viewData, editData])

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      previewFile(file)
      setSelectedFile(file)
      setValue(name, file)
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: Boolean(previewSource),
    noKeyboard: false,
    maxSize: 1024 * 1024 * 1024 // 1 GB
  })

  const previewFile = (file) => {
    if (!file) return
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
    register(name, { required: !viewData && !editData && !previewSource })
  }, [register, name, viewData, editData, previewSource])

  const handleDeleteExistingVideo = (e) => {
    e?.stopPropagation()
    setPreviewSource("")
    setSelectedFile(null)
    setValue(name, null)
    if (video) {
      setValue("lectureDuration", 0)
    }
    if (onDeleteExisting) {
      onDeleteExisting()
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[13px] font-semibold text-slate-700" htmlFor={name}>
        {label} {!viewData && !editData && <sup className="text-red-500">*</sup>}
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
              <video
                controls
                playsInline
                src={previewSource}
                className="w-full max-h-[300px] rounded-lg bg-black object-contain shadow-md"
              />
            )}

            {selectedFile ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                New file selected: {selectedFile.name}
              </div>
            ) : editData ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                Current Video Attached
              </div>
            ) : null}

            {!viewData && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDeleteExistingVideo}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 text-xs transition shadow-xs cursor-pointer"
                >
                  <FiTrash2 className="text-sm text-red-600" />
                  Delete Video & Upload New
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    open()
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold px-4 py-2 text-xs transition shadow-xs cursor-pointer"
                >
                  <FiRefreshCw className="text-sm text-blue-700" />
                  Change Video
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6 text-center">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-slate-100 text-blue-600 mb-4">
              <FiUploadCloud className="text-2xl" />
            </div>
            <p className="max-w-[220px] text-sm text-slate-600 mb-4">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-blue-600 hover:underline">browse</span>
            </p>
            <ul className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-wrap justify-center">
              <li>{!video ? "JPG, PNG or WEBP" : "MP4, WEBM (Up to 1 GB)"}</li>
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
