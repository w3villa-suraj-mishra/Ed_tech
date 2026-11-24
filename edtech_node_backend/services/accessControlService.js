const { Enrollment, Course, Section, SubSection } = require('../models');
const { PLAN_TYPES, PLAN_CONFIG } = require('../config/plans');
const { Op } = require('sequelize');

/**
 * Service to check course and video access for a user.
 */
class AccessControlService {
  /**
   * Get user's enrollment for a course and evaluate live status.
   * @param {number} userId 
   * @param {number} courseId 
   * @returns {Promise<Object|null>}
   */
  static async getUserCourseEnrollment(userId, courseId) {
    if (!userId || !courseId) return null;

    const enrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (!enrollment) return null;

    // Check live expiration for Silver plan
    if (enrollment.plan === PLAN_TYPES.SILVER && enrollment.status === 'active' && enrollment.expiresAt) {
      if (new Date(enrollment.expiresAt) <= new Date()) {
        await enrollment.update({ status: 'expired' });
      }
    }

    return enrollment;
  }

  /**
   * Determine if user has access to a specific subSection (video).
   * Rules:
   * 1. Gold: ALLOW
   * 2. Active Silver (unexpired): ALLOW
   * 3. Free (or active Free plan enrollment): ALLOW if video position <= 2
   * 4. Else: DENY
   * 
   * @param {number} userId 
   * @param {number} courseId 
   * @param {number} subSectionId 
   * @returns {Promise<{ allowed: boolean, reason: string, plan: string, isFreeVideo: boolean }>}
   */
  static async canAccessVideo(userId, courseId, subSectionId) {
    // Determine overall video position in course
    const videoPosition = await this.getVideoPositionInCourse(courseId, subSectionId);
    const isFreeVideo = videoPosition > 0 && videoPosition <= 2;

    if (!userId) {
      if (isFreeVideo) {
        return { allowed: true, reason: 'Free preview video', plan: 'none', isFreeVideo: true };
      }
      return { allowed: false, reason: 'Authentication required for video 3+', plan: 'none', isFreeVideo: false };
    }

    // Check if user is course instructor or admin
    try {
      const { User, Course } = require('../models');
      const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId)
      ]);
      if (user && (['Instructor', 'Admin', 'Superadmin'].includes(user.accountType) || (course && String(course.instructorId) === String(userId)))) {
        return { allowed: true, reason: 'Instructor/Admin Access', plan: 'admin', isFreeVideo: true };
      }
    } catch (err) {
      // Continue to enrollment check if user/course lookup fails
    }

    const enrollment = await this.getUserCourseEnrollment(userId, courseId);
    const plan = enrollment ? enrollment.plan : 'none';

    // Active enrollment checks
    if (enrollment && enrollment.status === 'active') {
      const normPlan = (enrollment.plan || '').toLowerCase();
      if (['gold', 'pro'].includes(normPlan)) {
        return { allowed: true, reason: `${enrollment.plan} plan active`, plan: normPlan, isFreeVideo };
      }
      if (['silver', 'plus', 'basic'].includes(normPlan)) {
        if (!enrollment.expiresAt || new Date(enrollment.expiresAt) > new Date()) {
          return { allowed: true, reason: `${enrollment.plan} plan active`, plan: normPlan, isFreeVideo };
        }
      }
    }

    // Free Plan or Unenrolled user (first 2 videos)
    if (isFreeVideo) {
      return { allowed: true, reason: 'Free video (positions 1-2)', plan: enrollment ? enrollment.plan : 'free', isFreeVideo: true };
    }

    return {
      allowed: false,
      reason: 'Upgrade your subscription or course plan to unlock remaining lectures',
      plan,
      isFreeVideo: false
    };
  }

  /**
   * Helper to calculate 1-indexed video position in a course based on section and subsection ordering.
   * @param {number} courseId 
   * @param {number} subSectionId 
   * @returns {Promise<number>}
   */
  static async getVideoPositionInCourse(courseId, subSectionId) {
    const sections = await Section.findAll({
      where: { courseId },
      include: [{ model: SubSection, as: 'subSections' }],
      order: [
        ['id', 'ASC'],
        [{ model: SubSection, as: 'subSections' }, 'id', 'ASC']
      ]
    });

    let position = 0;
    for (const sec of sections) {
      const subSections = sec.subSections || [];
      for (const sub of subSections) {
        position++;
        if (String(sub.id) === String(subSectionId)) {
          return position;
        }
      }
    }
    return 0;
  }

  /**
   * Process Silver Plan expirations in batch (Cron job helper).
   * @returns {Promise<number>} Number of expired enrollments updated
   */
  static async expireSilverPlans() {
    const [affectedRows] = await Enrollment.update(
      { status: 'expired' },
      {
        where: {
          plan: PLAN_TYPES.SILVER,
          status: 'active',
          expiresAt: {
            [Op.lte]: new Date()
          }
        }
      }
    );
    return affectedRows;
  }
}

module.exports = AccessControlService;
