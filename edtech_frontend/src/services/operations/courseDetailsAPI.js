import { toast } from "react-hot-toast"

import { updateCompletedLectures } from "../../services/slices/viewCourseSlice"
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { courseEndpoints, ratingsEndpoints } from "../apis"

const {
  COURSE_DETAILS_API,
  COURSE_CATEGORIES_API,
  GET_ALL_COURSE_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  UPDATE_LECTURE_DURATION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
} = courseEndpoints

export const getAllCourses = async (page, limit, category, search, sortBy) => {
  let result = {
    data: [],
    totalCourses: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12
  }
  try {
    const params = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    if (category) params.category = category
    if (search) params.search = search
    if (sortBy) params.sortBy = sortBy

    const response = await apiConnector("GET", GET_ALL_COURSE_API, null, null, params)
    if (response?.data?.success) {
      const coursesList = Array.isArray(response.data.data) ? response.data.data : []
      result = {
        data: coursesList,
        totalCourses: response.data.totalCourses || coursesList.length,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        limit: response.data.limit || coursesList.length
      }
    }
  } catch (error) {
    console.log("GET_ALL_COURSE_API API ERROR............", error)
  }
  return result
}

export const fetchCourseDetails = async (courseId) => {
  const toastId = toast.loading("Loading...")
  //   dispatch(setLoading(true));
  let result = null
  try {
    const response = await apiConnector("POST", COURSE_DETAILS_API, {
      courseId,
    })
    console.log("COURSE_DETAILS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("COURSE_DETAILS_API API ERROR............", error)
    result = error.response.data
    // toast.error(error.response.data.message);
  }
  toast.dismiss(toastId)
  //   dispatch(setLoading(false));
  return result
}

// fetching total count of categories (Ultra fast count query)
export const fetchCategoriesCount = async () => {
  try {
    // The category list endpoint already returns totalCategories. Reuse it
    // instead of calling the removed /categories/count endpoint.
    const response = await apiConnector("GET", COURSE_CATEGORIES_API, null, null, { page: 1, limit: 1 })
    if (response?.data?.success) {
      return response.data.totalCategories || 0
    }
  } catch (error) {
    console.log("FETCH_CATEGORIES_COUNT_API ERROR............", error)
  }
  return 0
}

// fetching the available course categories (with pagination support)
export const fetchCourseCategories = async (page, limit, search) => {
  let result = []
  try {
    const params = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    if (search) params.search = search

    const response = await apiConnector("GET", COURSE_CATEGORIES_API, null, null, params)
    console.log("COURSE_CATEGORIES_API API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories")
    }
    const dataArr = Array.isArray(response?.data?.data) ? response.data.data : []
    result = [...dataArr]
    result.totalCategories = response.data.totalCategories || dataArr.length
    result.totalPages = response.data.totalPages || 1
    result.currentPage = response.data.currentPage || 1
    result.limit = response.data.limit || dataArr.length
  } catch (error) {
    console.log("COURSE_CATEGORY_API API ERROR............", error)
    if (!error.message?.includes('Network Error')) {
      toast.error(error.response?.data?.message || error.message || "Could not fetch course categories")
    }
  }
  return result
}

// add the course details
export const addCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Course Details")
    }
    toast.success("Course Details Added Successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE COURSE API ERROR............", error)
    const errorMessage = error.response?.data?.message || error.message
    toast.error(errorMessage)
  }
  toast.dismiss(toastId)
  return result
}

// edit the course details
export const editCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("EDIT COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Course Details")
    }
    toast.success("Course Details Updated Successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error)
    const errorMessage = error.response?.data?.message || error.message
    toast.error(errorMessage)
  }
  toast.dismiss(toastId)
  return result
}

// create a section
export const createSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Create Section")
    }
    toast.success("Course Section Created")
    result = response?.data?.updatedCourse || response?.data?.data
  } catch (error) {
    console.log("CREATE SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}

// create a subsection
export const createSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Lecture")
    }
    toast.success("Lecture Added")
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE SUB-SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}

// update a section
export const updateSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Section")
    }
    toast.success("Course Section Updated")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}

// update a subsection
export const updateSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Lecture")
    }
    toast.success("Lecture Updated")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE SUB-SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}

// delete a section
export const deleteSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Section")
    }
    toast.success("Course Section Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}
// delete a subsection
export const deleteSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Lecture")
    }
    toast.success("Lecture Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error)
    const msg = error.response?.data?.message || error.message;
    toast.error(msg)
  }
  toast.dismiss(toastId)
  return result
}

