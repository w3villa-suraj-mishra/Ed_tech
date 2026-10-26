import { useSelector, useDispatch } from 'react-redux';
import {
  handleAddCourseToCart,
  handleRemoveCourseFromCart,
  handleClearCart,
  isCourseInCart,
  isCoursePurchasedByUser
} from '../services/cartService';

export const useCart = (userEnrolledCourses = []) => {
  const dispatch = useDispatch();
  const { cart, total, totalItems } = useSelector((state) => state.cart);

  const subtotal = cart.reduce((acc, item) => {
    const origPrice = Number(item?.pricing?.originalPrice || item?.originalPrice || item?.price || 0);
    return acc + origPrice;
  }, 0);

  const finalTotal = cart.reduce((acc, item) => {
    const price = Number(item?.pricing?.finalPrice || item?.price || 0);
    return acc + price;
  }, 0);

  const totalDiscount = subtotal > finalTotal ? subtotal - finalTotal : 0;

  const addItem = (course) => handleAddCourseToCart(course, dispatch, cart, userEnrolledCourses);
  const removeItem = (courseId) => handleRemoveCourseFromCart(courseId, dispatch);
  const clear = () => handleClearCart(dispatch);

  const checkInCart = (courseId) => isCourseInCart(cart, courseId);
  const checkPurchased = (courseId) => isCoursePurchasedByUser(userEnrolledCourses, courseId);

  return {
    cart,
    totalItems,
    subtotal,
    finalTotal,
    totalDiscount,
    addItem,
    removeItem,
    clear,
    checkInCart,
    checkPurchased
  };
};

export default useCart;
