import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RxDropdownMenu } from "react-icons/rx";
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from "react-icons/ri"
import { BiDownArrow } from 'react-icons/bi';
import { AiOutlinePlus } from "react-icons/ai"
import { FiChevronUp, FiChevronDown } from "react-icons/fi"
import SubSectionModal from './SubSectionModal';
import ConfirmationModal from "../../../../Common/ConfirmationModal"
import { setCourse } from '../../../../../services/slices/courseSlice';
import { deleteSection, deleteSubSection, reorderSections, reorderSubSections } from '../../../../../services/operations/courseDetailsAPI';

const NestedView = ({ handleChangeEditSectionName }) => {

  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

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

  const moveSection = async (sectionIndex, direction) => {
    const targetIndex = sectionIndex + direction;
    if (targetIndex < 0 || targetIndex >= sectionsList.length) return;

    const reordered = [...sectionsList];
    [reordered[sectionIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[sectionIndex]];
    const sectionIds = reordered.map((section) => section._id || section.id);

    const result = await reorderSections({ courseId: course?._id || course?.id, sectionIds }, token);
    if (result) dispatch(setCourse(result));
  }

  const moveSubSection = async (sectionId, subSections, subIndex, direction) => {
    const targetIndex = subIndex + direction;
    if (targetIndex < 0 || targetIndex >= subSections.length) return;

    const reordered = [...subSections];
    [reordered[subIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[subIndex]];
    const subSectionIds = reordered.map((sub) => sub._id || sub.id);

    const result = await reorderSubSections({ sectionId, subSectionIds }, token);
    if (result) dispatch(setCourse(result));
  }

  const sectionsList = (Array.isArray(course?.courseContent) && course.courseContent.length > 0)
    ? course.courseContent
    : (Array.isArray(course?.sections) && course.sections.length > 0)
    ? course.sections
    : [];

  if (sectionsList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-slate-500">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-blue-600 flex items-center justify-center text-xl mb-3">
          📁
        </div>
        <p className="text-sm font-semibold text-slate-800">No sections added yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Type a section name above and click "Create Section" to start adding lectures.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>

      {sectionsList.map((section, sectionIndex) => {
        const sId = section._id || section.id;
        const subList = section.subSection || section.subSections || [];
        return (
          <details
            key={sId}
            open
            className='group rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-200'
          >
            <summary className='flex items-center justify-between cursor-pointer bg-slate-50/80 hover:bg-slate-100/70 px-5 py-3.5 transition border-b border-slate-100 select-none list-none'>

              {/* LEFT */}
              <div className='flex items-center gap-3'>
                <RxDropdownMenu className='text-slate-400 text-lg flex-shrink-0' />
                <p className='font-semibold text-slate-800 text-sm sm:text-base'>
                  {section.sectionName}
                </p>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                  {subList.length} {subList.length === 1 ? "lecture" : "lectures"}
                </span>
              </div>

              {/* RIGHT */}
              <div
                className='flex items-center gap-1.5 sm:gap-2'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleChangeEditSectionName(sId, section.sectionName)}
                  className='p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer'
                  title="Edit Section Name"
                >
                  <MdEdit className="text-base" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmationModal({
                    text1: "Delete this Section?",
                    text2: "All lectures and videos in this section will be permanently deleted.",
                    btn1Text: "Delete",
                    btn2Text: "Cancel",
                    btn1Handler: () => handleDeleteSection(sId),
                    btn2Handler: () => setConfirmationModal(null),
                  })}
                  className='p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition cursor-pointer'
                  title="Delete Section"
                >
                  <RiDeleteBin6Line className="text-base" />
                </button>

                <button
                  type="button"
                  disabled={sectionIndex === 0}
                  onClick={() => moveSection(sectionIndex, -1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Section Up"
                >
                  <FiChevronUp className="text-base" />
                </button>

                <button
                  type="button"
                  disabled={sectionIndex === sectionsList.length - 1}
                  onClick={() => moveSection(sectionIndex, 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Section Down"
                >
                  <FiChevronDown className="text-base" />
                </button>

                <div className="p-1 text-slate-400 group-open:rotate-180 transition-transform duration-200 pointer-events-none">
                  <BiDownArrow className='text-xs' />
                </div>
              </div>
            </summary>

            {/* SUBSECTIONS LIST */}
            <div className='bg-white p-4 space-y-2.5'>

              {subList.map((data, subIndex) => {
                const subId = data._id || data.id;
                const hasVideo = Boolean(data.videoUrl || data.video_url || data.video);
                return (
                  <div
                    key={subId}
                    onClick={() => setViewSubSection({ ...data, sectionId: sId })}
                    className='group/item flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200 px-4 py-3 cursor-pointer transition shadow-none'
                  >

                    <div className='flex items-center gap-3 flex-wrap'>
                      <RxDropdownMenu className='text-slate-400 text-base' />
                      <p className='text-sm font-medium text-slate-800'>
                        {data.title}
                      </p>
                      {hasVideo ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          ▶ {data.duration || "Video attached"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          No video attached
                        </span>
                      )}
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className='flex items-center gap-1 opacity-80 group-hover/item:opacity-100'
                    >
                      <button
                        type="button"
                        onClick={() => setEditSubSection({ ...data, sectionId: sId })}
                        className='p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer'
                        title="Edit Lecture & Video"
                      >
                        <MdEdit className="text-base" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmationModal({
                          text1: "Delete Lecture?",
                          text2: "This lecture and its video will be permanently removed.",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteSubSection(subId, sId),
                          btn2Handler: () => setConfirmationModal(null),
                        })}
                        className='p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition cursor-pointer'
                        title="Delete Lecture"
                      >
                        <RiDeleteBin6Line className="text-base" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ADD LECTURE BUTTON */}
              <button
                type="button"
                onClick={() => setAddSubSection(sId)}
                className='inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 rounded-xl transition shadow-xs mt-2 cursor-pointer'
              >
                <AiOutlinePlus className="text-base text-white font-bold" />
                Add Lecture
              </button>
            </div>
          </details>
        );
      })}

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

export default NestedView;
