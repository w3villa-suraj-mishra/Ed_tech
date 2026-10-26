import { addToCart, removeFromCart, resetCart } from '../../../services/slices/cartSlice';
import toast from 'react-hot-toast';

export const isCourseInCart = (cart, courseId) => {
  if (!cart || !Array.isArray(cart)) return false;
  const targetId = String(courseId);
  return cart.some((item) => String(item._id || item.id) === targetId);
};

export const isCoursePurchasedByUser = (userEnrolledCourses, courseId) => {
  if (!userEnrolledCourses || !Array.isArray(userEnrolledCourses)) return false;
  const targetId = String(courseId);
  return userEnrolledCourses.some((c) => String(c._id || c.id || c.courseId) === targetId);
};

export const handleAddCourseToCart = (course, dispatch, cart = [], userEnrolledCourses = []) => {
  if (!course) return false;
  const courseId = String(course._id || course.id);

  // Check if course is already purchased
  if (isCoursePurchasedByUser(userEnrolledCourses, courseId)) {
    toast.error('You have already purchased this course!');
    return false;
  }

  // Check if course is already in cart
  if (isCourseInCart(cart, courseId)) {
    toast.error('Course is already in your cart!');
    return false;
  }

  dispatch(addToCart(course));
  toast.success('Course added to cart!');
  return true;
};

export const handleRemoveCourseFromCart = (courseId, dispatch) => {
  dispatch(removeFromCart(courseId));
  toast.success('Course removed from cart');
};

export const handleClearCart = (dispatch) => {
  dispatch(resetCart());
};
