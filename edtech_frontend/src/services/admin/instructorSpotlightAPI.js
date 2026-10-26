const STORAGE_KEY = 'codelearn_instructor_spotlights';

// Default instructors matching the frontend reference screenshot
export const defaultSpotlightInstructors = [
  {
    id: "inst-1",
    name: "Suraj Mishra",
    role: "Senior Engineering Specialist & Tech Lead",
    experience: "9+ Years Building Production Systems",
    titleQuote: "Master deep problem-solving with real engineering rigor.",
    quote: '"True engineering excellence is not memorizing syntax—it is understanding memory models, asynchronous concurrency, and building resilient distributed systems that stay up under massive loads. That is what we teach every single day."',
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    studentsMentored: "38,000+",
    badgeText: "Verified Industry Lead",
    skills: ["Fullstack Architecture", "Kubernetes", "DevOps Pipelines"],
    published: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "inst-2",
    name: "Lakshay Kumar",
    role: "Ex-Microsoft & Amazon Principal Architect",
    experience: "12+ Years Industry Experience",
    titleQuote: "Transforming ambitious learners into world-class software engineers.",
    quote: '"We bridge the critical chasm between academic theory and high-scale production systems. Through rigorous architectural reviews, real distributed challenges, and disciplined code practices, our students build the confidence to lead engineering teams worldwide."',
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    studentsMentored: "45,000+",
    badgeText: "Verified Industry Lead",
    skills: ["System Architecture", "Microservices", "Cloud Scaling"],
    published: true,
    order: 2,
    createdAt: new Date().toISOString()
  }
];

const dispatchUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('instructor-spotlight-updated'));
  }
};

export const getSpotlightInstructors = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading spotlight instructors from storage:", err);
  }
  // Initialize storage with defaults
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSpotlightInstructors));
  } catch (e) {}
  return defaultSpotlightInstructors;
};

export const createSpotlightInstructor = (instructorData) => {
  const current = getSpotlightInstructors();
  const newInstructor = {
    id: `inst-${Date.now()}`,
    name: instructorData.name || "New Instructor",
    role: instructorData.role || "Senior Tech Educator",
    experience: instructorData.experience || "5+ Years Industry Experience",
    titleQuote: instructorData.titleQuote || "Master deep problem-solving with real engineering rigor.",
    quote: instructorData.quote || "",
    image: instructorData.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    studentsMentored: instructorData.studentsMentored || "10,000+",
    badgeText: instructorData.badgeText || "Verified Industry Lead",
    skills: Array.isArray(instructorData.skills)
      ? instructorData.skills
      : (instructorData.skills || "").split(",").map(s => s.trim()).filter(Boolean),
    published: instructorData.published !== undefined ? instructorData.published : true,
    order: current.length + 1,
    createdAt: new Date().toISOString()
  };

  const updated = [newInstructor, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  dispatchUpdateEvent();
  return newInstructor;
};

export const updateSpotlightInstructor = (id, instructorData) => {
  const current = getSpotlightInstructors();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...instructorData,
        skills: Array.isArray(instructorData.skills)
          ? instructorData.skills
          : (instructorData.skills || "").split(",").map(s => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  dispatchUpdateEvent();
  return true;
};

export const deleteSpotlightInstructor = (id) => {
  const current = getSpotlightInstructors();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  dispatchUpdateEvent();
  return true;
};

export const toggleSpotlightStatus = (id) => {
  const current = getSpotlightInstructors();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, published: !item.published };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  dispatchUpdateEvent();
  return true;
};

export const resetToDefaultSpotlightInstructors = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSpotlightInstructors));
  dispatchUpdateEvent();
  return defaultSpotlightInstructors;
};
