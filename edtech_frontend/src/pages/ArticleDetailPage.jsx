import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCalendar, FiUser, FiShare2 } from "react-icons/fi";
import { getAllArticles } from "../services/operations/articleAPI";
import toast from "react-hot-toast";

const fallbackArticles = [
  {
    id: "deep-learning-ai",
    title: "Deep Learning: Understanding the Technology Behind Modern AI",
    summary: "Learn the fundamentals of deep learning, how neural networks work, and how this powerful technology is used in modern artificial intelligence applications.",
    category: "Engineering & Tech",
    readTime: "5 min read",
    author: "Suraj Mishra",
    createdAt: "2026-03-01",
    content: `Deep learning has emerged as the cornerstone of contemporary artificial intelligence, fueling breakthroughs across natural language processing, computer vision, and predictive modeling.

At its essence, deep learning relies on artificial neural networks with multiple layers—hence the term "deep." Each layer of neurons extracts increasingly abstract representations from raw input:
1. Low-level layers detect simple primitives like edges, corners, or frequency components.
2. Mid-level layers aggregate these primitives into contours, shapes, or phonemes.
3. High-level layers synthesize these shapes into high-dimensional semantic objects such as faces, objects, or contextually coherent sentences.

Through optimization algorithms such as Adam and Stochastic Gradient Descent (SGD), combined with backpropagation, models iteratively adjust millions (and today, billions) of synaptic weights to minimize loss functions.

As models like Transformers and diffusion networks continue to reshape how engineers build software, understanding neural network fundamentals empowers developers to build intelligent, autonomous, and high-impact applications.`
  },
  {
    id: "complete-guide-react-hooks",
    title: "Complete Guide to React Hooks",
    summary: "Master React Hooks with practical examples. Learn useState, useEffect, useContext and build better React applications.",
    category: "Web Development",
    readTime: "8 min read",
    author: "Suraj Mishra",
    createdAt: "2026-02-28",
    content: `React Hooks revolutionized modern frontend engineering by allowing developers to manage state and side effects without writing class components.

Key Hooks every React engineer must master:
- **useState**: Enables localized state preservation across component re-renders.
- **useEffect**: Synchronizes components with external systems, APIs, or DOM operations, with declarative cleanup functions.
- **useContext**: Solves prop drilling by distributing centralized theme, authentication, or session state cleanly across nested trees.
- **useMemo & useCallback**: Prevent expensive recalculations and memoize function references to maintain high rendering performance.

By composing custom hooks, engineers encapsulate complex state machines and asynchronous business logic into highly reusable, testable primitives.`
  },
  {
    id: "building-rest-apis-node-express",
    title: "Building REST APIs with Node.js and Express",
    summary: "A step-by-step guide to building scalable REST APIs using Node.js, Express.js and best practices.",
    category: "Backend",
    readTime: "6 min read",
    author: "Suraj Mishra",
    createdAt: "2026-02-24",
    content: `Node.js and Express provide an agile, asynchronous ecosystem for architecting performant RESTful APIs.

Core architectural pillars:
- **Middleware Pipeline**: Implement clean layers for request parsing, CORS headers, token authentication, and centralized error handling.
- **Modular Routing**: Decouple resource controllers from path definitions to maintain clean code separation.
- **Security Best Practices**: Apply rate limiting, Helmet security headers, SQL/NoSQL injection sanitation, and standardized HTTP status codes.
- **Testing & Validation**: Validate payloads rigorously with libraries like Zod or Joi to ensure reliable service contracts.`
  },
  {
    id: "database-design-fundamentals",
    title: "Database Design Fundamentals",
    summary: "Learn the core concepts of database design, normalization, relationships and write efficient SQL queries.",
    category: "Database",
    readTime: "7 min read",
    author: "Suraj Mishra",
    createdAt: "2026-02-20",
    content: `Reliable software architectures begin with robust, normalized relational database schemas.

Key Principles of Database Design:
- **Entity Relationship Modeling**: Identify primary entities, attributes, and relationships (One-to-One, One-to-Many, Many-to-Many).
- **Normalization Rules (1NF to 3NF)**: Eliminate data redundancy and prevent insertion, update, and deletion anomalies.
- **Indexing Strategies**: Optimize B-Tree indexes on foreign keys and frequently queried filter columns to prevent costly full table scans.
- **Transactions & ACID Compliance**: Guarantee data integrity through atomic operations, isolation levels, and rollback handlers.`
  },
  {
    id: "modern-ui-design-tailwind-css",
    title: "Modern UI Design with Tailwind CSS",
    summary: "Build responsive and beautiful user interfaces faster with Tailwind CSS. Learn tips, tricks and real-world examples.",
    category: "Frontend",
    readTime: "5 min read",
    author: "Suraj Mishra",
    createdAt: "2026-02-18",
    content: `Tailwind CSS empowers engineers to build bespoke, production-ready interfaces directly within their templates using utility-first classes.

Why Tailwind dominates modern web development:
- **Constraint-Based Design Tokens**: Consistent spacing, typography scales, and tailored palettes guarantee visual harmony across large teams.
- **Zero Runtime Overhead**: Purges unused CSS at build time, yielding hyper-compact production bundles under 15kb.
- **Responsive & State Modifiers**: Compose complex responsive breakpoints, hover states, dark modes, and focus rings with zero custom CSS boilerplate.`
  },
  {
    id: "how-to-stay-consistent-learning",
    title: "How to Stay Consistent in Learning",
    summary: "Practical tips and strategies to stay consistent, productive and achieve your learning goals as a developer.",
    category: "Career & Growth",
    readTime: "4 min read",
    author: "Suraj Mishra",
    createdAt: "2026-02-15",
    content: `Consistent progress compounds into extraordinary technical expertise over time.

Strategies for sustainable engineering growth:
- **Build Real-World Projects**: Transition immediately from passive tutorial consumption to active coding, debugging, and project shipping.
- **Time-Block Deep Work**: Dedicate 45 uninterrupted minutes each morning to learning new patterns or practicing algorithms.
- **Share in Public**: Document your learnings in technical articles, code repositories, or peer discussions to solidify your understanding.`
  }
];

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const list = await getAllArticles();
        const found = list?.find((a) => String(a.id) === String(articleId));
        if (found) {
          setArticle(found);
        } else {
          const fallback = fallbackArticles.find((a) => String(a.id) === String(articleId));
          setArticle(fallback || fallbackArticles[0]);
        }
      } catch (err) {
        const fallback = fallbackArticles.find((a) => String(a.id) === String(articleId));
        setArticle(fallback || fallbackArticles[0]);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [articleId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-[#3BA7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The article you are looking for may have been updated or moved.</p>
        <button
          onClick={() => navigate("/dashboard/articles")}
          className="px-5 py-2.5 bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white rounded-xl font-bold text-xs transition"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-16 max-w-4xl mx-auto space-y-6">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard/articles")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#3BA7F2] hover:border-indigo-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <FiArrowLeft size={14} />
          <span>Back to Articles</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <FiShare2 size={13} />
          <span>Share</span>
        </button>
      </div>

      {/* Main Article Container */}
      <article className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <span className="bg-[#13AA92]/10 text-[#3BA7F2] border border-indigo-200 px-3.5 py-1 rounded-full text-xs font-bold">
            {article.category}
          </span>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <FiClock size={13} className="text-slate-400" />
              {article.readTime || "5 min read"}
            </span>
            <span className="flex items-center gap-1.5">
              <FiCalendar size={13} className="text-slate-400" />
              {new Date(article.createdAt || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pt-1">
            <div className="w-7 h-7 rounded-full bg-[#15803D] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {(article.author ? article.author[0] : "S")}
            </div>
            <span>
              Written by <strong className="text-slate-900">{article.author || "Suraj Mishra"}</strong>
            </span>
          </div>
        </div>

        {/* Summary Callout */}
        {article.summary && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs sm:text-sm italic leading-relaxed">
            "{article.summary}"
          </div>
        )}

        {/* Full Article Body */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-wrap font-sans">
            {article.content || article.summary}
          </div>
        </div>

      </article>

    </div>
  );
}
