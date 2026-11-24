import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createSubSection, updateSubSection } from '../../../../../services/operations/courseDetailsAPI';
import { setCourse } from '../../../../../services/slices/courseSlice';
import { RxCross1 } from 'react-icons/rx';
import Iconbtn from '../../../../Common/iconbtn';
import Upload from '../Upload';

const SubSectionModal = ({ modalData, setModalData, add = false, view = false, edit = false }) => {

  const { register, handleSubmit, setValue, formState: { errors }, getValues } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [videoRemoved, setVideoRemoved] = useState(false);
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

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
  }, [modalData, view, edit]);

  const isFormUpdated = () => {
    const currentValues = getValues();
    const titleChanged = currentValues.lectureTitle !== modalData?.title;
    const descChanged = currentValues.lectureDesc !== modalData?.description;
    const videoChanged = currentValues.lectureVideo instanceof File;
    const videoDeleted = videoRemoved;
    return titleChanged || descChanged || videoChanged || videoDeleted;
  }

  const handleEditSubSection = async () => {
    const currentValues = getValues();
    const formData = new FormData();

    const subId = modalData?._id || modalData?.id;
    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", subId);

    if (currentValues.lectureTitle !== modalData.title)
      formData.append("title", currentValues.lectureTitle);

    if (currentValues.lectureDesc !== modalData.description)
      formData.append("description", currentValues.lectureDesc);

    if (currentValues.lectureVideo instanceof File) {
      formData.append("videoFile", currentValues.lectureVideo);
      formData.append("video", currentValues.lectureVideo);
      if (currentValues.lectureDuration) {
        formData.append("duration", currentValues.lectureDuration);
      }
    } else if (videoRemoved) {
      formData.append("deleteVideo", "true");
    }

    setLoading(true);
    const result = await updateSubSection(formData, token);

    if (result) {
      dispatch(setCourse(result));
    }

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

    const formData = new FormData();
    formData.append("sectionId", modalData);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    if (data.lectureVideo instanceof File) {
      formData.append("video", data.lectureVideo);
      formData.append("videoFile", data.lectureVideo);
    }
    if (data.lectureDuration) {
      formData.append("duration", data.lectureDuration);
    }

    setLoading(true);
    const result = await createSubSection(formData, token);

    if (result) {
      dispatch(setCourse(result));
    }

    setModalData(null);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

      <div className="w-[90%] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-richblack-800 p-6 shadow-2xl border border-richblack-700">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-richblack-700">
          <h2 className="text-lg font-semibold text-white">
            {view && "Viewing"} {add && "Add"} {edit && "Edit"} Lecture
          </h2>

          <button
            type="button"
            onClick={() => (!loading ? setModalData(null) : {})}
            className="text-richblack-300 hover:text-white transition"
          >
            <RxCross1 />
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

          <div>
            <label className="text-xs font-semibold text-richblack-200 mb-1 block">Lecture Title</label>
            <input
              placeholder="Lecture Title"
              disabled={view}
              {...register("lectureTitle", { required: true })}
              className="w-full rounded-lg bg-richblack-900 border border-richblack-700 px-4 py-2 text-white placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
            />
            {errors.lectureTitle && (
              <span className="text-[11px] font-semibold text-red-500">Lecture Title is required</span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-richblack-200 mb-1 block">Lecture Description</label>
            <textarea
              placeholder="Lecture Description"
              disabled={view}
              {...register("lectureDesc", { required: true })}
              className="w-full rounded-lg bg-richblack-900 border border-richblack-700 px-4 py-2 text-white placeholder-richblack-400 min-h-[100px] focus:outline-none focus:border-yellow-50"
            />
            {errors.lectureDesc && (
              <span className="text-[11px] font-semibold text-red-500">Lecture Description is required</span>
            )}
          </div>

          {!view && (
            <div className="pt-2 flex justify-end">
              <Iconbtn text={loading ? "Loading..." : edit ? "Save Changes" : "Save"} />
            </div>
          )}
        </form>

      </div>
    </div>
  )
}

export default SubSectionModal;
