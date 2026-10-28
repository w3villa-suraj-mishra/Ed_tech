const { Op } = require('sequelize');
const {
  LiveClass,
  LiveClassAttendance,
  Course,
  Enrollment,
  User,
  Profile
} = require('../models');
const liveVideoService = require('../services/liveVideoService');
const { notificationService, socketService } = require('../services/notificationService');
const logger = require('../utils/logger');

const isAdminUser = (user) => ['Admin', 'Superadmin'].includes(user?.accountType);

const parseInteger = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const handleControllerError = (res, error, label) => {
  logger.error(`[${label} ERROR]:`, error.message);
  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
};

const emitClassEvent = (eventName, data, userIds = []) => {
  const io = socketService.getIO();
  if (!io) return;
  [...new Set(userIds.filter(Boolean))].forEach((userId) => io.to(`user:${userId}`).emit(eventName, data));
};

const getEligibleStudents = (courseId, now = new Date()) => Enrollment.findAll({
  where: {
    courseId,
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

// ==========================================
// 1. SCHEDULE LIVE CLASS
// ==========================================
const scheduleLiveClass = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      agenda,
      scheduledStartAt,
      scheduledEndAt,
      durationMinutes,
      timezone,
      meetingBanner,
      materialsUrl
    } = req.body;

    if (!courseId || !title || !scheduledStartAt) {
      return res.status(400).json({
        success: false,
        message: 'Course, title, and scheduled start time are required'
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isOwner = String(course.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor or an administrator can schedule classes'
      });
    }

    const start = new Date(scheduledStartAt);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start time format' });
    }

    const now = new Date();
    if (start < new Date(now.getTime() - 2 * 60 * 1000)) {
      return res.status(400).json({ success: false, message: 'Cannot schedule a class in the past' });
    }

    const duration = parseInteger(durationMinutes, 60);
    if (duration < 10 || duration > 480) {
      return res.status(400).json({ success: false, message: 'Duration must be between 10 and 480 minutes' });
    }

    let end;
    if (scheduledEndAt) {
      end = new Date(scheduledEndAt);
      if (Number.isNaN(end.getTime()) || end <= start) {
        return res.status(400).json({ success: false, message: 'End time must be after start time' });
      }
    } else {
      end = new Date(start.getTime() + duration * 60 * 1000);
    }

    // Check for overlapping classes for this instructor
    const overlapping = await LiveClass.findOne({
      where: {
        instructorId: req.user.id,
        status: { [Op.in]: ['scheduled', 'live'] },
        [Op.or]: [
          {
            scheduledStartAt: { [Op.lt]: end },
            scheduledEndAt: { [Op.gt]: start }
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `You already have another live class "${overlapping.title}" scheduled between ${overlapping.scheduledStartAt} and ${overlapping.scheduledEndAt}`
      });
    }

    // Create room allocation
    const room = await liveVideoService.createRoom({ id: Date.now() });

    const newClass = await LiveClass.create({
      courseId,
      instructorId: req.user.id,
      title: String(title).trim(),
      description: description || null,
      agenda: agenda || null,
      scheduledStartAt: start,
      scheduledEndAt: end,
      durationMinutes: duration,
      timezone: timezone || 'Asia/Kolkata',
      meetingBanner: meetingBanner || null,
      materialsUrl: materialsUrl || null,
      status: 'scheduled',
      provider: room.provider,
      providerRoomId: room.providerRoomId,
      remindersSent: []
    });

    // Notify all active enrolled students
    const enrollments = await getEligibleStudents(courseId, now);

    const instructorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Instructor';

    for (const enrollment of enrollments) {
      await notificationService.create({
        userId: enrollment.userId,
        type: 'LIVE_CLASS_SCHEDULED',
        source: 'INSTRUCTOR',
        title: `New Live Class: ${newClass.title}`,
        message: `A new live class "${newClass.title}" has been scheduled for "${course.courseName}" by ${instructorName}.`,
        link: `/dashboard/live-classes`,
        entityType: 'LIVE_CLASS',
        entityId: newClass.id,
        metadata: {
          classId: newClass.id,
          courseId,
          scheduledStartAt: newClass.scheduledStartAt
        }
      });
    }

    emitClassEvent('liveClass:scheduled', {
      class: newClass,
      courseId
    }, enrollments.map((enrollment) => enrollment.userId));

    const populated = await LiveClass.findByPk(newClass.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'thumbnail'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image'] }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      data: populated
    });
  } catch (error) {
    return handleControllerError(res, error, 'SCHEDULE LIVE CLASS');
  }
};

// ==========================================
// 2. INSTRUCTOR LIVE CLASSES
// ==========================================
const getInstructorLiveClasses = async (req, res) => {
  try {
    const where = isAdminUser(req.user) ? {} : { instructorId: req.user.id };

    if (req.query.courseId) {
      where.courseId = parseInteger(req.query.courseId);
    }
    if (req.query.status) {
      where.status = req.query.status;
    }

    const classes = await LiveClass.findAll({
      where,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'thumbnail'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image'] },
        { model: LiveClassAttendance, as: 'attendances', attributes: ['id', 'attendanceStatus'] }
      ],
      order: [['scheduledStartAt', 'ASC']]
    });

    const data = classes.map((c) => {
      const json = c.toJSON();
      const attendances = json.attendances || [];
      return {
        ...json,
        totalAttendees: attendances.length,
        presentAttendees: attendances.filter((a) => a.attendanceStatus === 'present').length
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleControllerError(res, error, 'GET INSTRUCTOR LIVE CLASSES');
  }
};

// ==========================================
// 3. STUDENT LIVE CLASSES
// ==========================================
const getStudentLiveClasses = async (req, res) => {
  try {
    const now = new Date();
    const enrollments = await Enrollment.findAll({
      where: {
        userId: req.user.id,
        status: 'active',
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }]
      },
      attributes: ['courseId'],
      raw: true
    });

    const courseIds = [...new Set(enrollments.map((e) => e.courseId))];

    if (courseIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const classes = await LiveClass.findAll({
      where: {
        courseId: { [Op.in]: courseIds },
        status: { [Op.in]: ['scheduled', 'live', 'completed', 'cancelled'] }
      },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'thumbnail'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image'] },
        {
          model: LiveClassAttendance,
          as: 'attendances',
          where: { studentId: req.user.id },
          required: false
        }
      ],
      order: [['scheduledStartAt', 'ASC']]
    });

    const data = classes.map((c) => {
      const json = c.toJSON();
      const myAttendance = json.attendances?.[0] || null;
      delete json.attendances;
      return {
        ...json,
        myAttendance
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleControllerError(res, error, 'GET STUDENT LIVE CLASSES');
  }
};

// ==========================================
// 4. COURSE LIVE CLASSES
// ==========================================
const getCourseLiveClasses = async (req, res) => {
  try {
    const courseId = parseInteger(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isOwner = String(course.instructorId) === String(req.user.id);
    const canManage = isOwner || isAdminUser(req.user);

    if (!canManage) {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId,
          status: 'active',
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
        }
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Live classes are available only to enrolled students'
        });
      }
    }

    const classes = await LiveClass.findAll({
      where: { courseId },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'thumbnail'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image'] }
      ],
      order: [['scheduledStartAt', 'ASC']]
    });

    return res.status(200).json({ success: true, data: classes });
  } catch (error) {
    return handleControllerError(res, error, 'GET COURSE LIVE CLASSES');
  }
};

