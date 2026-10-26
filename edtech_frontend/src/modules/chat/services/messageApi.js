import { apiConnector } from '../../../services/apiConnector';
import { BASE_URL } from '../../../services/apis';

const API_BASE = BASE_URL || 'http://localhost:5000';

export async function fetchMessages(conversationId, params = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'GET',
    `${API_BASE}/api/conversations/${conversationId}/messages`,
    null,
    headers,
    params
  );
  return response.data;
}

export async function sendMessage(conversationId, messageData, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'POST',
    `${API_BASE}/api/conversations/${conversationId}/messages`,
    messageData,
    headers
  );
  return response.data;
}

export async function markConversationRead(conversationId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'PATCH',
    `${API_BASE}/api/conversations/${conversationId}/read`,
    {},
    headers
  );
  return response.data;
}

export async function deleteMessage(messageId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiConnector(
    'DELETE',
    `${API_BASE}/api/messages/${messageId}`,
    null,
    headers
  );
  return response.data;
}

export async function uploadAttachment(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Content-Type': 'multipart/form-data',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await apiConnector(
    'POST',
    `${API_BASE}/api/attachments`,
    formData,
    headers
  );
  return response.data;
}
