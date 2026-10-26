import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetCart } from '../../../services/slices/cartSlice';
import { createServerOrder, verifyServerPayment } from '../services/checkoutService';

export const useCheckout = (overrideCourses = null) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { cart } = useSelector((state) => state.cart);

  // Selected courses for checkout: override if direct buy, else cart items
  const coursesToCheckout = overrideCourses && Array.isArray(overrideCourses) && overrideCourses.length > 0
    ? overrideCourses
    : cart;

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stripeModal, setStripeModal] = useState({
    isOpen: false,
    paymentData: null
  });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    status: 'idle', // 'success' | 'failed' | 'cancelled'
    message: ''
  });

  // Prefill customer details if user profile exists
  useEffect(() => {
    if (user) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '';
      const phoneNum = user.additionalDetails?.contactNumber || user.contactNumber || user.phone || '';
      setCustomerDetails({
        name: fullName,
        phone: phoneNum
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    const trimmedName = customerDetails.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Please enter a valid name';
    }

    const trimmedPhone = customerDetails.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[0-9+\s-]{7,15}$/.test(trimmedPhone)) {
      newErrors.phone = 'Please enter a valid mobile number (7-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Called when user clicks "Continue to Payment" in the confirmation modal.
   * NEVER marks as paid, NEVER enrolls, NEVER clears cart, NEVER redirects immediately.
   */
  const initiatePayment = async (plan = 'gold', couponCode = null) => {
    if (!token) {
      toast.error('Please log in to continue with purchase');
      navigate('/login');
      return;
    }

    if (coursesToCheckout.length === 0) {
      toast.error('No courses selected for checkout');
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initializing Stripe payment...');

    try {
      // 1. Create Server-Side Order & Payment Intent
      const res = await createServerOrder({
        token,
        courses: coursesToCheckout,
        plan,
        couponCode,
        customerDetails
      });

      toast.dismiss(toastId);

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create payment order');
      }

      // Handle Free Plan / 100% coupon discount direct activation
      if (res.isFree) {
        dispatch(resetCart());
        setStatusModal({
          isOpen: true,
          status: 'success',
          message: 'Free access activated successfully! Enjoy learning.'
        });
        setLoading(false);
        return;
      }

      // Redirect directly to official Stripe Checkout hosted URL
      if (res.data?.url) {
        toast.success('Redirecting to official Stripe Checkout...');
        window.location.href = res.data.url;
        return;
      }

      // Fallback for modal if clientSecret is provided
      const paymentInfo = res.data || {};
      setStripeModal({
        isOpen: true,
        paymentData: {
          ...paymentInfo,
          customerDetails
        }
      });
      setLoading(false);

    } catch (error) {
      toast.dismiss(toastId);
      console.error('ORDER CREATION ERROR:', error);
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.message || 'Could not process order creation';
      toast.error(errorMsg);
    }
  };

  /**
   * Called when user completes payment in the Stripe Payment Modal.
   * Calls server-side verification before granting course access or clearing cart.
   */
  const handleStripePaymentSuccess = async (paymentResult) => {
    const { paymentIntentId, sessionId, courses, plan, offerId } = paymentResult;
    const verifyToastId = toast.loading('Verifying payment with server...');
    setLoading(true);

    try {
      const verifyRes = await verifyServerPayment({
        token,
        verificationPayload: {
          paymentIntentId,
          sessionId,
          courses: courses || coursesToCheckout.map((c) => c._id || c.id),
          plan,
          offerId
        }
      });

      toast.dismiss(verifyToastId);
      if (verifyRes?.success) {
        // ONLY NOW: clear cart, close stripe modal, show success modal
        dispatch(resetCart());
        setStripeModal({ isOpen: false, paymentData: null });
        setStatusModal({
          isOpen: true,
          status: 'success',
          message: 'Payment verified successfully! Your course has been activated.'
        });
      } else {
        throw new Error(verifyRes?.message || 'Payment verification failed');
      }
    } catch (verifyError) {
      toast.dismiss(verifyToastId);
      console.error('PAYMENT VERIFICATION ERROR:', verifyError);
      setStripeModal({ isOpen: false, paymentData: null });
      setStatusModal({
        isOpen: true,
        status: 'failed',
        message: verifyError.message || 'Payment verification failed. Access not granted.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripePaymentFailure = (errorMsg) => {
    setStripeModal({ isOpen: false, paymentData: null });
    setStatusModal({
      isOpen: true,
      status: 'failed',
      message: errorMsg || 'Your payment attempt failed. Please try again.'
    });
  };

  const handleStripePaymentCancel = () => {
    setStripeModal({ isOpen: false, paymentData: null });
    setStatusModal({
      isOpen: true,
      status: 'cancelled',
      message: 'Payment process was cancelled. Course remains in your cart.'
    });
  };

  return {
    customerDetails,
    errors,
    loading,
    stripeModal,
    setStripeModal,
    statusModal,
    setStatusModal,
    handleInputChange,
    initiatePayment,
    handleStripePaymentSuccess,
    handleStripePaymentFailure,
    handleStripePaymentCancel,
    coursesToCheckout
  };
};

export default useCheckout;
