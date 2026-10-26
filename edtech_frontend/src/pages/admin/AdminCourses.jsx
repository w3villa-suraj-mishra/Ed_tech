import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, AdminInput, AdminSelect, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import {
  getCourses, getCourse, updateCourse, updateCourseStatus, updateCoursePricing, deleteCourse, getCategories,
  createSection, updateSection, deleteSection,
  createSubSection, updateSubSection, deleteSubSection
} from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  return <AdminProtectedRoute><CoursesInner /></AdminProtectedRoute>;
}

function CoursesInner() {
  const [courses, setCourses] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTP]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Modals
  const [editModal, setEditModal]       = useState(null);
  const [sectionsModal, setSectionsModal] = useState(null); // course obj
  const [delModal, setDelModal]         = useState(null);
  
  // Section / SubSection state inside sectionsModal
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Section forms
  const [secForm, setSecForm] = useState({ sectionName: '' });
  const [editingSec, setEditingSec] = useState(null);
  const [delSecId, setDelSecId] = useState(null);

  // SubSection forms
  const [subModal, setSubModal] = useState(null); // { secId, subObj (optional) }
  const [subForm, setSubForm] = useState({ title: '', description: '', timeDuration: '' });
  const [subVideo, setSubVideo] = useState(null);
  const [delSubId, setDelSubId] = useState(null);

  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [thumbnail, setThumbnail]   = useState(null);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getCourses({ page, limit: 15, search, status: statusFilter })
      .then(({ data }) => { setCourses(data.data.courses); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCategories().then(({ data }) => setCategories(data.data)).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCourseFull = (courseId) => {
    setLoadingDetails(true);
    getCourse(courseId)
      .then(({ data }) => setCourseDetails(data.data))
      .catch(() => toast.error('Failed to load course sections'))
      .finally(() => setLoadingDetails(false));
  };

  const openSectionsModal = (c) => {
    setSectionsModal(c);
    loadCourseFull(c.id);
  };

  const openEdit = (c) => {
    setForm({
      courseName: c.courseName,
      courseDescription: c.courseDescription,
      price: c.pricing?.originalPrice || c.originalPrice || c.price,
      discountType: c.discountType || c.pricing?.discountType || 'none',
      discountValue: c.discountValue ?? c.pricing?.discountValue ?? 0,
      offerStartAt: c.offerStartAt ? new Date(c.offerStartAt).toISOString().split('T')[0] : '',
      offerEndAt: c.offerEndAt ? new Date(c.offerEndAt).toISOString().split('T')[0] : '',
      tag: c.tag,
      status: c.status,
      categoryId: c.categoryId,
      whatYouWillLearn: c.whatYouWillLearn,
      instructions: c.instructions
    });
    setThumbnail(null);
    setEditModal(c);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.courseName?.trim()) { toast.error('Course name required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null && !['discountType', 'discountValue', 'offerStartAt', 'offerEndAt'].includes(k)) fd.append(k, v); });
      if (thumbnail) fd.append('thumbnailImage', thumbnail);
      await updateCourse(editModal.id, fd);
      await updateCoursePricing(editModal.id, {
        price: form.price,
        discountType: form.discountType,
        discountValue: form.discountValue,
        offerStartAt: form.offerStartAt || null,
        offerEndAt: form.offerEndAt || null
      });
      toast.success('Course & pricing updated');
      setEditModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'Published' ? 'Draft' : 'Published';
    try {
      await updateCourseStatus(c.id, next);
      toast.success(`Course ${next.toLowerCase()}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(delModal);
      toast.success('Course deleted');
      setDelModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setDeleting(false); }
  };

  // Section CRUD
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!secForm.sectionName.trim()) return;
    try {
      if (editingSec) {
        await updateSection(editingSec.id, { sectionName: secForm.sectionName });
        toast.success('Section updated');
      } else {
        await createSection({ courseId: sectionsModal.id, sectionName: secForm.sectionName });
        toast.success('Section created');
      }
      setSecForm({ sectionName: '' });
      setEditingSec(null);
      loadCourseFull(sectionsModal.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSection = async () => {
    try {
      await deleteSection(delSecId);
      toast.success('Section deleted');
      setDelSecId(null);
      loadCourseFull(sectionsModal.id);
    } catch { toast.error('Failed to delete section'); }
  };

  // SubSection CRUD
  const openSubModal = (secId, sub = null) => {
    setSubModal({ secId, sub });
    setSubForm(sub ? { title: sub.title || '', description: sub.description || '', timeDuration: sub.timeDuration || '' } : { title: '', description: '', timeDuration: '' });
    setSubVideo(null);
  };

  const handleSaveSubSection = async (e) => {
    e.preventDefault();
    if (!subForm.title.trim()) return;
    try {
      const fd = new FormData();
      fd.append('title', subForm.title);
      if (subForm.description) fd.append('description', subForm.description);
      if (subForm.timeDuration) fd.append('timeDuration', subForm.timeDuration);
      if (subVideo) fd.append('video', subVideo);

      if (subModal.sub) {
        await updateSubSection(subModal.sub.id, fd);
        toast.success('Lecture updated');
      } else {
        fd.append('sectionId', subModal.secId);
        await createSubSection(fd);
        toast.success('Lecture added');
      }
      setSubModal(null);
      loadCourseFull(sectionsModal.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSubSection = async () => {
    try {
      await deleteSubSection(delSubId);
      toast.success('Lecture deleted');
      setDelSubId(null);
      loadCourseFull(sectionsModal.id);
    } catch { toast.error('Failed to delete lecture'); }
  };

  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search courses…"
          className="flex-1 min-w-[200px] bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-40 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-purple-600">
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Course Details</h2>
          <span className="text-xs text-purple-200">{courses.length} courses</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide bg-gray-50">
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Instructor</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={6} /></td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No courses found." /></td></tr>
              ) : courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {c.thumbnail && <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                      <span className="font-medium text-gray-800 max-w-[180px] truncate">{c.courseName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.Category?.name || c.category?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {c?.pricing?.isOfferActive || (c?.originalPrice && Number(c?.originalPrice) > Number(c?.price)) ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 line-through">₹{c?.pricing?.originalPrice || c?.originalPrice}</span>
                        <span className="font-bold text-purple-600">₹{c?.pricing?.finalPrice || c?.price}</span>
                        {c?.pricing?.discountPercentage > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold">{c?.pricing?.discountPercentage}% OFF</span>
                        )}
                      </div>
                    ) : (
                      <span>₹{c.price ?? 0}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openSectionsModal(c)} className="px-2.5 py-1 rounded text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer">
                        Sections
                      </button>
                      <button onClick={() => toggleStatus(c)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${c.status === 'Published' ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'}`}>
                        {c.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => openEdit(c)} className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer">Edit</button>
                      {isSA && <button onClick={() => setDelModal(c.id)} className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer">Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-200">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Edit Course Modal */}
      <AdminModal isOpen={!!editModal} title="Edit Course" onClose={() => setEditModal(null)} size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <AdminInput label="Course Name" value={form.courseName || ''} onChange={setF('courseName')} />
          <AdminTextarea label="Description" value={form.courseDescription || ''} onChange={setF('courseDescription')} rows={3} />
          <AdminTextarea label="What You Will Learn" value={form.whatYouWillLearn || ''} onChange={setF('whatYouWillLearn')} rows={2} />
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
            <span className="text-xs font-bold text-purple-900 uppercase">Subscription Plan Prices (₹)</span>
            <div className="grid grid-cols-3 gap-2">
              <AdminInput label="Basic (1 Mo)" type="number" value={form.basicPrice ?? 499} onChange={setF('basicPrice')} />
              <AdminInput label="Plus (1 Yr)" type="number" value={form.price ?? 4999} onChange={setF('price')} />
              <AdminInput label="Pro (2 Yrs)" type="number" value={form.proPrice ?? 6999} onChange={setF('proPrice')} />
            </div>
          </div>
          <AdminInput label="Tag" value={form.tag || ''} onChange={setF('tag')} />
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-gray-200">
            <div>
              <AdminSelect label="Discount Type" value={form.discountType || 'none'} onChange={setF('discountType')}>
                <option value="none">No Discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </AdminSelect>
            </div>
            {form.discountType !== 'none' && (
              <div>
                <AdminInput label={form.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Fixed Offer Price (₹)'} type="number" value={form.discountValue ?? 0} onChange={setF('discountValue')} />
              </div>
            )}
          </div>
          {form.discountType !== 'none' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <AdminInput label="Offer Start Date" type="date" value={form.offerStartAt || ''} onChange={setF('offerStartAt')} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
              <AdminInput label="Offer End Date" type="date" value={form.offerEndAt || ''} onChange={setF('offerEndAt')} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <AdminSelect label="Status" value={form.status || 'Draft'} onChange={setF('status')}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </AdminSelect>
            <AdminSelect label="Category" value={form.categoryId || ''} onChange={setF('categoryId')}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </AdminSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Thumbnail</label>
            {editModal?.thumbnail && !thumbnail && <img src={editModal.thumbnail} alt="current" className="w-24 h-16 object-cover rounded-lg mb-2" />}
            <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 file:text-xs hover:file:bg-[#424854]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Sections & Subsections Management Modal */}
      <AdminModal isOpen={!!sectionsModal} title={`Manage Sections — ${sectionsModal?.courseName}`} onClose={() => setSectionsModal(null)} size="xl">
        <div className="space-y-6">
          {/* Create / Edit Section Form */}
          <form onSubmit={handleSaveSection} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <input
              value={secForm.sectionName}
              onChange={e => setSecForm({ sectionName: e.target.value })}
              placeholder={editingSec ? "Update section name…" : "Add new section name…"}
              className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none px-2"
            />
            {editingSec && (
              <button type="button" onClick={() => { setEditingSec(null); setSecForm({ sectionName: '' }); }} className="text-xs text-gray-500 hover:text-gray-800 px-2">Cancel</button>
            )}
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-[#FFEE32]">
              {editingSec ? 'Update' : '+ Add Section'}
            </button>
          </form>

          {/* Sections List */}
          {loadingDetails ? (
            <TableSkeleton rows={4} cols={2} />
          ) : !courseDetails?.sections?.length ? (
            <p className="text-sm text-gray-500 text-center py-6">No sections yet. Create one above!</p>
          ) : (
            <div className="space-y-4">
              {courseDetails.sections.map((sec, idx) => (
                <div key={sec.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                    <span className="font-semibold text-sm text-gray-800">
                      Section {idx + 1}: {sec.sectionName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openSubModal(sec.id)} className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors">
                        + Add Lecture
                      </button>
                      <button onClick={() => { setEditingSec(sec); setSecForm({ sectionName: sec.sectionName }); }} className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700 text-xs hover:bg-gray-100 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDelSecId(sec.id)} className="px-2 py-1 rounded bg-red-50 border border-red-200 text-red-600 text-xs hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Subsections List */}
                  <div className="pl-4 space-y-2">
                    {sec.subSections?.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-white shadow-sm border border-gray-200 p-2.5 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-800">{sub.title}</p>
                          {sub.timeDuration && <p className="text-[10px] text-gray-500">Duration: {sub.timeDuration}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.videoUrl && (
                            <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-purple-700 hover:text-purple-900 hover:underline font-semibold">
                              ▶ Video
                            </a>
                          )}
                          <button onClick={() => openSubModal(sec.id, sub)} className="text-xs text-gray-600 hover:text-gray-900 px-1 font-semibold">Edit</button>
                          <button onClick={() => setDelSubId(sub.id)} className="text-xs text-red-600 hover:text-red-700 px-1 font-semibold">Delete</button>
                        </div>
                      </div>
                    ))}
                    {!sec.subSections?.length && (
                      <p className="text-xs text-gray-500 italic">No lectures in this section.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminModal>

      {/* Add / Edit SubSection Modal */}
      <AdminModal isOpen={!!subModal} title={subModal?.sub ? "Edit Lecture" : "Add Lecture"} onClose={() => setSubModal(null)}>
        <form onSubmit={handleSaveSubSection} className="space-y-4">
          <AdminInput label="Lecture Title" value={subForm.title} onChange={e => setSubForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Variables" />
          <AdminTextarea label="Description" value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          <AdminInput label="Duration (e.g. 10m 30s)" value={subForm.timeDuration} onChange={e => setSubForm(p => ({ ...p, timeDuration: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Video File</label>
            <input type="file" accept="video/*" onChange={e => setSubVideo(e.target.files[0])} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 file:text-xs" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSubModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-[#FFEE32]">Save Lecture</button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmations */}
      <DeleteConfirm isOpen={!!delModal} title="Delete Course?" message="This will permanently delete the course, all its sections, subsections, and enrollments." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
      <DeleteConfirm isOpen={!!delSecId} title="Delete Section?" message="This will delete this section and all its lectures." onClose={() => setDelSecId(null)} onConfirm={handleDeleteSection} />
      <DeleteConfirm isOpen={!!delSubId} title="Delete Lecture?" message="This will delete this video lecture." onClose={() => setDelSubId(null)} onConfirm={handleDeleteSubSection} />
    </AdminLayout>
  );
}
