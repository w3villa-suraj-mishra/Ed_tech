import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAllOffers,
  createOffer,
  updateOffer,
  updateOfferStatus,
  duplicateOffer,
  deleteOffer
} from '../../services/admin/offerAPI';
import { getCourses } from '../../services/admin/adminAPI';
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
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiPercent,
  FiDollarSign,
  FiBookOpen
} from 'react-icons/fi';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [viewDetailItem, setViewDetailItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    scope: 'ALL_COURSES',
    courseIds: [],
    startAt: '',
    endAt: '',
    maxUses: '',
    maxUsesPerUser: '',
    audience: 'ALL',
    status: 'ACTIVE'
  });

  const [courseSearch, setCourseSearch] = useState('');

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await getAllOffers({
        search: searchTerm,
        status: statusFilter,
        discountType: discountTypeFilter
      });
      if (res.data?.success) {
        setOffers(res.data.offers || []);
      }
    } catch (err) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    setCoursesLoading(true);
    setCoursesError('');
    try {
      const res = await getCourses();
      let rawCourses = [];
      if (Array.isArray(res.data)) {
        rawCourses = res.data;
      } else if (res.data?.data?.courses) {
        rawCourses = res.data.data.courses;
      } else if (res.data?.courses) {
        rawCourses = res.data.courses;
      } else if (res.data?.data) {
        rawCourses = Array.isArray(res.data.data) ? res.data.data : [];
      }
      setCourses(rawCourses);
    } catch (err) {
      console.error('Failed to load courses list for selection:', err);
      setCoursesError('Unable to load courses. Try again.');
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchCoursesList();
  }, [statusFilter, discountTypeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOffers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const parseLocalDatetime = (dtStr) => {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  };

  const formatLocalDatetime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setFormData({
      name: '',
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      scope: 'ALL_COURSES',
      courseIds: [],
      startAt: formatLocalDatetime(now.toISOString()),
      endAt: formatLocalDatetime(future.toISOString()),
      maxUses: '',
      maxUsesPerUser: '1',
      audience: 'ALL',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingId(offer.id);
    setFormData({
      name: offer.name || '',
      code: offer.code || '',
      description: offer.description || '',
      discountType: offer.discountType || 'PERCENTAGE',
      discountValue: offer.discountValue !== undefined ? String(offer.discountValue) : '',
      scope: offer.scope || 'ALL_COURSES',
      courseIds: offer.courses ? offer.courses.map((c) => c.id) : [],
      startAt: formatLocalDatetime(offer.startAt),
      endAt: formatLocalDatetime(offer.endAt),
      maxUses: offer.maxUses !== null && offer.maxUses !== undefined ? String(offer.maxUses) : '',
      maxUsesPerUser: offer.maxUsesPerUser !== null && offer.maxUsesPerUser !== undefined ? String(offer.maxUsesPerUser) : '',
      audience: offer.audience || 'ALL',
      status: offer.status || 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (publishAction = 'PUBLISH') => {
    if (!formData.name.trim()) {
      toast.error('Offer name is required');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Valid positive discount value is required');
      return;
    }
    if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }
    if (!formData.startAt || !formData.endAt) {
      toast.error('Start and End dates are required');
      return;
    }

    const startISO = parseLocalDatetime(formData.startAt);
    const endISO = parseLocalDatetime(formData.endAt);

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    if (formData.scope === 'SELECTED_COURSES' && formData.courseIds.length === 0) {
      toast.error('Please select at least one course for Selected Courses eligibility');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      scope: formData.scope,
      courseIds: formData.scope === 'SELECTED_COURSES' ? formData.courseIds : [],
      startAt: startISO,
      endAt: endISO,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser, 10) : null,
      audience: formData.audience,
      status: publishAction === 'DRAFT' ? 'DRAFT' : formData.status
    };

    try {
      if (editingId) {
        const res = await updateOffer(editingId, payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Offer updated successfully!');
          setModalOpen(false);
          fetchOffers();
        }
      } else {
        const res = await createOffer(payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Offer created successfully!');
          setModalOpen(false);
          fetchOffers();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save offer';
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (offer) => {
    const newStatus = offer.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      const res = await updateOfferStatus(offer.id, newStatus);
      if (res.data?.success) {
        toast.success(`Offer ${newStatus === 'DISABLED' ? 'disabled' : 'activated'}`);
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateOffer(id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Offer duplicated as Draft!');
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to duplicate offer');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await deleteOffer(deleteConfirmItem.id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Offer removed');
        setDeleteConfirmItem(null);
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to delete offer');
    }
  };

  const toggleCourseSelection = (courseId) => {
    setFormData((prev) => {
      const exists = prev.courseIds.includes(courseId);
      return {
        ...prev,
        courseIds: exists
          ? prev.courseIds.filter((id) => id !== courseId)
          : [...prev.courseIds, courseId]
      };
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">ACTIVE</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">SCHEDULED</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">EXPIRED</span>;
      case 'DISABLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-300">DISABLED</span>;
      case 'DRAFT':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300">DRAFT</span>;
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiTag className="text-purple-700" /> Offers & Coupons
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create and manage promotional discounts for courses.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <FiPlus className="text-base" />
            <span>+ Create Offer</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by offer name or promo code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="EXPIRED">Expired</option>
                <option value="DISABLED">Disabled</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Discount Type Filter */}
            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-800 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            >
              <option value="ALL">All Discount Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Offers & Coupons List</h2>
            <span className="text-xs text-purple-200">{offers.length} offers</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <FiTag className="text-4xl mx-auto text-gray-400 mb-3" />
              <p className="text-base font-semibold text-gray-800">No offers found</p>
              <p className="text-xs text-gray-500 mt-1">Create your first offer or adjust filter parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Offer</th>
                    <th className="px-6 py-3.5 font-bold">Code</th>
                    <th className="px-6 py-3.5 font-bold">Discount</th>
                    <th className="px-6 py-3.5 font-bold">Applicable Courses</th>
                    <th className="px-6 py-3.5 font-bold">Validity</th>
                    <th className="px-6 py-3.5 font-bold">Usage</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{offer.name}</div>
                        {offer.description && (
                          <div className="text-xs text-[#838894] truncate max-w-xs">{offer.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-gray-100 border border-gray-300 text-purple-600 font-mono font-bold text-xs">
                          {offer.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {offer.discountType === 'PERCENTAGE'
                          ? `${offer.discountValue}%`
                          : `₹${offer.discountValue}`}
                      </td>
                      <td className="px-6 py-4">
                        {offer.scope === 'ALL_COURSES' ? (
                          <span className="text-xs bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded font-semibold">All Courses</span>
                        ) : (
                          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-semibold">
                            {offer.courses ? `${offer.courses.length} Courses` : 'Selected Courses'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-600">
                        <div>
                          {new Date(offer.startAt).toLocaleDateString([], { day: '2-digit', month: 'short' })} → {' '}
                          {new Date(offer.endAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-medium text-gray-700">
                        {offer.totalUses} / {offer.maxUses ? offer.maxUses : '∞'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(offer.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewDetailItem(offer)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                            title="View Offer Details"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(offer)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                            title="Edit Offer"
                          >
                            <FiEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(offer.id)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                            title="Duplicate Offer"
                          >
                            <FiCopy size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(offer)}
                            className={`p-1.5 rounded-md transition border border-transparent ${
                              offer.status === 'DISABLED'
                                ? 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'
                                : 'text-amber-700 hover:bg-amber-50 hover:border-amber-200'
                            }`}
                            title={offer.status === 'DISABLED' ? 'Activate Offer' : 'Disable Offer'}
                          >
                            {offer.status === 'DISABLED' ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(offer)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                            title="Delete Offer"
                          >
                            <FiTrash2 size={15} />
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

        {/* ── CREATE / EDIT MODAL ─────────────────────────────────────── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiTag className="text-purple-600" />
                  {editingId ? 'Edit Offer' : 'Create Offer'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 p-1"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Offer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Raksha Bandhan Special Offer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RAKSHA50"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-purple-600 font-mono font-bold text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Get 50% OFF on selected courses."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 50' : 'e.g. 500'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Course Eligibility Scope */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    Applicable Courses *
                  </label>
                  <div className="flex items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 font-medium">
                      <input
                        type="radio"
                        name="scope"
                        checked={formData.scope === 'ALL_COURSES'}
                        onChange={() => setFormData({ ...formData, scope: 'ALL_COURSES', courseIds: [] })}
                        className="accent-[#FFD60A]"
                      />
                      <span>All Courses</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 font-medium">
                      <input
                        type="radio"
                        name="scope"
                        checked={formData.scope === 'SELECTED_COURSES'}
                        onChange={() => setFormData({ ...formData, scope: 'SELECTED_COURSES' })}
                        className="accent-[#FFD60A]"
                      />
                      <span>Selected Courses</span>
                    </label>
                  </div>

                  {formData.scope === 'SELECTED_COURSES' && (
                    <div className="bg-gray-100 p-3.5 rounded-xl border border-gray-300 space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="🔍 Search courses..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {coursesLoading ? (
                          <div className="py-6 text-center text-xs text-gray-500">
                            Loading courses...
                          </div>
                        ) : coursesError ? (
                          <div className="py-6 text-center text-xs text-red-400 flex flex-col items-center gap-2">
                            <span>{coursesError}</span>
                            <button
                              type="button"
                              onClick={fetchCoursesList}
                              className="px-3 py-1 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded text-gray-800 text-xs hover:border-purple-600"
                            >
                              Try again
                            </button>
                          </div>
                        ) : filteredCourses.length === 0 ? (
                          <div className="py-6 text-center text-xs text-[#838894]">
                            No courses available.
                          </div>
                        ) : (
                          filteredCourses.map((course) => {
                            const isSelected = formData.courseIds.includes(course.id);
                            return (
                              <label
                                key={course.id}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-purple-600/10 border border-purple-600/40 text-gray-800 font-semibold'
                                    : 'hover:bg-white shadow-sm border border-gray-200 text-gray-500 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCourseSelection(course.id)}
                                    className="accent-[#FFD60A] w-4 h-4 flex-shrink-0"
                                  />
                                  {course.thumbnail && (
                                    <img
                                      src={course.thumbnail}
                                      alt=""
                                      className="w-8 h-8 rounded object-cover flex-shrink-0 bg-white shadow-sm border border-gray-200"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate text-gray-800">{course.courseName}</div>
                                    {course.Category?.name && (
                                      <div className="text-[10px] text-[#838894] truncate">
                                        {course.Category.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="font-mono text-purple-600 ml-2 flex-shrink-0">
                                  ₹{course.price !== undefined ? course.price : 0}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#838894] border-t border-gray-300/50 pt-2">
                        <span>
                          Selected: <strong className="text-purple-600 font-bold">{formData.courseIds.length}</strong> {formData.courseIds.length === 1 ? 'course' : 'courses'}
                        </span>
                        {formData.courseIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, courseIds: [] })}
                            className="text-gray-500 hover:text-gray-800 underline text-[10px]"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Maximum Total Uses
                    </label>
                    <input
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Max Uses Per User
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Audience Eligibility */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    Eligible Users
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-600"
                  >
                    <option value="ALL">All Users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="INSTRUCTORS">Instructors</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-[#1a2332]">
                <button
                  onClick={() => handleSubmit('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-[#3E4553] text-gray-500 hover:text-gray-800 font-medium text-xs transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-transparent text-gray-500 hover:text-gray-800 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit('PUBLISH')}
                    className="px-5 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    {editingId ? 'Update Offer' : 'Publish Offer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW MODAL ─────────────────────────────────────── */}
        {viewDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiTag className="text-purple-600" /> Offer Details
                </h3>
                <button onClick={() => setViewDetailItem(null)} className="text-gray-500 hover:text-gray-800">
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-500">
                <div>
                  <span className="text-xs text-[#838894] block">Offer Name</span>
                  <span className="text-gray-800 font-semibold text-base">{viewDetailItem.name}</span>
                </div>

                <div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-[#838894] block">Promo Code</span>
                    <span className="font-mono text-purple-600 font-extrabold text-base">{viewDetailItem.code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#838894] block">Discount</span>
                    <span className="text-gray-800 font-extrabold text-base">
                      {viewDetailItem.discountType === 'PERCENTAGE' ? `${viewDetailItem.discountValue}%` : `₹${viewDetailItem.discountValue}`}
                    </span>
                  </div>
                </div>

                {viewDetailItem.description && (
                  <div>
                    <span className="text-xs text-[#838894] block">Description</span>
                    <span className="text-gray-800 text-xs">{viewDetailItem.description}</span>
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-500 block mb-1">Applicable Courses</span>
                  {viewDetailItem.scope === 'ALL_COURSES' ? (
                    <span className="text-xs bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-md font-semibold inline-block">
                      All Courses
                    </span>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {viewDetailItem.courses && viewDetailItem.courses.length > 0 ? (
                        viewDetailItem.courses.map((c) => (
                          <div key={c.id} className="text-xs bg-gray-100 px-2.5 py-1.5 rounded text-gray-800 flex justify-between">
                            <span>{c.courseName}</span>
                            <span className="text-purple-600">₹{c.price}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Selected courses</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#838894] block">Validity</span>
                    <span className="text-gray-800 font-medium">
                      {new Date(viewDetailItem.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      <br />
                      → {new Date(viewDetailItem.endAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#838894] block">Usage & Limits</span>
                    <span className="text-gray-800 font-medium">
                      {viewDetailItem.totalUses} / {viewDetailItem.maxUses ? viewDetailItem.maxUses : 'Unlimited'}
                      <br />
                      Per User: {viewDetailItem.maxUsesPerUser ? viewDetailItem.maxUsesPerUser : 'Unlimited'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-xs text-[#838894] block">Audience</span>
                    <span className="text-gray-800 font-semibold text-xs">{viewDetailItem.audience}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#838894] block mb-0.5">Status</span>
                    {getStatusBadge(viewDetailItem.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiTrash2 className="text-red-600" /> Remove Offer?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to remove <strong className="text-gray-900">{deleteConfirmItem.name}</strong> ({deleteConfirmItem.code})?
                {deleteConfirmItem.totalUses > 0 && (
                  <span className="block mt-2 text-xs text-amber-800 font-semibold bg-amber-50 p-2 rounded border border-amber-200">
                    Note: Since this offer has historical usage, it will be Disabled rather than permanently deleted.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
