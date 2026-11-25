const helpers = require('../utils/helpers');

const toCamelCase = (key) => {
  return key.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
};

const normalizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const normalized = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    normalized[key] = value;
    const camelKey = toCamelCase(key);
    if (camelKey !== key) {
      normalized[camelKey] = value;
    }
  });

  return normalized;
};

const resolveBackendUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://res.cloudinary.com')) {
    return trimmed.replace('http://', 'https://');
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const base = process.env.BACKEND_URL || process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000');
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
};

const formatSubSection = (subSection) => {
  const sub = normalizeObject(subSection);
  const durationSeconds = parseInt(sub.duration, 10) || helpers.parseTimeDuration(sub.timeDuration) || 0;
  const rawVideo = sub.videoUrl || sub.video_url || sub.video || null;
  const formatted = {
    ...sub,
    _id: sub.id,
    videoUrl: resolveBackendUrl(rawVideo),
    durationSeconds,
    duration: secondsToPrettyString(durationSeconds)
  };
  return formatted;
};

const secondsToPrettyString = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);
  return parts.join(' ');
};

const formatCourse = async (course, currentUserId = null) => {
  if (!course) return null;

  const coursePlain = course.get ? course.get({ plain: true }) : { ...course };
  const result = normalizeObject(coursePlain);
  result._id = coursePlain.id;

  const { calculateCoursePrice } = require('./pricingService');
  const pricing = calculateCoursePrice(coursePlain);
  result.pricing = pricing;
  // Dynamic price field alias for client components relying on price
  result.price = pricing.finalPrice;
  result.originalPrice = pricing.originalPrice;

  let totalRating = 0;
  let reviewsCount = 0;
  if (coursePlain.ratingAndReviews) {
    reviewsCount = coursePlain.ratingAndReviews.length;
    coursePlain.ratingAndReviews.forEach(r => totalRating += (r.rating || 0));
  }
  result.rating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : "0.0";
  result.reviewsCount = reviewsCount;

  // Check instructor or admin privileges
  let isInstructorOrAdmin = false;
  let userEnrollment = null;

  if (currentUserId) {
    const courseInstructorId = coursePlain.instructorId || coursePlain.instructor_id || coursePlain.instructor?.id || coursePlain.instructor?._id;
    if (courseInstructorId && String(courseInstructorId) === String(currentUserId)) {
      isInstructorOrAdmin = true;
    } else {
      try {
        const { User } = require('../models');
        const user = await User.findByPk(currentUserId);
        if (user && ['Instructor', 'Admin', 'Superadmin'].includes(user.accountType)) {
          isInstructorOrAdmin = true;
        }
      } catch (err) {
        // Ignore user lookup error
      }
    }

    // Get enrollment status if user is provided
    const { Enrollment } = require('../models');
    userEnrollment = await Enrollment.findOne({
      where: { userId: currentUserId, courseId: coursePlain.id }
    });
    if (userEnrollment && userEnrollment.plan === 'silver' && userEnrollment.expiresAt && new Date(userEnrollment.expiresAt) <= new Date()) {
      await userEnrollment.update({ status: 'expired' });
    }
  }

  const completedVideos = [];
  if (currentUserId && coursePlain.courseProgresses) {
    const enrollmentActivatedTime = userEnrollment?.activatedAt ? new Date(userEnrollment.activatedAt).getTime() : 0;
    coursePlain.courseProgresses.forEach((progress) => {
      const pUserId = progress.userId || progress.user_id;
      if (String(pUserId) === String(currentUserId)) {
        const videos = progress.courseProgressVideos || progress.course_progress_videos || [];
        videos.forEach((video) => {
          if (!enrollmentActivatedTime || !video.createdAt || new Date(video.createdAt).getTime() >= enrollmentActivatedTime) {
            completedVideos.push(video.subSectionId || video.sub_section_id);
          }
        });
      }
    });
  }

  result.userEnrollment = userEnrollment ? {
    plan: userEnrollment.plan,
    status: userEnrollment.status,
    activatedAt: userEnrollment.activatedAt,
    expiresAt: userEnrollment.expiresAt
  } : null;

  let globalVideoCounter = 0;

  const rawSections = (coursePlain.sections || coursePlain.Sections || coursePlain.courseContent || coursePlain.course_content || [])
    .slice()
    .sort((a, b) => {
      const aPos = Number(a.position ?? 0);
      const bPos = Number(b.position ?? 0);
      if (aPos !== bPos) return aPos - bPos;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

  result.courseContent = rawSections.map((sectionRaw) => {
    const section = normalizeObject(sectionRaw);
    section._id = section.id;
    section.sectionName = section.sectionName || section.section_name;

    const rawSubSections = (sectionRaw.subSections || sectionRaw.sub_sections || sectionRaw.subSection || sectionRaw.SubSections || [])
      .slice()
      .sort((a, b) => {
        const aPos = Number(a.position ?? 0);
        const bPos = Number(b.position ?? 0);
        if (aPos !== bPos) return aPos - bPos;
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      });

    const subSectionList = rawSubSections.map((subRaw) => {
      globalVideoCounter++;
      const formatted = formatSubSection(subRaw);
      const isFreeVideo = globalVideoCounter <= 2;

      let isUnlocked = false;
      let accessReason = '';

      if (isInstructorOrAdmin) {
        isUnlocked = true;
        accessReason = 'Instructor/Admin Access';
      } else if (userEnrollment && userEnrollment.status === 'active') {
        const plan = (userEnrollment.plan || '').toLowerCase();
        if (['gold', 'pro'].includes(plan)) {
          isUnlocked = true;
          accessReason = 'Gold/Pro Lifetime Access';
        } else if (['silver', 'plus', 'basic'].includes(plan)) {
          if (!userEnrollment.expiresAt || new Date(userEnrollment.expiresAt) > new Date()) {
            isUnlocked = true;
            accessReason = `${userEnrollment.plan} Active Access`;
          } else {
            isUnlocked = isFreeVideo;
            accessReason = isFreeVideo ? 'Free Preview' : `${userEnrollment.plan} Expired`;
          }
        } else if (plan === 'free') {
          isUnlocked = isFreeVideo;
          accessReason = isFreeVideo ? 'Free Access (First 2 Videos)' : 'Requires Upgrade';
        } else {
          isUnlocked = true;
          accessReason = 'Active Enrolled Access';
        }
      } else {
        // Unenrolled User
        isUnlocked = isFreeVideo;
        accessReason = isFreeVideo ? 'Free Access (First 2 Videos)' : 'Requires Enrollment';
      }

      return {
        ...formatted,
        videoPosition: globalVideoCounter,
        isFreeVideo,
        isUnlocked,
        accessReason,
        // Hide videoUrl for locked videos on the backend to prevent inspection bypass
        videoUrl: isUnlocked ? (formatted.videoUrl || formatted.video_url || formatted.video) : null
      };
    });

    return {
      ...section,
      subSection: subSectionList,
      subSections: subSectionList,
      totalDurationSeconds: subSectionList.reduce((sum, item) => sum + (item.durationSeconds || 0), 0),
      totalDuration: secondsToPrettyString(subSectionList.reduce((sum, item) => sum + (item.durationSeconds || 0), 0))
    };
  });

  result.sections = result.courseContent;

  const courseDurationSeconds = result.courseContent.reduce((sum, section) => sum + (section.totalDurationSeconds || 0), 0);
  result.totalDurationSeconds = courseDurationSeconds;
  result.totalDuration = secondsToPrettyString(courseDurationSeconds);
  result.completedVideos = [...new Set(completedVideos)];

  if (coursePlain.category) {
    result.category = normalizeObject(coursePlain.category);
  }

  return result;
};

module.exports = {
  formatCourse,
  normalizeObject,
  secondsToPrettyString
};
