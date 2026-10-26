import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiUsers,
  FiArrowRight,
  FiFileText,
  FiClock,
  FiZap,
  FiCheckCircle,
  FiHelpCircle
} from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contactusEndpoint } from "../../../services/apis";
import toast from "react-hot-toast";

const HelpSupport = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("faqs");
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Categories for filter pills
  const filterCategories = ["All", "Account", "Payments", "Courses", "Certificates"];

  // Dynamic FAQ list matching the screenshot exactly
  const defaultFaqs = [
    {
      id: 1,
      category: "Courses",
      q: "I purchased a course but it's not showing on my dashboard / in my 'Course not found'. What do I do?",
      a: "Please refresh your browser or log out and log back in. If your order status is confirmed, your course will immediately appear under your Enrolled Courses section on the dashboard."
    },
    {
      id: 2,
      category: "Payments",
      q: "My payment was successful but the course isn't activated. Help!",
      a: "Payment gateway webhooks may take 2-5 minutes to verify. If your course hasn't unlocked after 5 minutes, please click 'Create a New Ticket' with your Transaction ID so our team can immediately activate it."
    },
    {
      id: 3,
      category: "Courses",
      q: "How does course validity / access work now?",
      a: "All enrolled courses come with lifetime access, including all future lecture additions, code snippets, project repositories, and discussion forums."
    },
    {
      id: 4,
      category: "Account",
      q: "I'm not able to log in / OTP is not coming.",
      a: "Check your spam or junk folder for verification emails. If you signed in using Google OAuth, please use the 'Sign in with Google' button directly."
    },
    {
      id: 5,
      category: "Account",
      q: "Can I change the email address linked to my account?",
      a: "Yes. Head over to Dashboard Settings to update your registered email address, contact number, and personal profile information."
    }
  ];

  // Popular Help Articles matching screenshot
  const popularArticles = [
    { id: 1, title: "How to Enroll in a Course", desc: "Step-by-step guide to enroll" },
    { id: 2, title: "Understanding Course Access", desc: "Learn about validity & access" },
    { id: 3, title: "Payment & Refund Policy", desc: "All about payments and refunds" },
    { id: 4, title: "Certificates & Completion", desc: "How to earn and view certificates" }
  ];

  const filteredFaqs = defaultFaqs.filter((faq) => {
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedFilter === "All" || faq.category.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;

    try {
      setSubmitting(true);
      const payload = {
        firstname: user?.firstName || "Student",
        lastname: user?.lastName || "User",
        email: user?.email || "student@codelearn.com",
        subject: ticketSubject,
        message: `[SUPPORT TICKET]: ${ticketSubject}\n\n${ticketMsg}`,
        phoneNo: user?.additionalDetails?.contactNumber || "",
      };

      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        payload
      );

      if (res?.data?.success) {
        toast.success("Support ticket submitted to support team! 🎉");
        const newTicket = {
          id: Date.now(),
          subject: ticketSubject,
          message: ticketMsg,
          status: "Pending",
          date: new Date().toLocaleDateString()
        };
        setTickets([newTicket, ...tickets]);
        setTicketSubject("");
        setTicketMsg("");
        setSubmittedSuccess(true);
        setTimeout(() => {
          setSubmittedSuccess(false);
          setShowTicketModal(false);
          setActiveTab("tickets");
        }, 1200);
      } else {
        toast.error(res?.data?.message || "Failed to submit ticket");
      }
    } catch (err) {
      console.error("Ticket submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit support ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-12 max-w-[1240px] mx-auto">
      
      {/* 4. MAIN HELP & SUPPORT GRID (LEFT: FAQs/Tickets, RIGHT: Articles/Hours) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FAQs & TICKETS TABS + STILL NEED HELP */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* Header row with "View All FAQs ->" */}
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <button
                onClick={() => setSelectedFilter("All")}
                className="text-xs font-semibold text-[#3BA7F2] hover:text-[#3BA7F2] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All FAQs</span>
                <span>→</span>
              </button>
            </div>

            {/* Sub-Tabs: FAQs vs My Tickets */}
            <div className="flex items-center gap-6 border-b border-slate-100">
              <button
                onClick={() => setActiveTab("faqs")}
                className={`text-xs font-bold pb-2.5 transition-all relative cursor-pointer ${
                  activeTab === "faqs"
                    ? "text-[#3BA7F2]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                FAQs
                {activeTab === "faqs" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3BA7F2] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("tickets")}
                className={`text-xs font-bold pb-2.5 transition-all relative cursor-pointer ${
                  activeTab === "tickets"
                    ? "text-[#3BA7F2]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                My Tickets ({tickets.length})
                {activeTab === "tickets" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3BA7F2] rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENT: FAQs ACCORDION */}
            {activeTab === "faqs" && (
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-slate-200/80 hover:border-indigo-200 rounded-xl overflow-hidden transition-all bg-white"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-medium text-slate-800 hover:text-slate-900 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <FiChevronDown
                          className={`text-base text-slate-400 transition-transform duration-200 shrink-0 ${
                            openFaq === faq.id ? "rotate-180 text-[#3BA7F2]" : ""
                          }`}
                        />
                      </button>

                      {openFaq === faq.id && (
                        <div className="px-4 pb-4 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No FAQs found matching your search.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MY TICKETS */}
            {activeTab === "tickets" && (
              <div className="space-y-3">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-slate-200/80 p-4 rounded-xl space-y-2 bg-slate-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900">{ticket.subject}</h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{ticket.message}</p>
                      <span className="text-[10px] text-slate-400 block">Submitted on {ticket.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <FiHelpCircle className="text-3xl mx-auto text-indigo-400" />
                    <p className="text-xs font-bold text-slate-800">No Support Tickets Found</p>
                    <p className="text-[11px] text-slate-500">
                      You haven't submitted any support tickets yet. Click below to create one.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* STILL NEED HELP BANNER CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#13AA92]/10/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 font-bold flex items-center justify-center text-lg shrink-0">
                ?
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Still need help?</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Can't find the answer you're looking for? Contact our support team.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer active:scale-95"
            >
              <span>Contact Support</span>
              <FiArrowRight className="text-xs" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: POPULAR ARTICLES & SUPPORT HOURS */}
        <div className="space-y-6">
          
          {/* Card 1: Popular Help Articles */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Popular Help Articles</h2>
              <button
                onClick={() => navigate("/dashboard/articles")}
                className="text-xs text-[#3BA7F2] font-semibold hover:text-[#3BA7F2] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {popularArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-200 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#3BA7F2] flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                      <FiFileText />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#3BA7F2] transition-colors truncate">
                        {article.title}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {article.desc}
                      </span>
                    </div>
                  </div>

                  <FiArrowRight className="text-slate-400 group-hover:text-[#3BA7F2] group-hover:translate-x-0.5 transition-all text-xs shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Support Hours */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Support Hours
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3BA7F2] flex items-center justify-center text-sm shrink-0">
                  <FiClock />
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[11px] block">Monday – Sunday</span>
                  <span className="font-bold text-slate-900 text-xs">9:00 AM – 9:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center text-sm shrink-0">
                  <FiZap />
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[11px] block">Average Response Time</span>
                  <span className="font-bold text-slate-900 text-xs">Under 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-sm shrink-0">
                  <FiCheckCircle />
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[11px] block">Resolution Rate</span>
                  <span className="font-bold text-slate-900 text-xs">98% of tickets resolved</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. CREATE SUPPORT TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-slate-900 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">Create Support Ticket</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <FiCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Ticket Submitted Successfully!</h3>
                <p className="text-xs text-slate-500">Our support team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold">Subject / Issue Title *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Payment successful but course not assigned"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Provide details about your query or transaction ID..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#3BA7F2] hover:bg-[#3BA7F2] disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. ARTICLE DETAILS MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 text-slate-900 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">{selectedArticle.title}</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-blue-600">{selectedArticle.desc}</p>
              <p>
                Welcome to the official CodeLearn guide for <strong>{selectedArticle.title}</strong>. This article covers step-by-step instructions on accessing your account, tracking your course progress, and resolving common payment or enrollment questions.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Key Tips:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Ensure you are logged into your registered email account.</li>
                  <li>Check your Enrolled Courses tab on your dashboard.</li>
                  <li>Contact support if you need further assistance.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpSupport;
