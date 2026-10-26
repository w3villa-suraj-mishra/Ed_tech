import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminAnnouncements,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  updateAdminAnnouncementStatus,
  deleteAdminAnnouncement
} from '../../services/admin/announcementAPI';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiEye,
  FiClock,
  FiTag,
  FiArrowRight,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter
} from 'react-icons/fi';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    highlightText: '',
    audience: 'ALL',
    ctaEnabled: false,
    ctaText: 'Claim Now',
    ctaUrl: '/courses',
    countdownEnabled: false,
    startAt: '',
    endAt: '',
    status: 'ACTIVE',
    priority: 'Normal',
    dismissible: true
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnnouncements({
        status: statusFilter,
        audience: audienceFilter,
        search: searchTerm
      });
      if (res?.data?.success) {
        setAnnouncements(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [statusFilter, audienceFilter, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      highlightText: '',
      audience: 'ALL',
      ctaEnabled: false,
      ctaText: 'Claim Now',
      ctaUrl: '/courses',
      countdownEnabled: false,
      startAt: '',
      endAt: '',
      status: 'ACTIVE',
      priority: 'Normal',
      dismissible: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      message: item.message || '',
      highlightText: item.highlightText || '',
      audience: item.audience || 'ALL',
      ctaEnabled: !!item.ctaEnabled,
      ctaText: item.ctaText || 'Claim Now',
      ctaUrl: item.ctaUrl || '/courses',
      countdownEnabled: !!item.countdownEnabled,
      startAt: item.startAt ? new Date(item.startAt).toISOString().slice(0, 16) : '',
      endAt: item.endAt ? new Date(item.endAt).toISOString().slice(0, 16) : '',
      status: item.status || 'ACTIVE',
      priority: item.priority || 'Normal',
      dismissible: item.dismissible !== undefined ? item.dismissible : true
    });
    setModalOpen(true);
  };

  const handleDuplicate = async (item) => {
    try {
      const payload = {
        ...item,
        title: `${item.title} (Copy)`,
        status: 'DRAFT'
      };
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;

      const res = await createAdminAnnouncement(payload);
      if (res?.data?.success) {
        toast.success('Announcement duplicated as Draft');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await updateAdminAnnouncementStatus(item.id, nextStatus);
      if (res?.data?.success) {
        toast.success(`Announcement is now ${nextStatus}`);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status toggle failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteAdminAnnouncement(id);
      if (res?.data?.success) {
        toast.success('Announcement deleted');
        setDeleteConfirmId(null);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please enter Title and Message');
      return;
    }

    if (formData.ctaEnabled && (!formData.ctaText.trim() || !formData.ctaUrl.trim())) {
      toast.error('CTA Text and URL are required when CTA is enabled');
      return;
    }

    if (formData.countdownEnabled && (!formData.startAt || !formData.endAt)) {
      toast.error('Start and End dates are required for Countdown');
      return;
    }

    if (formData.startAt && formData.endAt && new Date(formData.endAt) <= new Date(formData.startAt)) {
      toast.error('End date must be later than Start date');
      return;
    }

    try {
      // Helper to convert HTML datetime-local (YYYY-MM-DDTHH:mm) into a proper Date object
      const parseLocalDatetime = (dtStr) => {
        if (!dtStr) return null;
        const d = new Date(dtStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      const payload = {
        ...formData,
        startAt: parseLocalDatetime(formData.startAt),
        endAt: parseLocalDatetime(formData.endAt)
      };

      if (editingId) {
        const res = await updateAdminAnnouncement(editingId, payload);
        if (res?.data?.success) {
          toast.success('Announcement updated successfully');
          setModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await createAdminAnnouncement(payload);
        if (res?.data?.success) {
          toast.success('Announcement created successfully');
          setModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'SCHEDULED':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'DRAFT':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>📢 Announcement & Banner Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create and target top promotional banners, special offers, and platform announcements.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <FiPlus className="text-base" />
            <span>+ Create Announcement</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3.5 pl-9 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FiFilter className="text-sm" />
              <span className="font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-1.5 outline-none cursor-pointer focus:border-purple-600"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
                <option value="EXPIRED">Expired</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Audience:</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-1.5 outline-none cursor-pointer focus:border-purple-600"
              >
                <option value="All">All Audiences</option>
                <option value="ALL">Everyone (ALL)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="INSTRUCTORS">Instructors Only</option>
              </select>
            </div>
          </div>

        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Announcements & Banners</h2>
            <span className="text-xs text-purple-200">{announcements.length} records</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-3">
              <div className="spinner mx-auto"></div>
              <p>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <p className="text-2xl">📢</p>
              <p className="font-bold text-gray-800 text-sm">No announcements found</p>
              <p>Create a new promotional banner to start displaying announcements to learners.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-gray-800 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px] tracking-wider">
                    <th className="py-3.5 px-5">Title & Details</th>
                    <th className="py-3.5 px-4">Audience</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Schedule / Range</th>
                    <th className="py-3.5 px-4">CTA & Details</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {announcements.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      
                      {/* Title & Details */}
                      <td className="py-4 px-5 max-w-xs space-y-1">
                        <div className="flex items-center gap-2">
                          {item.highlightText && (
                            <span className="bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                              {item.highlightText}
                            </span>
                          )}
                          <span className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</span>
                        </div>
                        <p className="text-gray-500 line-clamp-2 text-xs">{item.message}</p>
                      </td>

                      {/* Audience */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          item.audience === 'STUDENTS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          item.audience === 'INSTRUCTORS' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-sky-50 text-sky-800 border-sky-200'
                        }`}>
                          {item.audience || 'ALL'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase ${
                          item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          item.status === 'SCHEDULED' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                          item.status === 'DRAFT' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          item.status === 'EXPIRED' ? 'bg-red-50 text-red-700 border-red-300' :
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap text-[11px]">
                        {item.startAt || item.endAt ? (
                          <div className="space-y-0.5">
                            <div>From: {item.startAt ? new Date(item.startAt).toLocaleString() : 'Immediate'}</div>
                            <div>To: {item.endAt ? new Date(item.endAt).toLocaleString() : 'Never'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Always Active</span>
                        )}
                      </td>

                      {/* CTA & Priority */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-600 text-[11px] space-y-1">
                        {item.ctaEnabled ? (
                          <div className="text-purple-700 font-semibold">
                            CTA: {item.ctaText} → {item.ctaUrl}
                          </div>
                        ) : (
                          <span className="text-gray-400">No CTA</span>
                        )}
                        <div>Priority: <span className="font-bold text-gray-800">{item.priority}</span></div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview */}
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                            title="Preview Banner"
                          >
                            <FiEye className="text-sm" />
                          </button>

                          {/* Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`p-1.5 rounded-md transition border border-transparent ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={item.status === 'ACTIVE' ? 'Deactivate' : 'Publish / Activate'}
                          >
                            <FiCheckCircle className="text-sm" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                            title="Duplicate"
                          >
                            <FiCopy className="text-sm" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                            title="Edit"
                          >
                            <FiEdit className="text-sm" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                            title="Delete"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* CREATE / EDIT MODAL WITH LIVE PREVIEW */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl custom-scrollbar text-gray-800">
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '✏️ Edit Announcement' : '📢 Create New Announcement'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* LIVE BANNER PREVIEW BOX */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                👀 Live User Banner Preview
              </span>
              <div className="w-full bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 border border-purple-500/40 text-white rounded-xl p-3.5 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
                  {formData.highlightText && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm shrink-0">
                      <FiTag className="text-xs" />
                      <span>{formData.highlightText}</span>
                    </span>
                  )}
                  <div className="font-medium text-gray-200 flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-white">{formData.title || 'Rakshabandhan Special Offer'}:</span>
                    <span>{formData.message || 'Celebrate Rakshabandhan — Get 50% OFF'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 shrink-0">
                  {formData.countdownEnabled && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold">
                      <FiClock className="text-purple-300 text-xs animate-pulse" />
                      <span>07h 32m 28s</span>
                    </div>
                  )}

                  {formData.ctaEnabled && (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md">
                      <span>{formData.ctaText || 'Claim Now'}</span>
                      <FiArrowRight className="text-xs" />
                    </button>
                  )}

                  {formData.dismissible && (
                    <div className="p-1 text-gray-400">
                      <FiX className="text-base" />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakshabandhan Special Offer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Highlight Text / Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. RAKSHA BANDHAN50"
                    value={formData.highlightText}
                    onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Message *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Celebrate Rakshabandhan — Get 50% OFF on all premium courses"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Audience *</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3.5 py-2.5 outline-none focus:border-purple-600"
                  >
                    <option value="ALL">Everyone (ALL)</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="INSTRUCTORS">Instructors Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3.5 py-2.5 outline-none focus:border-purple-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High (Top Display)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3.5 py-2.5 outline-none focus:border-purple-600"
                  >
                    <option value="ACTIVE">Active (Publish Now)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* CTA OPTIONS */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Call To Action (CTA Button)</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.ctaEnabled}
                      onChange={(e) => setFormData({ ...formData, ctaEnabled: e.target.checked })}
                      className="accent-purple-700 rounded w-4 h-4 cursor-pointer"
                    />
                    <span>Enable CTA Button</span>
                  </label>
                </div>

                {formData.ctaEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Button Text *</label>
                      <input
                        type="text"
                        placeholder="e.g. Claim Now"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Button URL *</label>
                      <input
                        type="text"
                        placeholder="e.g. /courses or https://..."
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COUNTDOWN OPTIONS */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Countdown Timer & Expiration Schedule</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.countdownEnabled}
                      onChange={(e) => setFormData({ ...formData, countdownEnabled: e.target.checked })}
                      className="accent-purple-700 rounded w-4 h-4 cursor-pointer"
                    />
                    <span>Enable Countdown</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-gray-600 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* DISMISSIBLE TOGGLE */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="accent-purple-700 rounded w-4 h-4 cursor-pointer"
                  />
                  <span>Allow users to dismiss banner (Show × button)</span>
                </label>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FULL BANNER PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 text-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Banner Preview: {previewItem.title}</h3>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="w-full bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 border border-purple-500/40 text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {previewItem.highlightText && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase">
                    {previewItem.highlightText}
                  </span>
                )}
                <span><strong>{previewItem.title}:</strong> {previewItem.message}</span>
              </div>
              {previewItem.ctaEnabled && (
                <button className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold shrink-0">
                  {previewItem.ctaText || 'Claim Now'}
                </button>
              )}
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setPreviewItem(null)} className="px-4 py-2 rounded-lg bg-purple-700 text-white text-xs font-bold hover:bg-purple-800">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 text-gray-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-xl mx-auto">
              <FiAlertCircle />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Announcement?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
