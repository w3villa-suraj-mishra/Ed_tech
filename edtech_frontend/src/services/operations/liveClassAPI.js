import { apiConnector } from "../apiConnector";
import { liveClassEndpoints } from "../apis";

const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const getLiveClasses = (role, token) => apiConnector(
  "GET", role === "Instructor" ? liveClassEndpoints.INSTRUCTOR : liveClassEndpoints.STUDENT, null, auth(token)
);
export const getLiveClass = (id, token) => apiConnector("GET", `${liveClassEndpoints.BASE}/${id}`, null, auth(token));
export const createLiveClass = (data, token) => apiConnector("POST", liveClassEndpoints.BASE, data, auth(token));
export const updateLiveClass = (id, data, token) => apiConnector("PATCH", `${liveClassEndpoints.BASE}/${id}`, data, auth(token));
export const cancelLiveClass = (id, data, token) => apiConnector("POST", `${liveClassEndpoints.BASE}/${id}/cancel`, data, auth(token));
export const startLiveClass = (id, token) => apiConnector("POST", `${liveClassEndpoints.BASE}/${id}/start`, null, auth(token));
export const endLiveClass = (id, token) => apiConnector("POST", `${liveClassEndpoints.BASE}/${id}/end`, null, auth(token));
export const joinLiveClass = (id, token) => apiConnector("POST", `${liveClassEndpoints.BASE}/${id}/join`, null, auth(token));
export const getLiveClassAttendance = (id, token) => apiConnector("GET", `${liveClassEndpoints.BASE}/${id}/attendance`, null, auth(token));
