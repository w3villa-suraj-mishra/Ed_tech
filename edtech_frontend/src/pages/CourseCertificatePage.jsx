import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchCourseCertificate, verifyCertificateAPI } from "../services/operations/courseDetailsAPI";
import { FiDownload, FiPrinter, FiCheckCircle, FiAward, FiArrowLeft, FiLock } from "react-icons/fi";

const CourseCertificatePage = () => {
  const { courseId, certificateId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const loadCertificate = async () => {
      setLoading(true);
      setErrorInfo(null);

      // Public verification route
      if (certificateId) {
        const res = await verifyCertificateAPI(certificateId);
        if (res?.success && res?.isValid) {
          setCertData(res.data);
        } else {
          setErrorInfo({
            isLocked: true,
            message: res?.message || "Invalid or expired certificate."
          });
        }
      } else if (courseId && token) {
        // Student authenticated certificate fetch
        const res = await fetchCourseCertificate(courseId, token);
        if (res && !res.isLocked) {
          setCertData(res);
        } else {
          setErrorInfo(res || {
            isLocked: true,
            progressPercentage: 0,
            message: "Please complete the full course to unlock and receive your certificate."
          });
        }
      } else {
        setErrorInfo({
          isLocked: true,
          message: "Certificate access requires authentication or a valid certificate ID."
        });
      }
      setLoading(false);
    };

    loadCertificate();
  }, [courseId, certificateId, token]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <FiAward className="w-12 h-12 animate-bounce mx-auto text-amber-400" />
          <p className="text-sm font-semibold">Generating Certificate...</p>
        </div>
      </div>
    );
  }

  if (errorInfo?.isLocked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <FiLock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Certificate Locked</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {errorInfo.message}
            </p>
          </div>
          {typeof errorInfo.progressPercentage === 'number' && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Course Progress</span>
                <span className="text-indigo-600">{errorInfo.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${errorInfo.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => courseId ? navigate(`/s/courses/${courseId}/take`) : navigate("/t/u/activeCourses")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  const studentName = certData?.studentName || (certData?.user ? `${certData.user.firstName || ''} ${certData.user.lastName || ''}`.trim() : "Student");
  const courseTitle = certData?.courseName || "Course Completion";
  const instructor = certData?.instructorName || "Study Tech Instructor";
  const issueDate = certData?.completedAt
    ? new Date(certData.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = certData?.certificateId || "CERT-2026-000000";

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 flex flex-col items-center justify-center font-['Inter',sans-serif]">
      {/* TOP ACTIONS BAR (Hidden on Print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-800 px-4 py-2 rounded-lg border border-slate-700"
        >
          <FiArrowLeft size={16} /> Back to Player
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700 transition"
          >
            <FiPrinter size={16} /> Print
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition"
          >
            <FiDownload size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE CERTIFICATE CARD */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border-8 border-indigo-950 p-10 md:p-14 shadow-2xl relative overflow-hidden select-none print:shadow-none print:border-4 print:p-8">
        {/* CORNER ORNAMENTS */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-amber-500" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-amber-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-amber-500" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-amber-500" />

        {/* WATERMARK EMBLEM */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <FiAward className="w-96 h-96 text-indigo-900" />
        </div>

        {/* CERTIFICATE CONTENT */}
        <div className="relative z-10 text-center space-y-6">
          {/* HEADER BRANDING */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-extrabold text-xs tracking-widest uppercase mb-2">
              <FiAward size={14} className="text-amber-500" /> W3villa EdTech Academy
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-serif uppercase">
              Certificate of Completion
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest pt-1">
              This is to certify that
            </p>
          </div>

          {/* RECIPIENT NAME */}
          <div className="py-2 border-b-2 border-amber-400 max-w-lg mx-auto">
            <h2 className="text-2xl md:text-4xl font-extrabold text-indigo-900 tracking-wide capitalize font-serif">
              {studentName}
            </h2>
          </div>

          {/* COURSE DETAILS */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              has successfully completed all requirements, lectures, and assessments for the course
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 line-clamp-2">
              {courseTitle}
            </h3>
          </div>

          {/* METADATA & SIGNATURES */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-200 mt-8 items-end">
            <div className="text-left space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Instructor</p>
              <p className="text-sm font-bold text-slate-800">{instructor}</p>
              <div className="w-32 h-0.5 bg-slate-300 mt-2" />
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Issued Date</p>
              <p className="text-sm font-bold text-slate-800">{issueDate}</p>
              <p className="text-[10px] text-indigo-600 font-mono font-semibold pt-1">
                ID: {certId}
              </p>
            </div>
          </div>

          {/* VERIFICATION FOOTER */}
          <div className="pt-6 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <FiCheckCircle size={12} /> Official Verified Document
            </span>
            <span>Verify at: {window.location.origin}/certificate/verify/{certId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCertificatePage;
