const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Pluggable Video Provider Abstraction
 * Supports:
 * 1. Default Native WebRTC (with Socket.IO signaling & JWT room authorization)
 * 2. Optional LiveKit Cloud (when LIVEKIT_API_KEY and LIVEKIT_API_SECRET are present)
 */

class LiveVideoService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'liveClassSecretTokenFallbackKey12345';
  }

  /**
   * Determine current active provider
   */
  getProvider() {
    if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
      return 'livekit';
    }
    return 'webrtc';
  }

  /**
   * Initialize or allocate room ID for a scheduled class
   */
  async createRoom(liveClass) {
    const roomId = `edtech-class-${liveClass.id}-${uuidv4().slice(0, 8)}`;
    const provider = this.getProvider();

    logger.info(`[LIVE VIDEO SERVICE] Created room ${roomId} for class ${liveClass.id} using provider: ${provider}`);
    return {
      provider,
      providerRoomId: roomId
    };
  }

  /**
   * Generate an authorized, short-lived room token
   * @param {Object} liveClass 
   * @param {Object} user 
   * @param {('host'|'participant')} role 
   */
  async generateAccessToken(liveClass, user, role = 'participant') {
    const roomId = liveClass.providerRoomId || `edtech-class-${liveClass.id}`;
    const provider = liveClass.provider || this.getProvider();
    const isHost = role === 'host';

    // 1. If LiveKit is explicitly configured
    if (provider === 'livekit' && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
      try {
        const { AccessToken } = require('livekit-server-sdk');
        const token = new AccessToken(
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
          {
            identity: String(user.id),
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${user.id}`,
            ttl: '3h'
          }
        );

        token.addGrant({
          room: roomId,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          roomAdmin: isHost
        });

        return {
          provider: 'livekit',
          roomId,
          token: token.toJwt(),
          serverUrl: process.env.LIVEKIT_URL || ''
        };
      } catch (err) {
        logger.warn('[LIVE VIDEO SERVICE] LiveKit token generation fallback to WebRTC:', err.message);
      }
    }

    // 2. Default WebRTC Provider with cryptographically signed Room Token
    const payload = {
      sub: String(user.id),
      userId: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${user.id}`,
      email: user.email,
      image: user.image || null,
      classId: liveClass.id,
      courseId: liveClass.courseId,
      roomId,
      role,
      permissions: {
        canPublishCamera: true,
        canPublishMicrophone: true,
        canScreenShare: isHost,
        canMuteOthers: isHost,
        canEndClass: isHost
      }
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '4h' });

    return {
      provider: 'webrtc',
      roomId,
      token,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  /**
   * Verify room token
   */
  verifyRoomToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch {
      return null;
    }
  }
}

module.exports = new LiveVideoService();
