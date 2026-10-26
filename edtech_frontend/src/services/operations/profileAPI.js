import { toast } from "react-hot-toast"

import { setLoading } from "../../services/slices/authSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"
import { setUser } from "../../services/slices/profileSlice"

const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API ,GET_INSTRUCTOR_DATA_API} = profileEndpoints

export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${token}`,
      })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const rawData = response.data.data;
      const account_type = rawData.accountType || rawData.account_type || "Student";
      const first_name = rawData.firstName || rawData.first_name || "";
      const last_name = rawData.lastName || rawData.last_name || "";

      const userImage = rawData.image
        ? rawData.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${first_name} ${last_name}`
      
      const userData = { 
        ...rawData, 
        account_type, 
        accountType: account_type,
        first_name,
        last_name,
        image: userImage 
      }
      localStorage.setItem("user", JSON.stringify(userData))
      dispatch(setUser(userData))
    } catch (error) {
      console.log("GET_USER_DETAILS API ERROR............", error)
      if (error.response?.status === 401) {
        dispatch(logout(navigate))
      }
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export async function getUserEnrolledCourses(token) {
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (response?.data?.success) {
      result = response.data.data
    }
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
  }
  return result
}


export async function getInstructorData(token){
  let result = null

  try{
    const response = await apiConnector("GET",
      GET_INSTRUCTOR_DATA_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    result = response?.data || null
  }
  catch(error){
    console.log("GET_INSTRUCTOR_API ERROR............", error)
  }
  return result
}