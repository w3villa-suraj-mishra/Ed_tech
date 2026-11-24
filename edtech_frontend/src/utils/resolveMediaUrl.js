export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://res.cloudinary.com")) return url.replace("http://", "https://");
  if (/^https?:\/\//.test(url)) return url;
  // strip a trailing /api or /api/v1 so /uploads/... hits the server root
  const base = (process.env.REACT_APP_BASE_URL || "http://localhost:5000")
    .replace(/\/+$/, "")
    .replace(/\/api(\/v\d+)?$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};
