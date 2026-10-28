process.env.JWT_SECRET = 'live-class-test-secret';
const liveVideoService = require('../services/liveVideoService');

describe('live video access tokens', () => {
  it('creates a room-scoped, short-lived participant token', async () => {
    const token = await liveVideoService.generateAccessToken(
      { id: 42, courseId: 7, provider: 'webrtc', providerRoomId: 'room-42' },
      { id: 9, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' }
    );

    const payload = liveVideoService.verifyRoomToken(token.token);
    expect(payload).toMatchObject({ classId: 42, courseId: 7, roomId: 'room-42', role: 'participant' });
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(4 * 60 * 60);
  });
});
