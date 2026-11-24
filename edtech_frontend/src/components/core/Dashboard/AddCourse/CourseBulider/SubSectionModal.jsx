import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createSubSection, updateSubSection, getCloudinarySignature, uploadDirectToCloudinary, getFullDetailsOfCourse } from '../../../../../services/operations/courseDetailsAPI';
import { setCourse } from '../../../../../services/slices/courseSlice';
import { RxCross1 } from 'react-icons/rx';
import Upload from '../Upload';

const SubSectionModal = ({ modalData, setModalData, add = false, view = false, edit = false }) => {

  const { register, handleSubmit, setValue, formState: { errors }, getValues } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [videoRemoved, setVideoRemoved] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);

  const initialVideoUrl = modalData?.videoUrl || modalData?.video_url || modalData?.video || "";

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData?.title || "");
      setValue("lectureDesc", modalData?.description || "");
      setValue("lectureVideo", initialVideoUrl);
      if (modalData?.durationSeconds || modalData?.duration) {
        setValue("lectureDuration", modalData?.durationSeconds || modalData?.duration);
      }
    }
  }, [modalData, view, edit, initialVideoUrl, setValue]);

  const isFormUpdated = () => {
    const currentValues = getValues();
    const titleChanged = currentValues.lectureTitle !== modalData?.title;
    const descChanged = currentValues.lectureDesc !== modalData?.description;
    const videoChanged = currentValues.lectureVideo instanceof File;
    const videoDeleted = videoRemoved;
    return titleChanged || descChanged || videoChanged || videoDeleted;
  }

  const refreshCourse = async (fallbackResult) => {
    const courseId = course?._id || course?.id;
    let refreshedCourse = fallbackResult;

    if (courseId) {
      const fullCourse = await getFullDetailsOfCourse(courseId, token);
      if (fullCourse && (fullCourse._id || fullCourse.id || fullCourse.courseContent)) {
        refreshedCourse = fullCourse;
      }
    }

    if (refreshedCourse && !Array.isArray(refreshedCourse)) {
      dispatch(setCourse(refreshedCourse));
    }
  }

  const handleEditSubSection = async () => {
    const currentValues = getValues();
    const subId = modalData?._id || modalData?.id || modalData?.subSectionId;
    const sId = modalData?.sectionId || modalData?.section_id;

    setLoading(true);

    let directVideoUrl = null;
    let videoDuration = currentValues.lectureDuration;

    if (currentValues.lectureVideo instanceof File) {
      try {
        const sig = await getCloudinarySignature(token, "edtech/videos");
        if (sig && sig.signature && sig.cloudName) {
          toast.loading("Uploading video directly to Cloudinary...", { id: "videoUploadToast" });
          const cloudRes = await uploadDirectToCloudinary(currentValues.lectureVideo, sig);
          toast.dismiss("videoUploadToast");
          if (cloudRes && cloudRes.secure_url) {
            directVideoUrl = cloudRes.secure_url;
            if (cloudRes.duration) {
              videoDuration = Math.round(cloudRes.duration);
            }
          }
        }
      } catch (err) {
        toast.dismiss("videoUploadToast");
        console.warn("Direct Cloudinary upload failed, falling back to server:", err);
      }
    }

    let payload;
    if (directVideoUrl) {
      payload = {
        sectionId: sId,
        subSectionId: subId,
        videoUrl: directVideoUrl,
        duration: videoDuration || 0
      };
      if (currentValues.lectureTitle !== modalData.title)
        payload.title = currentValues.lectureTitle;
      if (currentValues.lectureDesc !== modalData.description)
        payload.description = currentValues.lectureDesc;
    } else {
      const formData = new FormData();
      formData.append("sectionId", sId);
      formData.append("subSectionId", subId);

      if (currentValues.lectureTitle !== modalData.title)
        formData.append("title", currentValues.lectureTitle);

      if (currentValues.lectureDesc !== modalData.description)
        formData.append("description", currentValues.lectureDesc);

      if (currentValues.lectureVideo instanceof File) {
        if (currentValues.lectureVideo.size > 1024 * 1024 * 1024) {
          toast.error("Video file size cannot exceed 1 GB.");
          setLoading(false);
          return;
        }
        formData.append("videoFile", currentValues.lectureVideo);
        if (videoDuration) {
          formData.append("duration", videoDuration);
        }
      } else if (videoRemoved) {
        formData.append("deleteVideo", "true");
      }
      payload = formData;
    }

    const result = await updateSubSection(payload, token);

    await refreshCourse(result);

    setModalData(null);
    setLoading(false);
  }

  const onSubmit = async (data) => {
    if (view) return;

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made");
      } else {
        handleEditSubSection();
      }
      return;
    }

    setLoading(true);

    let directVideoUrl = null;
    let videoDuration = data.lectureDuration;

    if (data.lectureVideo instanceof File) {
      try {
        const sig = await getCloudinarySignature(token, "edtech/videos");
        if (sig && sig.signature && sig.cloudName) {
          toast.loading("Uploading video directly to Cloudinary...", { id: "videoUploadToast" });
          const cloudRes = await uploadDirectToCloudinary(data.lectureVideo, sig);
          toast.dismiss("videoUploadToast");
          if (cloudRes && cloudRes.secure_url) {
            directVideoUrl = cloudRes.secure_url;
            if (cloudRes.duration) {
              videoDuration = Math.round(cloudRes.duration);
            }
          }
        }
      } catch (err) {
        toast.dismiss("videoUploadToast");
        console.warn("Direct Cloudinary upload failed, falling back to server:", err);
      }
    }

    let payload;
    if (directVideoUrl) {
      payload = {
        sectionId: modalData,
        title: data.lectureTitle,
        description: data.lectureDesc,
        videoUrl: directVideoUrl,
        duration: videoDuration || 0
      };
    } else {
      const formData = new FormData();
      formData.append("sectionId", modalData);
      formData.append("title", data.lectureTitle);
      formData.append("description", data.lectureDesc);
      if (data.lectureVideo instanceof File) {
        if (data.lectureVideo.size > 1024 * 1024 * 1024) {
          toast.error("Video file size cannot exceed 1 GB.");
          setLoading(false);
          return;
        }
        formData.append("videoFile", data.lectureVideo);
      }
      if (videoDuration) {
        formData.append("duration", videoDuration);
      }
      payload = formData;
    }

    const result = await createSubSection(payload, token);

    await refreshCourse(result);

    setModalData(null);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">

      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center font-bold text-base">
              {view ? "👁️" : edit ? "✏️" : "➕"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                {view && "View Lecture"} {add && "Add Lecture"} {edit && "Edit Lecture"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {view ? "Review lecture details and video" : "Configure lecture title, description and video"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (!loading ? setModalData(null) : {})}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <RxCross1 className="text-base" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? initialVideoUrl : null}
            editData={edit ? initialVideoUrl : null}
            onDeleteExisting={() => setVideoRemoved(true)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Lecture Title {!view && <sup className="text-red-500">*</sup>}
            </label>
            <input
              placeholder="e.g. Introduction to Variables"
              disabled={view}
              {...register("lectureTitle", { required: true })}
              className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600"
            />
            {errors.lectureTitle && (
              <span className="text-[11px] font-semibold text-red-500">Lecture Title is required</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Lecture Description {!view && <sup className="text-red-500">*</sup>}
            </label>
            <textarea
              placeholder="Provide a brief summary of what is covered in this lecture..."
              disabled={view}
              {...register("lectureDesc", { required: true })}
              className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-xs min-h-[100px] disabled:bg-slate-50 disabled:text-slate-600"
            />
            {errors.lectureDesc && (
              <span className="text-[11px] font-semibold text-red-500">Lecture Description is required</span>
            )}
          </div>

          {!view && (
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => setModalData(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs px-6 py-2.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving..." : edit ? "Save Changes" : "Add Lecture"}
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  )
}

export default SubSectionModal;
