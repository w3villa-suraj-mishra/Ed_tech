import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RxDropdownMenu } from "react-icons/rx";
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from "react-icons/ri"
import { BiDownArrow } from 'react-icons/bi';
import { AiOutlinePlus } from "react-icons/ai"
import SubSectionModal from './SubSectionModal';
import ConfirmationModal from "../../../../Common/ConfirmationModal"
import { setCourse } from '../../../../../services/slices/courseSlice';
import { deleteSection, deleteSubSection } from '../../../../../services/operations/courseDetailsAPI';

const NestedView = ({ handleChangeEditSectionName }) => {

  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  useEffect(() => {
    console.log("Rendering again");
  });

  const handleDeleteSection = async (sectionId) => {
    const cId = course?._id || course?.id;
    const result = await deleteSection({ sectionId, courseId: cId }, token);
    if (result) dispatch(setCourse(result));
    setConfirmationModal(null);
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId }, token);
    if (result) {
      dispatch(setCourse(result));
    }
    setConfirmationModal(null);
  }

  const sectionsList = course?.courseContent || course?.sections || [];

  return (
    <div className='space-y-5'>

      {sectionsList?.map((section) => {
        const sId = section._id || section.id;
        const subList = section.subSection || section.subSections || [];
        return (
        <details
          key={sId}
          open
          className='group rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] shadow-lg'
        >
          <summary className='flex items-center justify-between cursor-pointer rounded-2xl bg-richblack-800 px-5 py-4'>

            {/* LEFT */}
            <div className='flex items-center gap-3'>
              <RxDropdownMenu className='text-richblack-300' />
              <p className='font-semibold text-white'>{section.sectionName}</p>
            </div>

            {/* RIGHT */}
            <div className='flex items-center gap-4'>

              <button
                onClick={() => handleChangeEditSectionName(sId, section.sectionName)}
                className='text-yellow-400 hover:scale-110 transition'
              >
                <MdEdit />
              </button>

              <button
                onClick={() => setConfirmationModal({
                  text1: "Delete this Section",
                  text2: "All lectures will be deleted",
                  btn1Text: "Delete",
                  btn2Text: "Cancel",
                  btn1Handler: () => handleDeleteSection(sId),
                  btn2Handler: () => setConfirmationModal(null),
                })}
                className='text-blue-400 hover:scale-110 transition'
              >
                <RiDeleteBin6Line />
              </button>

              <BiDownArrow className='text-richblack-400' />
            </div>
          </summary>

          {/* SUBSECTIONS */}
          <div className='bg-richblack-900 px-6 py-4 space-y-3'>

            {subList?.map((data) => {
              const subId = data._id || data.id;
              return (
              <div
                key={subId}
                onClick={() => setViewSubSection(data)}
                className='group flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/5 cursor-pointer transition'
              >

                <div className='flex items-center gap-3'>
                  <RxDropdownMenu className='text-richblack-400' />
                  <p className='text-sm text-white'>{data.title}</p>
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className='flex items-center gap-3 opacity-70 group-hover:opacity-100'
                >
                  <button
                    onClick={() => setEditSubSection({ ...data, sectionId: sId })}
                    className='text-yellow-400 hover:scale-110 transition'
                  >
                    <MdEdit />
                  </button>

                  <button
                    onClick={() => setConfirmationModal({
                      text1: "Delete Lecture",
                      text2: "This lecture will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleteSubSection(subId, sId),
                      btn2Handler: () => setConfirmationModal(null),
                    })}
                    className='text-blue-400 hover:scale-110 transition'
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            )})}

            {/* ADD LECTURE */}
            <button
              onClick={() => setAddSubSection(sId)}
              className='flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition mt-3'
            >
              <AiOutlinePlus />
              Add Lecture
            </button>
          </div>
        </details>
      )})}

      {/* MODALS */}
      {addSubSection ? (
        <SubSectionModal modalData={addSubSection} setModalData={setAddSubSection} add />
      ) : viewSubSection ? (
        <SubSectionModal modalData={viewSubSection} setModalData={setViewSubSection} view />
      ) : editSubSection ? (
        <SubSectionModal modalData={editSubSection} setModalData={setEditSubSection} edit />
      ) : null}

      {confirmationModal && (
        <ConfirmationModal modalData={confirmationModal} />
      )}

    </div>
  )
}

export default NestedView