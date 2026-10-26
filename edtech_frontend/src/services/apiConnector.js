import axios from "axios";

export const axiosInstance = axios.create({});
const inFlightGetRequests = new Map();

const getRequestKey = (config) => JSON.stringify({
    url: config.url,
    baseURL: config.baseURL,
    params: config.params || null,
    authorization: config.headers?.Authorization || config.headers?.authorization || null,
});

let redirectingToLogin = false;

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not redirect to login for unauthenticated public requests or oauth profile checks
        const requestUrl = error.config?.url || '';
        const requestAuthorization = error.config?.headers?.Authorization || error.config?.headers?.authorization || '';
        const requestToken = requestAuthorization.replace(/^Bearer\s+/i, '');
        const activeToken = localStorage.getItem('token');
        const isPublicRoute = requestUrl.includes('/reach/contact') ||
                              requestUrl.includes('/login') ||
                              requestUrl.includes('/signup') ||
                              requestUrl.includes('/auth/reset-password') ||
                              requestUrl.includes('/auth/google_oauth2') ||
                              requestUrl.includes('/auth/github') ||
                              error.config?.skipAuthRedirect;

        if (error.response?.status === 401 && !isPublicRoute && activeToken && requestToken === activeToken && !redirectingToLogin) {
            console.log("Session expired or user deleted. Redirecting to login...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            if (window.location.pathname !== '/login') {
                redirectingToLogin = true;
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params, extraConfig = {}) => {
    const { dedupe = true, ...axiosConfig } = extraConfig;
    const config = {
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
        ...axiosConfig
    };

    if (config.method.toUpperCase() !== 'GET' || !dedupe || config.signal) {
        return axiosInstance(config);
    }

    const requestKey = getRequestKey(config);
    const existingRequest = inFlightGetRequests.get(requestKey);
    if (existingRequest) return existingRequest;

    const request = axiosInstance(config);
    inFlightGetRequests.set(requestKey, request);
    request.then(
        () => inFlightGetRequests.delete(requestKey),
        () => inFlightGetRequests.delete(requestKey)
    );
    return request;
}
