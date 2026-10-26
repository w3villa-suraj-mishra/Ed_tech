import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute } from '../../components/admin/AdminUI';
import {
  getSpotlightInstructors,
  createSpotlightInstructor,
  updateSpotlightInstructor,
  deleteSpotlightInstructor,
  toggleSpotlightStatus,
  resetToDefaultSpotlightInstructors
} from '../../services/admin/instructorSpotlightAPI';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiSearch,
  FiEye,
  FiRotateCcw,
  FiUser,
  FiAward,
  FiX,
  FiUpload,
  FiUploadCloud,
  FiLink,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminInstructors() {
  return (
    <AdminProtectedRoute>
      <InstructorsInner />
    </AdminProtectedRoute>
  );
}

function InstructorsInner() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewInstructor, setPreviewInstructor] = useState(null);

  // Image Upload state
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const initialForm = {
    name: '',
    role: 'Senior Engineering Specialist & Tech Lead',
    experience: '9+ Years Building Production Systems',
    studentsMentored: '38,000+',
    badgeText: 'Verified Industry Lead',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    skills: 'Fullstack Architecture, Kubernetes, DevOps Pipelines',
    titleQuote: 'Master deep problem-solving with real engineering rigor.',
    quote: '"True engineering excellence is not memorizing syntax—it is understanding memory models, asynchronous concurrency, and building resilient distributed systems that stay up under massive loads. That is what we teach every single day."',
    published: true
  };

  const [formData, setFormData] = useState(initialForm);

  const loadInstructors = () => {
    setLoading(true);
    const data = getSpotlightInstructors();
    setInstructors(data);
    if (data.length > 0 && !previewInstructor) {
      setPreviewInstructor(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.role.toLowerCase().includes(search.toLowerCase()) ||
      (inst.skills && inst.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && inst.published) ||
      (filterStatus === 'Inactive' && !inst.published);
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageInputMode('file');
    setModalOpen(true);
  };

  const handleOpenEdit = (inst) => {
    setEditingId(inst.id);
    setFormData({
      name: inst.name,
      role: inst.role,
      experience: inst.experience,
      studentsMentored: inst.studentsMentored,
      badgeText: inst.badgeText || 'Verified Industry Lead',
      image: inst.image,
      skills: Array.isArray(inst.skills) ? inst.skills.join(', ') : inst.skills,
      titleQuote: inst.titleQuote,
      quote: inst.quote,
      published: inst.published !== false
    });
    // If it's an online HTTP URL, default to URL tab, otherwise file tab
    if (inst.image && inst.image.startsWith('http')) {
      setImageInputMode('url');
    } else {
      setImageInputMode('file');
    }
    setModalOpen(true);
  };

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Auto-scale to max 800px dimension and compress to JPEG 0.88 for crisp look + minimal storage
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData((prev) => ({ ...prev, image: dataUrl }));
        setIsCompressing(false);
        toast.success('Image loaded from computer successfully!');
      };
      img.onerror = () => {
        setIsCompressing(false);
        toast.error('Failed to process image file.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setIsCompressing(false);
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim() || !formData.titleQuote.trim() || !formData.quote.trim()) {
      toast.error('Name, Role, Title Headline, and Quote are required.');
      return;
    }
    if (!formData.image) {
      toast.error('Please upload or provide a profile image for the instructor.');
      return;
    }

    if (editingId) {
      updateSpotlightInstructor(editingId, formData);
      toast.success('Instructor spotlight updated successfully!');
    } else {
      createSpotlightInstructor(formData);
      toast.success('New instructor spotlight created!');
    }

    setModalOpen(false);
    loadInstructors();
  };

  const handleDelete = (id) => {
    deleteSpotlightInstructor(id);
    toast.success('Instructor removed from spotlight.');
    setDeleteConfirmId(null);
    loadInstructors();
  };

  const handleToggleStatus = (id) => {
    toggleSpotlightStatus(id);
    loadInstructors();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset spotlight instructors to default values?')) {
      resetToDefaultSpotlightInstructors();
      toast.success('Reset to default instructors.');
      loadInstructors();
    }
  };

  const activeCount = instructors.filter((i) => i.published).length;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>👨‍🏫</span> Instructor Spotlight Manager
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage the world-class instructors and mentors featured on the homepage slider.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 text-xs font-semibold rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FiRotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-md shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiPlus size={15} />
              <span>+ Add Instructor</span>
            </button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Spotlight Instructors</span>
            <div className="text-2xl font-bold text-gray-900 mt-1.5">
              {instructors.length}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active on Homepage Slider</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1.5">
              {activeCount}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Mentored Count</span>
            <div className="text-2xl font-bold text-purple-700 mt-1.5">
              83,000+
            </div>
          </div>
        </div>
  
        {/* CONTROLS BAR: SEARCH & STATUS FILTER */}
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto">
            <FiSearch className="text-gray-400 text-base shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search by instructor name, role, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-gray-600 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 outline-none cursor-pointer focus:border-purple-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* INSTRUCTORS LIST TABLE */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Instructor Spotlight Details</h2>
            <span className="text-xs text-purple-200">{filteredInstructors.length} instructors</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-5 py-3.5">Role & Experience</th>
                  <th className="px-5 py-3.5">Mentored Count</th>
                  <th className="px-5 py-3.5">Skills Tags</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map((inst) => (
                    <tr
                      key={inst.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={inst.image}
                            alt={inst.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-sm text-gray-900 block">
                              {inst.name}
                            </span>
                            <span className="text-[11px] text-purple-700 font-semibold">
                              {inst.badgeText || "Verified Industry Lead"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Experience */}
                      <td className="px-5 py-4 max-w-xs">
                        <span className="font-semibold text-gray-800 block truncate">
                          {inst.role}
                        </span>
                        <span className="text-[11px] text-gray-500 block truncate">
                          {inst.experience}
                        </span>
                      </td>

                      {/* Mentored Count */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900">
                        {inst.studentsMentored}
                      </td>

                      {/* Skills Tags */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(inst.skills) ? inst.skills : (inst.skills || '').split(',')).slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium"
                            >
                              {typeof s === 'string' ? s.trim() : s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(inst.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                            inst.published
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {inst.published ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewInstructor(inst)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition cursor-pointer border border-transparent hover:border-purple-200"
                            title="Preview in Slider"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition cursor-pointer border border-transparent hover:border-purple-200"
                            title="Edit Details"
                          >
                            <FiEdit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(inst.id)}
                            className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer border border-transparent hover:border-red-200"
                            title="Delete Instructor"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                      No spotlight instructors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 max-w-2xl w-full rounded-2xl p-6 sm:p-8 text-gray-800 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edit Instructor Spotlight" : "Add New Instructor Spotlight"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Instructor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suraj Mishra"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Designation / Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Engineering Specialist & Tech Lead"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Experience Byline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9+ Years Building Production Systems"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Students Mentored Metric */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Students Mentored Metric *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 38,000+"
                      value={formData.studentsMentored}
                      onChange={(e) => setFormData({ ...formData, studentsMentored: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Photo Badge Text */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Photo Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified Industry Lead"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Skills / Tags (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Fullstack Architecture, Kubernetes, DevOps Pipelines"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                </div>

                {/* Profile Image with File Upload or URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">
                      Profile Image *
                    </label>
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('file')}
                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          imageInputMode === 'file'
                            ? 'bg-white text-purple-700 shadow-xs'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <FiUpload size={12} /> Upload from Computer
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          imageInputMode === 'url'
                            ? 'bg-white text-purple-700 shadow-xs'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <FiLink size={12} /> Image URL
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'file' ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col sm:flex-row items-center gap-4 ${
                        isDragging
                          ? 'border-purple-600 bg-purple-50/50 ring-4 ring-purple-600/10'
                          : 'border-gray-200 bg-gray-50/70 hover:border-purple-400'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* Image Preview Box */}
                      <div className="relative shrink-0">
                        {formData.image ? (
                          <div className="relative">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-20 h-20 rounded-xl object-cover border-2 border-purple-600 shadow-sm"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full text-[10px] shadow">
                              <FiCheck size={10} />
                            </span>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                            <FiUploadCloud size={26} />
                            <span className="text-[10px] mt-1 font-medium">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Upload buttons and drag drop info */}
                      <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            disabled={isCompressing}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                          >
                            <FiUpload size={14} />
                            {isCompressing ? 'Processing...' : 'Browse from Computer'}
                          </button>

                          {formData.image && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500">
                          Drag and drop an image file here, or click to browse (PNG, JPG, WEBP, GIF).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 text-xs"
                      />
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0 shadow-xs"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Title Quote Headline */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Hook Title / Title Quote *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master deep problem-solving with real engineering rigor."
                    value={formData.titleQuote}
                    onChange={(e) => setFormData({ ...formData, titleQuote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                {/* Full Quote / Philosophy */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Full Quote / Educational Philosophy *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter full engineering quote..."
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
                  />
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-700 cursor-pointer"
                  />
                  <label htmlFor="publishedCheck" className="text-xs text-gray-700 font-medium cursor-pointer">
                    Publish immediately on Homepage Mentor Slider
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold transition shadow-sm cursor-pointer"
                  >
                    {editingId ? "Save Changes" : "Create Instructor"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 max-w-sm w-full rounded-2xl p-6 text-gray-800 space-y-4 shadow-2xl">
              <h3 className="font-bold text-base text-gray-900">Remove Instructor Spotlight?</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to remove this instructor from the spotlight section? You can re-add them or reset defaults anytime.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
