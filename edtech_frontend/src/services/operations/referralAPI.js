import { apiConnector } from "../apiConnector";
import { referralEndpoints } from "../apis";

const authHeaders = (token) => {
  const effectiveToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
  return effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};
};

export const getReferralProfileAPI = async (token) => {
  const response = await apiConnector("GET", referralEndpoints.PROFILE_API, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load referral profile");
  return response.data.data;
};

export const getReferralNetworkAPI = async (token) => {
  const response = await apiConnector("GET", referralEndpoints.NETWORK_API, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load referral network");
  return response.data.data;
};

export const getReferralHistoryAPI = async (token, page = 1, limit = 10) => {
  const response = await apiConnector(
    "GET",
    `${referralEndpoints.HISTORY_API}?page=${page}&limit=${limit}`,
    null,
    authHeaders(token)
  );
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load referral history");
  return response.data.data;
};

export const getRewardSummaryAPI = async (token) => {
  const response = await apiConnector("GET", referralEndpoints.REWARDS_SUMMARY_API, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load reward summary");
  return response.data.data;
};

export const getRewardHistoryAPI = async (token, page = 1, limit = 10, status = null) => {
  const query = status ? `&status=${encodeURIComponent(status)}` : "";
  const response = await apiConnector(
    "GET",
    `${referralEndpoints.REWARDS_HISTORY_API}?page=${page}&limit=${limit}${query}`,
    null,
    authHeaders(token)
  );
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load reward history");
  return response.data.data;
};

export const getWalletTransactionsAPI = async (token, page = 1, limit = 10, type = null) => {
  const query = type ? `&type=${encodeURIComponent(type)}` : "";
  const response = await apiConnector(
    "GET",
    `${referralEndpoints.WALLET_TRANSACTIONS_API}?page=${page}&limit=${limit}${query}`,
    null,
    authHeaders(token)
  );
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load wallet transactions");
  return response.data.data;
};

export const getWalletBalanceAPI = async (token) => {
  const response = await apiConnector(
    "GET",
    referralEndpoints.WALLET_BALANCE_API,
    null,
    authHeaders(token)
  );
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load wallet balance");
  return response.data.data;
};

export const applyWalletCreditAPI = async (token, courseAmountRupees) => {
  const response = await apiConnector(
    "POST",
    referralEndpoints.APPLY_CREDIT_API,
    { courseAmountRupees },
    authHeaders(token)
  );
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to apply credits");
  return response.data.data;
};

export const claimReferralCodeAPI = async (code, token = null) => {
  const response = await apiConnector("POST", referralEndpoints.CLAIM_CODE_API, { code }, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Invalid referral code");
  return response.data.data;
};

export const generateReferralLinkAPI = async (token) => {
  const response = await apiConnector("POST", referralEndpoints.GENERATE_LINK_API, {}, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to generate referral link");
  return response.data.data;
};

export const validateReferralCodeAPI = async (code, token = null) => {
  const response = await apiConnector("POST", referralEndpoints.VALIDATE_CODE_API, { code }, authHeaders(token));
  return response?.data;
};

export const captureAttributionAPI = async (payload) => {
  try {
    const response = await apiConnector("POST", referralEndpoints.ATTRIBUTION_CAPTURE_API, payload);
    return response.data;
  } catch (err) {
    console.warn("Attribution capture error:", err.message);
    return null;
  }
};

// Admin Endpoints
export const getAdminReferralOverviewAPI = async (token) => {
  const response = await apiConnector("GET", referralEndpoints.ADMIN_OVERVIEW_API, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load admin overview");
  return response.data.data;
};

export const getAdminReferralNetworkAPI = async (token, queryParam) => {
  const response = await apiConnector("GET", `${referralEndpoints.ADMIN_NETWORK_API}?${queryParam}`, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load network");
  return response.data.data;
};

export const getAdminReferralRewardsAPI = async (token, query = "") => {
  const response = await apiConnector("GET", `${referralEndpoints.ADMIN_REWARDS_API}?${query}`, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load rewards");
  return response.data.data;
};

export const getAdminReferralRulesAPI = async (token) => {
  const response = await apiConnector("GET", referralEndpoints.ADMIN_RULES_API, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load rules");
  return response.data.data;
};

export const updateAdminReferralRulesAPI = async (token, rules) => {
  const response = await apiConnector("PUT", referralEndpoints.ADMIN_RULES_API, { rules }, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to update rules");
  return response.data.data;
};

export const getAdminReferralTransactionsAPI = async (token, query = "") => {
  const response = await apiConnector("GET", `${referralEndpoints.ADMIN_TRANSACTIONS_API}?${query}`, null, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to load transactions");
  return response.data.data;
};

export const adminWalletOverrideAPI = async (token, payload) => {
  const response = await apiConnector("POST", referralEndpoints.ADMIN_OVERRIDE_API, payload, authHeaders(token));
  if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to override wallet");
  return response.data.data;
};