// ==========================================
// 5. GET CLASS DETAILS
// ==========================================
const getLiveClassDetails = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'thumbnail', 'instructorId'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image', 'email'] }
      ]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    const canManage = isOwner || isAdminUser(req.user);

    if (!canManage) {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: liveClass.courseId,
          status: 'active',
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
        }
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Live classes are accessible only to enrolled students'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...liveClass.toJSON(),
        isHost: canManage
      }
    });
  } catch (error) {
    return handleControllerError(res, error, 'GET LIVE CLASS DETAILS');
  }
};

// ==========================================
// 6. UPDATE / RESCHEDULE LIVE CLASS
// ==========================================
const updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this class' });
    }

    if (['completed', 'cancelled'].includes(liveClass.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a ${liveClass.status} live class`
      });
    }

    const updates = {};
    if (req.body.title) updates.title = String(req.body.title).trim();
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.agenda !== undefined) updates.agenda = req.body.agenda;
    if (req.body.materialsUrl !== undefined) updates.materialsUrl = req.body.materialsUrl;
    if (req.body.meetingBanner !== undefined) updates.meetingBanner = req.body.meetingBanner;
    if (req.body.timezone) updates.timezone = req.body.timezone;

    let isRescheduled = false;

    if (req.body.scheduledStartAt) {
      const newStart = new Date(req.body.scheduledStartAt);
      if (Number.isNaN(newStart.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid start time' });
      }
      if (newStart < new Date(Date.now() - 2 * 60 * 1000)) {
        return res.status(400).json({ success: false, message: 'Cannot reschedule into the past' });
      }

      const duration = parseInteger(req.body.durationMinutes, liveClass.durationMinutes || 60);
      updates.durationMinutes = duration;
      updates.scheduledStartAt = newStart;
      updates.scheduledEndAt = req.body.scheduledEndAt
        ? new Date(req.body.scheduledEndAt)
        : new Date(newStart.getTime() + duration * 60 * 1000);
      if (Number.isNaN(updates.scheduledEndAt.getTime()) || updates.scheduledEndAt <= newStart) {
        return res.status(400).json({ success: false, message: 'End time must be after start time' });
      }

      updates.remindersSent = []; // Reset reminders for new schedule
      isRescheduled = true;
    }

    await liveClass.update(updates);

    if (isRescheduled) {
      const enrollments = await getEligibleStudents(liveClass.courseId);

      for (const enrollment of enrollments) {
        await notificationService.create({
          userId: enrollment.userId,
          type: 'LIVE_CLASS_RESCHEDULED',
          source: 'INSTRUCTOR',
          title: `Rescheduled: ${liveClass.title}`,
          message: `The live class "${liveClass.title}" has been rescheduled to ${new Date(liveClass.scheduledStartAt).toLocaleString()}.`,
          link: `/dashboard/live-classes`,
          entityType: 'LIVE_CLASS',
          entityId: liveClass.id,
          metadata: { classId: liveClass.id, newStartTime: liveClass.scheduledStartAt }
        });
      }
    }

    emitClassEvent('liveClass:updated', { class: liveClass }, [liveClass.instructorId]);

    const updated = await LiveClass.findByPk(liveClass.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'courseName'] },
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'image'] }
      ]
    });

    return res.status(200).json({
      success: true,
      message: isRescheduled ? 'Class rescheduled successfully' : 'Class updated successfully',
      data: updated
    });
  } catch (error) {
    return handleControllerError(res, error, 'UPDATE LIVE CLASS');
  }
};

// ==========================================
// 7. CANCEL LIVE CLASS
// ==========================================
const cancelLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this class' });
    }

    if (liveClass.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed class' });
    }

    const cancellationReason = req.body.cancellationReason || 'Cancelled by instructor';

    await liveClass.update({
      status: 'cancelled',
      cancellationReason
    });

    const enrollments = await getEligibleStudents(liveClass.courseId);

    for (const enrollment of enrollments) {
      await notificationService.create({
        userId: enrollment.userId,
        type: 'LIVE_CLASS_CANCELLED',
        source: 'INSTRUCTOR',
        title: `Cancelled: ${liveClass.title}`,
        message: `The live class "${liveClass.title}" scheduled for ${new Date(liveClass.scheduledStartAt).toLocaleString()} was cancelled. Reason: ${cancellationReason}`,
        link: `/dashboard/live-classes`,
        entityType: 'LIVE_CLASS',
        entityId: liveClass.id,
        metadata: { classId: liveClass.id, cancellationReason }
      });
    }

    emitClassEvent('liveClass:cancelled', { classId: liveClass.id, cancellationReason }, enrollments.map((enrollment) => enrollment.userId));

    return res.status(200).json({
      success: true,
      message: 'Live class cancelled successfully',
      data: liveClass
    });
  } catch (error) {
    return handleControllerError(res, error, 'CANCEL LIVE CLASS');
  }
};

// ==========================================
// 8. START LIVE CLASS
// ==========================================
const startLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Only the host instructor can start this class' });
    }

    if (liveClass.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This class has already ended' });
    }
    if (liveClass.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot start a cancelled class' });
    }
    if (liveClass.status === 'live') {
      const accessData = await liveVideoService.generateAccessToken(liveClass, req.user, 'host');
      return res.status(200).json({ success: true, message: 'Live session is already active', data: { liveClass, ...accessData } });
    }

    const now = new Date();
    await liveClass.update({
      status: 'live',
      startedAt: liveClass.startedAt || now
    });

    // Generate Host Access Token
    const accessData = await liveVideoService.generateAccessToken(liveClass, req.user, 'host');

    // Notify enrolled students that class is now LIVE
    const enrollments = await getEligibleStudents(liveClass.courseId);

    const instructorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Instructor';

    for (const enrollment of enrollments) {
      await notificationService.create({
        userId: enrollment.userId,
        type: 'LIVE_CLASS_STARTED',
        source: 'INSTRUCTOR',
        title: `🔴 Live Now: ${liveClass.title}`,
        message: `${instructorName} has started the live session for "${liveClass.course?.courseName || 'Course'}". Join now!`,
        link: `/live/${liveClass.id}`,
        entityType: 'LIVE_CLASS',
        entityId: liveClass.id,
        metadata: { classId: liveClass.id }
      });
    }

    emitClassEvent('liveClass:started', { class: liveClass }, enrollments.map((enrollment) => enrollment.userId));

    return res.status(200).json({
      success: true,
      message: 'Live session started',
      data: {
        liveClass,
        ...accessData
      }
    });
  } catch (error) {
    return handleControllerError(res, error, 'START LIVE CLASS');
  }
};

// ==========================================
// 9. END LIVE CLASS
// ==========================================
const endLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Only the host instructor can end this session' });
    }
    if (liveClass.status !== 'live') {
      return res.status(400).json({ success: false, message: 'Only an active live class can be ended' });
    }

    const now = new Date();
    await liveClass.update({
      status: 'completed',
      endedAt: now
    });

    // Finalize open attendances
    const openAttendances = await LiveClassAttendance.findAll({
      where: { liveClassId: liveClass.id, lastLeftAt: null }
    });

    const thresholdPercent = Number(process.env.LIVE_CLASS_ATTENDANCE_THRESHOLD) || 50;
    const classDurationSeconds = (liveClass.durationMinutes || 60) * 60;
    const requiredSeconds = Math.floor(classDurationSeconds * (thresholdPercent / 100));

    for (const att of openAttendances) {
      const addedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(att.firstJoinedAt).getTime()) / 1000));
      const total = (att.totalAttendedSeconds || 0) + addedSeconds;
      const status = total >= requiredSeconds ? 'present' : 'partially_attended';
      await att.update({
        lastLeftAt: now,
        totalAttendedSeconds: total,
        attendanceStatus: status
      });
    }

    emitClassEvent('liveClass:ended', { classId: liveClass.id }, [liveClass.instructorId]);

    return res.status(200).json({
      success: true,
      message: 'Live session ended successfully',
      data: liveClass
    });
  } catch (error) {
    return handleControllerError(res, error, 'END LIVE CLASS');
  }
};

// ==========================================
// 10. JOIN LIVE CLASS
// ==========================================
const joinLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    const isHost = isOwner || isAdminUser(req.user);

    if (!isHost) {
      // Validate enrollment
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: liveClass.courseId,
          status: 'active',
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be actively enrolled in this course to join the live session'
        });
      }

      if (liveClass.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'This class has been cancelled' });
      }

      if (liveClass.status === 'completed') {
        return res.status(400).json({ success: false, message: 'This class has already ended' });
      }

      // Check joining window: allowed if live, or within 15 minutes before scheduled start
      const now = new Date();
      const startMs = new Date(liveClass.scheduledStartAt).getTime();
      const fifteenMinsBefore = startMs - 15 * 60 * 1000;

      if (liveClass.status !== 'live' && now.getTime() < fifteenMinsBefore) {
        return res.status(400).json({
          success: false,
          notReady: true,
          scheduledStartAt: liveClass.scheduledStartAt,
          message: 'Joining opens 15 minutes prior to class scheduled start time'
        });
      }

      // Initialize or retrieve attendance record
      let attendance = await LiveClassAttendance.findOne({
        where: { liveClassId: liveClass.id, studentId: req.user.id }
      });

      if (!attendance) {
        attendance = await LiveClassAttendance.create({
          liveClassId: liveClass.id,
          studentId: req.user.id,
          firstJoinedAt: now,
          lastLeftAt: null,
          totalAttendedSeconds: 0,
          attendanceStatus: 'partially_attended',
          joinHistory: [{ joinedAt: now.toISOString() }]
        });
      }
    }

    const role = isHost ? 'host' : 'participant';
    const accessData = await liveVideoService.generateAccessToken(liveClass, req.user, role);

    return res.status(200).json({
      success: true,
      message: 'Joined live class room successfully',
      data: {
        liveClass,
        isHost,
        ...accessData
      }
    });
  } catch (error) {
    return handleControllerError(res, error, 'JOIN LIVE CLASS');
  }
};

// ==========================================
// 11. RECORD LEAVE LIVE CLASS
// ==========================================
const leaveLiveClass = async (req, res) => {
  try {
    const classId = parseInteger(req.params.id);
    const attendance = await LiveClassAttendance.findOne({
      where: { liveClassId: classId, studentId: req.user.id }
    });

    if (attendance) {
      const now = new Date();
      await attendance.update({ lastLeftAt: now });
    }

    return res.status(200).json({ success: true, message: 'Leave recorded' });
  } catch (error) {
    return handleControllerError(res, error, 'LEAVE LIVE CLASS');
  }
};

// ==========================================
// 12. GET ATTENDANCE REPORT
// ==========================================
const getAttendanceReport = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const isOwner = String(liveClass.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Only course instructor or admin can view attendance' });
    }

    const attendances = await LiveClassAttendance.findAll({
      where: { liveClassId: liveClass.id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email', 'image'],
          include: [{ model: Profile, as: 'profile', attributes: ['contactNumber'] }]
        }
      ],
      order: [['firstJoinedAt', 'ASC']]
    });

    const enrolledStudentsCount = await Enrollment.count({
      where: { courseId: liveClass.courseId, status: 'active' }
    });

    const totalDurationSeconds = (liveClass.durationMinutes || 60) * 60;

    const studentRecords = attendances.map((att) => {
      const attendedMinutes = Math.round((att.totalAttendedSeconds || 0) / 60);
      const attendancePercentage = Math.min(100, Math.round(((att.totalAttendedSeconds || 0) / totalDurationSeconds) * 100));

      return {
        id: att.id,
        studentId: att.studentId,
        student: att.student,
        firstJoinedAt: att.firstJoinedAt,
        lastLeftAt: att.lastLeftAt,
        totalAttendedSeconds: att.totalAttendedSeconds,
        attendedMinutes,
        attendancePercentage,
        attendanceStatus: att.attendanceStatus,
        joinHistory: att.joinHistory || []
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        class: liveClass,
        summary: {
          enrolledCount: enrolledStudentsCount,
          attendedCount: studentRecords.length,
          presentCount: studentRecords.filter((r) => r.attendanceStatus === 'present').length,
          partiallyAttendedCount: studentRecords.filter((r) => r.attendanceStatus === 'partially_attended').length,
          attendanceRate: enrolledStudentsCount > 0 ? Math.round((studentRecords.length / enrolledStudentsCount) * 100) : 0
        },
        records: studentRecords
      }
    });
  } catch (error) {
    return handleControllerError(res, error, 'GET LIVE CLASS ATTENDANCE REPORT');
  }
};

module.exports = {
  scheduleLiveClass,
  getInstructorLiveClasses,
  getStudentLiveClasses,
  getCourseLiveClasses,
  getLiveClassDetails,
  updateLiveClass,
  cancelLiveClass,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  leaveLiveClass,
  getAttendanceReport
};
