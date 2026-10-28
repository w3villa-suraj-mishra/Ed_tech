const { Op } = require('sequelize');
const { LiveClass, Course, Enrollment, User } = require('../models');
const { notificationService } = require('./notificationService');
const logger = require('../utils/logger');

let schedulerInterval = null;

const REMINDER_WINDOWS = [
  { tag: '24h', minutesBefore: 24 * 60, toleranceMinutes: 30, label: '24 hours' },
  { tag: '1h', minutesBefore: 60, toleranceMinutes: 15, label: '1 hour' },
  { tag: '10m', minutesBefore: 10, toleranceMinutes: 8, label: '10 minutes' }
];

const checkAndSendClassReminders = async () => {
  try {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 25 * 60 * 60 * 1000); // next 25 hours

    const upcomingClasses = await LiveClass.findAll({
      where: {
        status: 'scheduled',
        scheduledStartAt: {
          [Op.gte]: now,
          [Op.lte]: futureLimit
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName']
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    for (const liveClass of upcomingClasses) {
      const diffMs = new Date(liveClass.scheduledStartAt).getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const sentReminders = Array.isArray(liveClass.remindersSent) ? [...liveClass.remindersSent] : [];
      let updatedReminders = false;

      for (const window of REMINDER_WINDOWS) {
        if (!sentReminders.includes(window.tag)) {
          // Check if class start time falls within this reminder window
          if (diffMinutes <= window.minutesBefore && diffMinutes >= (window.minutesBefore - window.toleranceMinutes)) {
            // Find enrolled students
            const enrollments = await Enrollment.findAll({
              where: {
                courseId: liveClass.courseId,
                status: 'active',
                [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }]
              },
              include: [{
                model: User,
                as: 'user',
                where: { accountType: 'Student' },
                attributes: []
              }],
              attributes: ['userId']
            });

            const instructorName = `${liveClass.instructor?.firstName || ''} ${liveClass.instructor?.lastName || ''}`.trim() || 'Instructor';
            const courseName = liveClass.course?.courseName || 'Course';

            for (const enrollment of enrollments) {
              await notificationService.create({
                userId: enrollment.userId,
                type: 'LIVE_CLASS_REMINDER',
                source: 'SYSTEM',
                title: `Live Class Reminder: ${liveClass.title}`,
                message: `Your live class "${liveClass.title}" for ${courseName} starts in ${window.label}. Instructor: ${instructorName}.`,
                link: `/dashboard/live-classes`,
                entityType: 'LIVE_CLASS',
                entityId: liveClass.id,
                metadata: {
                  classId: liveClass.id,
                  courseId: liveClass.courseId,
                  scheduledStartAt: liveClass.scheduledStartAt,
                  reminderTag: window.tag
                }
              });
            }

            sentReminders.push(window.tag);
            updatedReminders = true;
            logger.info(`[LIVE CLASS REMINDER] Sent ${window.tag} reminder for class "${liveClass.title}" to ${enrollments.length} student(s)`);
          }
        }
      }

      if (updatedReminders) {
        await liveClass.update({ remindersSent: sentReminders });
      }
    }
  } catch (error) {
    logger.error('[LIVE CLASS REMINDER ERROR]:', error.message);
  }
};

const startLiveClassScheduler = () => {
  if (schedulerInterval) return;
  // Run once immediately after 5s startup delay
  setTimeout(() => {
    checkAndSendClassReminders().catch(() => {});
  }, 5000);

  // Then run every 60 seconds
  schedulerInterval = setInterval(() => {
    checkAndSendClassReminders().catch(() => {});
  }, 60000);

  logger.info('Live Class reminder background scheduler initialized.');
};

module.exports = {
  checkAndSendClassReminders,
  startLiveClassScheduler
};
