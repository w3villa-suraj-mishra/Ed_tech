import { apiConnector } from '../../../services/apiConnector';
import { BASE_URL } from '../../../services/apis';

const API_BASE = BASE_URL || 'http://localhost:5000';

export async function createOrGetConversation(data = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('POST', `${API_BASE}/api/conversations`, data, headers);
  return response.data;
}

export async function fetchUserConversations(params = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('GET', `${API_BASE}/api/conversations`, null, headers, params);
  return response.data;
}

export async function fetchConversationDetails(conversationId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('GET', `${API_BASE}/api/conversations/${conversationId}`, null, headers);
  return response.data;
}

export async function archiveConversation(conversationId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('DELETE', `${API_BASE}/api/conversations/${conversationId}`, null, headers);
  return response.data;
}

export async function fetchAdminConversations(params = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('GET', `${API_BASE}/api/admin/conversations`, null, headers, params);
  return response.data;
}

export async function assignConversation(conversationId, assignedTo, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'PATCH',
    `${API_BASE}/api/admin/conversations/${conversationId}/assign`,
    { assignedTo },
    headers
  );
  return response.data;
}

export async function updateConversationStatus(conversationId, status, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'PATCH',
    `${API_BASE}/api/admin/conversations/${conversationId}/status`,
    { status },
    headers
  );
  return response.data;
}

export async function fetchAdminsList(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector('GET', `${API_BASE}/api/admin/conversations/admins-list`, null, headers);
  return response.data;
}
