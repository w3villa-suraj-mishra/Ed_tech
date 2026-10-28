import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiEdit3, FiPlay, FiPlus, FiRefreshCw, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import { cancelLiveClass, createLiveClass, getLiveClassAttendance, getLiveClasses, startLiveClass, updateLiveClass } from "../services/operations/liveClassAPI";

const statusClass = { scheduled: "bg-blue-50 text-blue-700 border-blue-200", live: "bg-rose-50 text-rose-700 border-rose-200", completed: "bg-slate-100 text-slate-600 border-slate-200", cancelled: "bg-slate-100 text-slate-500 border-slate-200" };
const blank = () => ({ courseId: "", title: "", description: "", agenda: "", scheduledStartAt: "", scheduledEndAt: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", meetingBanner: "", materialsUrl: "" });
const localInput = (value) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
const formatted = (value) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function LiveClassesPage() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const instructor = user?.accountType === "Instructor";
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await getLiveClasses(instructor ? "Instructor" : "Student", token);
      setClasses(result.data?.data || []);
    } catch (error) { toast.error(error.response?.data?.message || "Could not load live classes"); }
    finally { setLoading(false); }
  }, [instructor, token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!instructor || !token) return;
    apiConnector("GET", courseEndpoints.GET_ALL_INSTRUCTOR_COURSES_API, null, { Authorization: `Bearer ${token}` }, { status: "Published", limit: 100 })
      .then((response) => setCourses(Array.isArray(response.data?.data) ? response.data.data : response.data?.data?.courses || []))
      .catch(() => {});
  }, [instructor, token]);

  const save = async (event) => {
    event.preventDefault();
    if (!form.courseId || !form.title.trim() || !form.scheduledStartAt || !form.scheduledEndAt) return toast.error("Course, title, start, and end time are required");
    setSaving(true);
    try {
      const payload = { ...form, scheduledStartAt: new Date(form.scheduledStartAt).toISOString(), scheduledEndAt: new Date(form.scheduledEndAt).toISOString() };
      if (form.id) await updateLiveClass(form.id, payload, token); else await createLiveClass(payload, token);
      toast.success(form.id ? "Live class updated" : "Live class scheduled"); setForm(null); load();
    } catch (error) { toast.error(error.response?.data?.message || "Unable to save live class"); }
    finally { setSaving(false); }
  };
  const start = async (item) => { try { await startLiveClass(item.id, token); navigate(`/live/${item.id}`); } catch (error) { toast.error(error.response?.data?.message || "Unable to start session"); } };
  const cancel = async (item) => { if (!window.confirm(`Cancel "${item.title}"? Enrolled students will be notified.`)) return; try { await cancelLiveClass(item.id, { cancellationReason: "Cancelled by instructor" }, token); toast.success("Class cancelled"); load(); } catch (error) { toast.error(error.response?.data?.message || "Unable to cancel class"); } };
  const attendance = async (item) => { try { const result = await getLiveClassAttendance(item.id, token); setReport(result.data?.data); } catch (error) { toast.error(error.response?.data?.message || "Unable to load attendance"); } };

  return <div className="min-h-screen bg-slate-50 p-4 md:p-7"><div className="mx-auto max-w-6xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-slate-900">Live Classes</h1><p className="mt-1 text-sm text-slate-500">{instructor ? "Schedule sessions and review attendance." : "Your enrolled course sessions in your local time."}</p></div><div className="flex gap-2"><button onClick={load} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600" aria-label="Refresh"><FiRefreshCw /></button>{instructor && <button onClick={() => setForm(blank())} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white"><FiPlus />Schedule class</button>}</div></header>
    {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading live classes...</p> : classes.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No live classes yet.</p> : <div className="space-y-3">{classes.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="font-extrabold text-slate-900">{item.title}</h2><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass[item.status]}`}>{item.status === "live" ? "Live now" : item.status}</span></div><p className="mt-1 text-xs font-bold text-indigo-600">{item.course?.courseName}</p>{item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}<div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><FiCalendar />{formatted(item.scheduledStartAt)}</span><span className="inline-flex items-center gap-1"><FiClock />{item.durationMinutes} minutes</span></div></div><div className="flex h-fit flex-wrap gap-2">{instructor ? <>{item.status === "scheduled" && <button onClick={() => start(item)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white"><FiPlay />Start</button>}<button disabled={["completed", "cancelled"].includes(item.status)} onClick={() => setForm({ ...item, courseId: String(item.courseId), scheduledStartAt: localInput(item.scheduledStartAt), scheduledEndAt: localInput(item.scheduledEndAt) })} className="rounded-lg border border-slate-200 p-2 text-slate-600"><FiEdit3 /></button><button onClick={() => attendance(item)} className="rounded-lg border border-slate-200 p-2 text-slate-600"><FiUsers /></button>{item.status === "scheduled" && <button onClick={() => cancel(item)} className="rounded-lg border border-rose-200 p-2 text-rose-600"><FiTrash2 /></button>}</> : <button disabled={item.status !== "live"} onClick={() => navigate(`/live/${item.id}`)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{item.status === "live" ? "Join live class" : "Not live yet"}</button>}</div></div></article>)}</div>}
    {form && <ClassForm form={form} setForm={setForm} courses={courses} save={save} saving={saving} />}
    {report && <AttendanceReport report={report} close={() => setReport(null)} />}
  </div></div>;
}

function ClassForm({ form, setForm, courses, save, saving }) { const fields = [["title", "Class title", "text"], ["scheduledStartAt", "Start time", "datetime-local"], ["scheduledEndAt", "End time", "datetime-local"], ["timezone", "Time zone", "text"], ["meetingBanner", "Banner URL", "text"], ["materialsUrl", "Materials URL", "text"]]; return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4"><form onSubmit={save} className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex justify-between"><h2 className="text-lg font-extrabold">{form.id ? "Edit live class" : "Schedule live class"}</h2><button type="button" onClick={() => setForm(null)}><FiX /></button></div><div className="grid gap-4 md:grid-cols-2"><label className="md:col-span-2 text-xs font-bold">Course<select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.courseName}</option>)}</select></label>{fields.map(([key, label, type]) => <label key={key} className="text-xs font-bold">{label}<input type={type} required={type === "datetime-local"} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>)}<label className="md:col-span-2 text-xs font-bold">Description<textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm" rows="3" /></label><label className="md:col-span-2 text-xs font-bold">Agenda<textarea value={form.agenda || ""} onChange={(e) => setForm({ ...form, agenda: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm" rows="2" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setForm(null)} className="rounded-lg border px-4 py-2 text-xs font-bold">Cancel</button><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">{saving ? "Saving..." : "Save class"}</button></div></form></div>; }
function AttendanceReport({ report, close }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4"><div className="mx-auto my-8 max-w-3xl rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-lg font-extrabold">Attendance report</h2><button onClick={close}><FiX /></button></div><p className="mt-1 text-sm text-slate-500">{report.summary?.attendedCount || 0} of {report.summary?.enrolledCount || 0} enrolled students attended.</p><div className="mt-4 space-y-2">{report.records?.map((record) => <div key={record.id} className="flex justify-between rounded-lg border p-3 text-sm"><span>{record.student?.firstName} {record.student?.lastName}</span><span>{record.attendedMinutes} min, {record.attendanceStatus}</span></div>)}</div></div></div>; }
