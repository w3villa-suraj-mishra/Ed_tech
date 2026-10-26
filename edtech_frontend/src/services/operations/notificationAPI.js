import { apiConnector } from "../apiConnector";
import { notificationEndpoints } from "../apis";
import toast from "react-hot-toast";

const {
  GET_NOTIFICATIONS_API,
  GET_UNREAD_COUNT_API,
  MARK_READ_API,
  MARK_ALL_READ_API,
  DELETE_NOTIFICATION_API,
  PREFERENCES_API,
  ADMIN_CREATE_NOTIFICATION_API
} = notificationEndpoints;

export const fetchNotificationsAPI = async (token, page = 1, limit = 20) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_NOTIFICATIONS_API}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      return response.data.data;
    }
    return { notifications: [], unreadCount: 0 };
  } catch (error) {
    console.error("FETCH NOTIFICATIONS ERROR:", error);
    return { notifications: [], unreadCount: 0 };
  }
};

export const fetchUnreadCountAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_UNREAD_COUNT_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response?.data?.unreadCount || 0;
  } catch (error) {
    console.error("FETCH UNREAD COUNT ERROR:", error);
    return 0;
  }
};

export const markNotificationReadAPI = async (id, token) => {
  try {
    const response = await apiConnector(
      "PATCH",
      `${MARK_READ_API}/${id}/read`,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response?.data?.success || false;
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return false;
  }
};

export const markAllNotificationsReadAPI = async (token) => {
  try {
    const response = await apiConnector(
      "PATCH",
      MARK_ALL_READ_API,
      {},
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      toast.success("All notifications marked as read");
      return true;
    }
    return false;
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return false;
  }
};

export const deleteNotificationAPI = async (id, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_NOTIFICATION_API}/${id}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response?.data?.success || false;
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return false;
  }
};

export const fetchNotificationPreferencesAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      PREFERENCES_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response?.data?.data || null;
  } catch (error) {
    console.error("FETCH PREFERENCES ERROR:", error);
    return null;
  }
};

export const updateNotificationPreferencesAPI = async (prefs, token) => {
  try {
    const response = await apiConnector(
      "PATCH",
      PREFERENCES_API,
      prefs,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      toast.success("Notification settings updated");
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("UPDATE PREFERENCES ERROR:", error);
    toast.error("Failed to update preferences");
    return null;
  }
};

export const createAdminNotificationAPI = async (data, token) => {
  try {
    const response = await apiConnector(
      "POST",
      ADMIN_CREATE_NOTIFICATION_API,
      data,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      toast.success(response.data.message || "Notification sent successfully");
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("CREATE ADMIN NOTIFICATION ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to send notification");
    return null;
  }
};