// fetching all courses under a specific instructor
export const fetchInstructorCourses = async (token) => {
  let result = []
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTOR_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("INSTRUCTOR COURSES API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor Courses")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// delete a course
export const deleteCourse = async (data, token) => {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Course")
    }
    toast.success("Course Deleted")
  } catch (error) {
    console.log("DELETE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
}

// get full details of a course
export const getFullDetailsOfCourse = async (courseId, token) => {
  const toastId = toast.loading("Loading...")
  //   dispatch(setLoading(true));
  let result = null
  try {
    const response = await apiConnector(
      "POST",
      GET_FULL_COURSE_DETAILS_AUTHENTICATED,
      {
        courseId,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("COURSE_FULL_DETAILS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response?.data?.data
  } catch (error) {
    console.log("COURSE_FULL_DETAILS_API API ERROR............", error)
    result = error.response?.data || null
    // toast.error(error.response.data.message);
  }
  toast.dismiss(toastId)
  //   dispatch(setLoading(false));
  return result
}

// mark a lecture as complete
export const markLectureAsComplete = async (data, token) => {
  let result = null
  console.log("mark complete data", data)
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log(
      "MARK_LECTURE_AS_COMPLETE_API API RESPONSE............",
      response
    )

    if (!response.data.message) {
      throw new Error(response.data.error)
    }
    toast.success("Lecture Completed")
    result = true
  } catch (error) {
    console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error)
    toast.error(error.message)
    result = false
  }
  toast.dismiss(toastId)
  return result
}

// create a rating for course
export const createRating = async (data, token) => {
  const toastId = toast.loading("Loading...")
  let success = false
  try {
    const response = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE RATING API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Create Rating")
    }
    toast.success("Rating Saved Successfully")
    success = true
  } catch (error) {
    success = false
    console.log("CREATE RATING API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return success
}

export const fetchCourseReviews = async (courseId) => {
  try {
    const response = await apiConnector("GET", `${ratingsEndpoints.REVIEWS_DETAILS_API}?courseId=${courseId}`)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Reviews")
    }
    return response?.data?.data || []
  } catch (error) {
    console.log("FETCH COURSE REVIEWS ERROR............", error)
    return []
  }
}

export const fetchAllReviews = async () => {
  try {
    const response = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API)
    if (response?.data?.success) {
      return response?.data?.data || []
    }
  } catch (error) {
    console.log("FETCH ALL REVIEWS ERROR............", error)
  }
  return []
}

export const postCommentAPI = async (data, token) => {
  let result = null
  try {
    const response = await apiConnector("POST", courseEndpoints.POST_COMMENT_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error("Could Not Post Comment")
    }
    toast.success("Comment posted")
    result = response?.data?.data
  } catch (error) {
    console.log("POST COMMENT API ERROR............", error)
    toast.error("Failed to post comment")
  }
  return result
}

export const fetchCourseComments = async (courseId) => {
  try {
    const response = await apiConnector("GET", `${courseEndpoints.GET_COMMENTS_API}?courseId=${courseId}`)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Comments")
    }
    return response?.data?.data || []
  } catch (error) {
    console.log("FETCH COURSE COMMENTS ERROR............", error)
    return []
  }
}

export const deleteCommentAPI = async (commentId, token) => {
  let success = false
  try {
    const response = await apiConnector(
      "DELETE",
      `${courseEndpoints.DELETE_COMMENT_API}?commentId=${commentId}`,
      { commentId },
      { Authorization: `Bearer ${token}` }
    )
    if (response?.data?.success) {
      toast.success("Comment deleted")
      success = true
    } else {
      throw new Error(response?.data?.message || "Could Not Delete Comment")
    }
  } catch (error) {
    console.log("DELETE COMMENT API ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to delete comment")
  }
  return success
}
export const updateLectureDuration = async (data, token) => {
  let result = null
  try {
    const response = await apiConnector("POST", UPDATE_LECTURE_DURATION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE_LECTURE_DURATION_API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Lecture Duration")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE_LECTURE_DURATION_API ERROR............", error)
  }
  return result
}

export const updateCoursePricingDetails = async (courseId, pricingData, token) => {
  const toastId = toast.loading("Updating pricing...")
  let result = null
  try {
    const response = await apiConnector(
      "PATCH",
      `${courseEndpoints.UPDATE_COURSE_PRICING_API}/${courseId}/pricing`,
      pricingData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update pricing")
    }
    toast.success("Course pricing updated successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE_COURSE_PRICING_API ERROR...", error)
    toast.error(error.response?.data?.message || error.message)
  }
  toast.dismiss(toastId)
  return result
}

export const fetchCourseCertificate = async (courseId, token) => {
  let result = null
  try {
    const response = await apiConnector("GET", `${courseEndpoints.GET_CERTIFICATE_API}?courseId=${courseId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (response?.data?.success) {
      result = response.data.data
    } else {
      result = {
        isLocked: true,
        progressPercentage: response?.data?.progressPercentage || 0,
        message: response?.data?.message || "Course incomplete"
      }
    }
  } catch (error) {
    console.log("FETCH COURSE CERTIFICATE ERROR............", error)
    if (error.response?.data) {
      result = {
        isLocked: true,
        progressPercentage: error.response.data.progressPercentage || 0,
        message: error.response.data.message || "Course incomplete"
      }
    }
  }
  return result
}

export const verifyCertificateAPI = async (certificateId) => {
  try {
    const response = await apiConnector("GET", `${courseEndpoints.VERIFY_CERTIFICATE_API}/${certificateId}`)
    return response?.data
  } catch (error) {
    console.log("VERIFY CERTIFICATE API ERROR............", error)
    return { success: false, isValid: false, message: error.response?.data?.message || "Invalid certificate" }
  }
}

export const getHomePageStats = async () => {
  try {
    const response = await apiConnector("GET", courseEndpoints.GET_HOMEPAGE_STATS_API)
    if (response?.data?.success) {
      return response.data.data
    }
  } catch (error) {
    console.log("GET HOMEPAGE STATS API ERROR............", error)
  }
  return null
}

