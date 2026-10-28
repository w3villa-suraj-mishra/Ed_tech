const liveVideoService = require('./liveVideoService');
const { LiveClass, LiveClassAttendance, User, Profile } = require('../models');
const logger = require('../utils/logger');

// Store active room participants in memory: roomId -> Map(socketId -> participantData)
const activeRoomParticipants = new Map();

const initLiveClassSocket = (io) => {
  if (!io) return;

  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentClassId = null;
    let currentUserData = null;

    // 1. Join Classroom
    socket.on('liveClass:join-room', async ({ classId, token }, callback) => {
      try {
        if (!classId || !token) {
          if (callback) callback({ success: false, message: 'Class ID and Token are required' });
          return;
        }

        const decoded = liveVideoService.verifyRoomToken(token);
        if (!decoded || String(decoded.classId) !== String(classId)) {
          if (callback) callback({ success: false, message: 'Invalid or expired classroom token' });
          return;
        }

        currentClassId = Number(classId);
        currentRoomId = `liveClass:${currentClassId}`;

        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'image', 'accountType']
        });

        currentUserData = {
          socketId: socket.id,
          userId: decoded.userId,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || decoded.name || `User ${decoded.userId}`,
          email: user?.email || decoded.email,
          image: user?.image || decoded.image || null,
          role: decoded.role || 'participant',
          joinedAt: new Date().toISOString()
        };

        socket.join(currentRoomId);

        if (!activeRoomParticipants.has(currentRoomId)) {
          activeRoomParticipants.set(currentRoomId, new Map());
        }

        const roomMap = activeRoomParticipants.get(currentRoomId);
        roomMap.set(socket.id, currentUserData);

        const allParticipants = Array.from(roomMap.values());

        // Notify other room members
        socket.to(currentRoomId).emit('liveClass:participantJoined', {
          participant: currentUserData,
          participantsCount: allParticipants.length
        });

        logger.info(`[SOCKET LIVE CLASS] ${currentUserData.name} (${currentUserData.role}) joined ${currentRoomId}`);

        if (callback) {
          callback({
            success: true,
            participant: currentUserData,
            participants: allParticipants
          });
        }
      } catch (err) {
        logger.error('[SOCKET LIVE CLASS JOIN ERROR]:', err.message);
        if (callback) callback({ success: false, message: 'Failed to join classroom' });
      }
    });

    // 2. WebRTC Peer-to-Peer Signaling (Relay Offer / Answer / ICE Candidates)
    socket.on('webrtc:signal', ({ targetSocketId, signalType, data }) => {
      if (!currentRoomId || !targetSocketId) return;
      io.to(targetSocketId).emit('webrtc:signal', {
        fromSocketId: socket.id,
        fromUser: currentUserData,
        signalType,
        data
      });
    });

    // 3. In-Classroom Chat Messaging
    socket.on('liveClass:send-chat', ({ message }) => {
      if (!currentRoomId || !currentUserData || !message || !String(message).trim()) return;

      const chatPayload = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        classId: currentClassId,
        user: {
          id: currentUserData.userId,
          name: currentUserData.name,
          role: currentUserData.role,
          image: currentUserData.image
        },
        message: String(message).trim(),
        timestamp: new Date().toISOString()
      };

      io.to(currentRoomId).emit('liveClass:chat-message', chatPayload);
    });

    // 4. Host Actions (Mute Participant)
    socket.on('liveClass:mute-participant', ({ targetSocketId }) => {
      if (!currentUserData || currentUserData.role !== 'host') return;
      io.to(targetSocketId).emit('liveClass:force-mute');
    });

    // 5. Host Action (End Session For All)
    socket.on('liveClass:end-session-for-all', () => {
      if (!currentUserData || currentUserData.role !== 'host' || !currentRoomId) return;
      io.to(currentRoomId).emit('liveClass:session-ended-by-host');
    });

    // 6. Handle Leave & Disconnect
    const handleLeave = async () => {
      if (!currentRoomId || !currentUserData) return;

      const roomMap = activeRoomParticipants.get(currentRoomId);
      if (roomMap) {
        roomMap.delete(socket.id);
        const remainingCount = roomMap.size;
        if (remainingCount === 0) {
          activeRoomParticipants.delete(currentRoomId);
        } else {
          socket.to(currentRoomId).emit('liveClass:participantLeft', {
            socketId: socket.id,
            userId: currentUserData.userId,
            participantsCount: remainingCount
          });
        }
      }

      // Record leave time and calculate attended duration for students
      if (currentUserData.role === 'participant') {
        try {
          const attendance = await LiveClassAttendance.findOne({
            where: { liveClassId: currentClassId, studentId: currentUserData.userId }
          });

          if (attendance) {
            const now = new Date();
            const sessionJoinedAt = new Date(currentUserData.joinedAt);
            const additionalSeconds = Math.max(0, Math.floor((now.getTime() - sessionJoinedAt.getTime()) / 1000));
            const newTotalSeconds = (attendance.totalAttendedSeconds || 0) + additionalSeconds;

            const liveClass = await LiveClass.findByPk(currentClassId);
            const classDurationSeconds = (liveClass?.durationMinutes || 60) * 60;
            const thresholdPercent = Number(process.env.LIVE_CLASS_ATTENDANCE_THRESHOLD) || 50;
            const requiredSeconds = Math.floor(classDurationSeconds * (thresholdPercent / 100));

            let attendanceStatus = 'partially_attended';
            if (newTotalSeconds >= requiredSeconds) {
              attendanceStatus = 'present';
            }

            const history = Array.isArray(attendance.joinHistory) ? [...attendance.joinHistory] : [];
            history.push({
              joinedAt: currentUserData.joinedAt,
              leftAt: now.toISOString(),
              durationSeconds: additionalSeconds
            });

            await attendance.update({
              lastLeftAt: now,
              totalAttendedSeconds: newTotalSeconds,
              attendanceStatus,
              joinHistory: history
            });
          }
        } catch (attErr) {
          logger.error('[ATTENDANCE AUTO-UPDATE ERROR]:', attErr.message);
        }
      }

      socket.leave(currentRoomId);
      currentRoomId = null;
      currentClassId = null;
      currentUserData = null;
    };

    socket.on('liveClass:leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};

module.exports = {
  initLiveClassSocket,
  activeRoomParticipants
};
