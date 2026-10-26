import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import { toast } from "react-hot-toast";

const { SITE_CONFIG_API } = endpoints;

export const fetchSiteConfig = async (key) => {
  let result = null;
  try {
    const response = await apiConnector("GET", `${SITE_CONFIG_API}/${key}`);
    if (!response?.data?.success) {
      throw new Error("Could not fetch site config.");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log(`SITE_CONFIG_API ERROR for ${key}............`, error);
  }
  return result;
};
