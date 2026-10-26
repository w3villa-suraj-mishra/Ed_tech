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
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);
    }
  }, []);

  const isFormUpdated = () => {
    const currentValues = getValues();
    return (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    );
  }

  const handleEditSubSection = async () => {
    const currentValues = getValues();
    const formData = new FormData();

    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", modalData._id);

    if (currentValues.lectureTitle !== modalData.title)
      formData.append("title", currentValues.lectureTitle);

    if (currentValues.lectureDesc !== modalData.description)
      formData.append("description", currentValues.lectureDesc);

    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("videoFile", currentValues.lectureVideo);
      if (currentValues.lectureDuration) {
        formData.append("duration", currentValues.lectureDuration);
      }
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
        toast.error("No changes made")
      } else {
        handleEditSubSection();
      }
      return;
    }

    const formData = new FormData();
    formData.append("sectionId", modalData);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    formData.append("video", data.lectureVideo);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="w-[90%] max-w-lg rounded-2xl bg-richblack-800 p-6 shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            {view && "Viewing"} {add && "Add"} {edit && "Edit"} Lecture
          </h2>

          <button onClick={() => (!loading ? setModalData(null) : {})}>
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
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />

          <input
            placeholder="Lecture Title"
            {...register("lectureTitle", { required: true })}
            className="w-full rounded-lg bg-richblack-900 px-4 py-2 text-white"
          />

          <textarea
            placeholder="Lecture Description"
            {...register("lectureDesc", { required: true })}
            className="w-full rounded-lg bg-richblack-900 px-4 py-2 text-white min-h-[120px]"
          />

          {!view && (
            <Iconbtn text={loading ? "Loading..." : edit ? "Save Changes" : "Save"} />
          )}
        </form>

      </div>
    </div>
  )
}

export default SubSectionModal