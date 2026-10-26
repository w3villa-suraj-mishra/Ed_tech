import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateCompletedLectures } from '../../../services/slices/viewCourseSlice';
import { markLectureAsComplete, updateLectureDuration } from '../../../services/operations/courseDetailsAPI';
import { apiConnector } from '../../../services/apiConnector';
import toast from 'react-hot-toast';
import {
  BsCheckCircleFill, BsSkipBackwardFill, BsSkipForwardFill, BsArrowRepeat
} from 'react-icons/bs';

import { MdOutlineSlowMotionVideo } from 'react-icons/md';

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, completedLectures } = useSelector(
    (state) => state.viewCourse
  );

  const [videoData, setVideoData] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayTimer, setAutoplayTimer] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const videoRef = useRef(null);


  // -- Find video data from Redux --
  useEffect(() => {
    if (!courseSectionData?.length) {
      setVideoLoading(true);
      return;
    }
    // Convert to string for safe comparison (URL params are strings, DB IDs may be integers)
    const section = courseSectionData.find((s) => String(s._id) === String(sectionId));
    const lecture = section?.subSection?.find((ss) => String(ss._id) === String(subSectionId));

    if (lecture) {
      setVideoData(lecture);
      setVideoLoading(false);
    } else {
      setVideoLoading(true);
    }

    setVideoEnded(false);
    setVideoError(false);
    clearInterval(autoplayTimer);
    setCountdown(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, sectionId, subSectionId]);

  // -- Navigation helpers --
  const getIndexes = () => {
    const si = courseSectionData.findIndex((s) => String(s._id) === String(sectionId));
    const li = si >= 0 ? courseSectionData[si].subSection.findIndex((ss) => String(ss._id) === String(subSectionId)) : -1;
    return { si, li };
  };

  const isFirstVideo = () => {
    const { si, li } = getIndexes();
    return si === 0 && li === 0;
  };

  const isLastVideo = () => {
    const { si, li } = getIndexes();
    const lastSec = courseSectionData.length - 1;
    const lastLec = courseSectionData[si]?.subSection?.length - 1;
    return si === lastSec && li === lastLec;
  };


  const goToNextVideo = () => {
    const { si, li } = getIndexes();
    if (si < 0) return;
    const section = courseSectionData[si];
    if (!section) return;
    if (li < section.subSection.length - 1) {
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${section.subSection[li + 1]._id}`);
    } else if (si < courseSectionData.length - 1) {
      const nextSec = courseSectionData[si + 1];
      navigate(`/view-course/${courseId}/section/${nextSec._id}/sub-section/${nextSec.subSection[0]._id}`);
    }
  };

  const goToPrevVideo = () => {
    const { si, li } = getIndexes();
    if (si < 0) return;
    const section = courseSectionData[si];
    if (!section) return;
    if (li > 0) {
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${section.subSection[li - 1]._id}`);
    } else if (si > 0) {
      const prevSec = courseSectionData[si - 1];
      const lastLec = prevSec.subSection[prevSec.subSection.length - 1];
      navigate(`/view-course/${courseId}/section/${prevSec._id}/sub-section/${lastLec._id}`);
    }
  };

  // Normalize to string for consistent comparison between URL params (string) and DB IDs (integer)
  const isCompleted = completedLectures.map(String).includes(String(subSectionId));
  const progress = courseSectionData.length
    ? Math.round((completedLectures.length / courseSectionData.reduce((a, s) => a + s.subSection.length, 0)) * 100)
    : 0;

  // -- Autoplay on video end --

  const handleVideoEnd = () => {
    setVideoEnded(true);

    // Auto mark as complete if not already
    if (!isCompleted) {
      handleLectureCompletion();
    }

    if (autoplay && !isLastVideo()) {
      let c = 5;
      const t = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(t);
          goToNextVideo();
        }
      }, 1000);
      setAutoplayTimer(t);
    }
  };

  const cancelAutoplay = () => {
    clearInterval(autoplayTimer);
    setCountdown(5);
  };

  // -- Mark as complete --
  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete({ courseId, subSectionId }, token);
    if (res) dispatch(updateCompletedLectures(subSectionId));
    setLoading(false);
  };



  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
    toast.error("Error playing video. Format may be unsupported or network issue.");
  };

  const handleLoadedMetadata = async (e) => {
    setVideoLoading(false);
    const actualDuration = Math.floor(e.target.duration);

    // Self-healing: Update duration in backend if missing or 0
    if ((!videoData?.durationSeconds || videoData.durationSeconds === 0) && actualDuration > 0) {
      try {
        await updateLectureDuration({
          subSectionId: subSectionId,
          duration: actualDuration
        }, token);
        console.log("Lecture duration self-healed:", actualDuration);
      } catch (err) {
        console.error("Failed to self-heal duration:", err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-richblack-900">

      {/* PROGRESS BAR */}
      <div className="h-1 bg-richblack-700">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* VIDEO PLAYER AREA */}
      <div className="relative w-full bg-black h-[70vh] overflow-hidden group border-b border-white/5">
        {videoLoading && !videoError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-richblack-900/50 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {videoData?.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            key={videoData.videoUrl} // Use URL as key to force re-render on change
            src={videoData.videoUrl}
            controls
            autoPlay
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadStart={() => setVideoLoading(true)}
            onCanPlay={() => setVideoLoading(false)}
            onPlaying={() => setVideoLoading(false)}
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        ) : !videoLoading && (
          <div className="flex h-full items-center justify-center flex-col gap-5 p-6 text-center">
            {videoData && videoData.isUnlocked === false ? (
              <div className="max-w-md bg-richblack-800 border border-yellow-500/30 rounded-2xl p-8 shadow-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  🔒
                </div>
                <h3 className="text-xl font-bold text-white">This video is locked</h3>
                <p className="text-sm text-richblack-300 leading-relaxed">
                  Upgrade to <strong className="text-blue-400">Silver</strong> to get full course access for 1 year, or upgrade to <strong className="text-yellow-400">Gold</strong> for unlimited/lifetime access.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    Upgrade Access
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-richblack-800 flex items-center justify-center text-richblack-400">
                  <MdOutlineSlowMotionVideo size={48} />
                </div>
                <p className="text-richblack-300 font-medium">
                  {videoError ? "Unsupported video format or loading error" : "Select a lecture to start learning"}
                </p>
              </>
            )}
          </div>
        )}

        {/* AUTOPLAY OVERLAY */}
        {videoEnded && autoplay && !isLastVideo() && countdown > 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-yellow-400 flex items-center justify-center mx-auto text-white text-2xl font-bold animate-pulse">
                {countdown}
              </div>
              <p className="text-white font-semibold">Next lecture in {countdown}s</p>
              <button
                onClick={cancelAutoplay}
                className="px-5 py-2 rounded-lg border border-white/30 text-white text-sm hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="flex items-center justify-between px-6 py-4 bg-richblack-800 border-b border-richblack-700">
        <div className="flex items-center gap-3">
          <button
            disabled={isFirstVideo()}
            onClick={goToPrevVideo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 text-white text-sm disabled:opacity-40 hover:bg-richblack-600 transition"
          >
            <BsSkipBackwardFill /> Prev
          </button>
          <button
            disabled={isLastVideo()}
            onClick={goToNextVideo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 text-white text-sm disabled:opacity-40 hover:bg-richblack-600 transition"
          >
            Next <BsSkipForwardFill />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* AUTOPLAY TOGGLE */}
          <button
            onClick={() => { setAutoplay(!autoplay); cancelAutoplay(); }}
            className={`flex items-center gap-2 text-sm font-medium transition ${autoplay ? 'text-yellow-400' : 'text-richblack-400'}`}
          >
            <BsArrowRepeat size={16} />
            Autoplay {autoplay ? 'On' : 'Off'}
          </button>

          {/* MARK COMPLETE */}
          {!isCompleted ? (
            <button
              disabled={loading}
              onClick={handleLectureCompletion}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition disabled:opacity-50"
            >
              <BsCheckCircleFill /> Mark Done
            </button>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
              <BsCheckCircleFill /> Completed
            </span>
          )}
        </div>
      </div>

      {/* LECTURE INFO */}
      <div className="px-6 py-8 space-y-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-white">{videoData?.title || 'Lecture'}</h1>
        {videoData?.description && (
          <p className="text-richblack-300 text-base leading-relaxed">{videoData.description}</p>
        )}
      </div>
    </div>
  );
};

export default VideoDetails;