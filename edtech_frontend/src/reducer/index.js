import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../services/slices/authSlice";
import cartReducer from "../services/slices/cartSlice";
import courseReducer from "../services/slices/courseSlice";
import profileReducer from "../services/slices/profileSlice";
import viewCourseReducer from "../services/slices/viewCourseSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  course: courseReducer,
  profile: profileReducer,
  viewCourse: viewCourseReducer,
});

export default rootReducer;
