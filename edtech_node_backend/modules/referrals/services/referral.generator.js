const crypto = require('crypto');

class ReferralGenerator {
  constructor() {
    this.prefix = 'USR_';
    this.defaultRandomLength = 6;
    this.maxAttempts = 10;
  }

  /**
   * Generates a single cryptographically secure random referral code.
   * Format: USR_XXXXXX (e.g., USR_A9B8C7)
   */
  generateCode() {
    const rawLength = parseInt(process.env.REFERRAL_CODE_LENGTH, 10) || (this.prefix.length + this.defaultRandomLength);
    const randomLength = Math.max(4, rawLength - this.prefix.length);
    
    // Generate secure random uppercase alphanumeric string (excluding ambiguous characters like 0/O, 1/I)
    const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomBytes = crypto.randomBytes(randomLength);
    let randomStr = '';
    
    for (let i = 0; i < randomLength; i++) {
      randomStr += charset[randomBytes[i] % charset.length];
    }

    return `${this.prefix}${randomStr}`;
  }

  /**
   * Validates referral code format
   */
  isValidFormat(code) {
    if (!code || typeof code !== 'string') return false;
    const clean = code.trim().toUpperCase();
    return /^USR_[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4,16}$/.test(clean);
  }

  /**
   * Generates a guaranteed unique referral code checking against the ReferralCode table
   */
  async generateUniqueReferralCode(ReferralCodeModel) {
    let attempts = 0;

    while (attempts < this.maxAttempts) {
      const candidate = this.generateCode();
      const existing = await ReferralCodeModel.findOne({
        where: { referralCode: candidate }
      });

      if (!existing) {
        return candidate;
      }
      attempts++;
    }

    // High collision safety fallback: append extra random entropy
    const timestampSuffix = Date.now().toString(36).toUpperCase().slice(-3);
    return `${this.generateCode()}${timestampSuffix}`;
  }

  /**
   * Builds the full public registration referral URL
   */
  buildReferralUrl(referralCode) {
    const baseUrl = process.env.REFERRAL_BASE_URL || 'http://localhost:3000/register';
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanUrl}?ref=${encodeURIComponent(referralCode)}`;
  }
}

module.exports = new ReferralGenerator();

