import { apiConnector } from '../../../services/apiConnector';
import { studentEndpoints } from '../../../services/apis';

const { COURSE_PAYMENT_API, COURSE_VERIFY_API } = studentEndpoints;

export const createServerOrder = async ({ token, courses, plan = 'gold', couponCode = null, customerDetails }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : null;
  const courseIds = courses.map((c) => (typeof c === 'object' ? c._id || c.id : c));

  const response = await apiConnector(
    'POST',
    COURSE_PAYMENT_API,
    {
      courses: courseIds,
      plan,
      couponCode,
      paymentGateway: 'stripe',
      customerDetails
    },
    headers
  );

  return response?.data;
};

export const verifyServerPayment = async ({ token, verificationPayload }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : null;

  const response = await apiConnector(
    'POST',
    COURSE_VERIFY_API,
    verificationPayload,
    headers
  );

  return response?.data;
};
