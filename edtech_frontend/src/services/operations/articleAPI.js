import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { articleEndpoints } from "../apis";

const {
  GET_ALL_ARTICLES_API,
  GET_ADMIN_ARTICLES_API,
  CREATE_ARTICLE_API,
  UPDATE_ARTICLE_API,
  DELETE_ARTICLE_API,
} = articleEndpoints;

export async function getAllArticles() {
  let result = [];
  try {
    const response = await apiConnector("GET", GET_ALL_ARTICLES_API);
    if (response?.data?.success) {
      result = response.data.data;
    }
  } catch (error) {
    console.error("GET_ALL_ARTICLES_API ERROR:", error);
  }
  return result;
}

export async function getAdminArticles(token) {
  let result = [];
  const authToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
  try {
    const response = await apiConnector("GET", GET_ADMIN_ARTICLES_API, null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (response?.data?.success) {
      result = response.data.data;
    }
  } catch (error) {
    console.error("GET_ADMIN_ARTICLES_API ERROR:", error);
  }
  return result;
}

export async function createArticle(articleData, token) {
  const toastId = toast.loading("Creating article...");
  let success = false;
  const authToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
  try {
    const response = await apiConnector("POST", CREATE_ARTICLE_API, articleData, {
      Authorization: `Bearer ${authToken}`,
    });
    if (response?.data?.success) {
      toast.success("Article published successfully!");
      success = true;
    }
  } catch (error) {
    console.error("CREATE_ARTICLE_API ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to publish article");
  }
  toast.dismiss(toastId);
  return success;
}

export async function updateArticle(articleId, articleData, token) {
  const toastId = toast.loading("Updating article...");
  let success = false;
  const authToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_ARTICLE_API}/${articleId}`,
      articleData,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    if (response?.data?.success) {
      toast.success("Article updated successfully!");
      success = true;
    }
  } catch (error) {
    console.error("UPDATE_ARTICLE_API ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to update article");
  }
  toast.dismiss(toastId);
  return success;
}

export async function deleteArticle(articleId, token) {
  const toastId = toast.loading("Deleting article...");
  let success = false;
  const authToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_ARTICLE_API}/${articleId}`,
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    if (response?.data?.success) {
      toast.success("Article deleted successfully!");
      success = true;
    }
  } catch (error) {
    console.error("DELETE_ARTICLE_API ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to delete article");
  }
  toast.dismiss(toastId);
  return success;
}
