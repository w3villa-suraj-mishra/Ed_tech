import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../services/slices/courseSlice";
import { resetCart } from "../../services/slices/cartSlice";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API } = studentEndpoints;

export async function buyCourse(token, courses, userDetails, navigate, dispatch, plan = 'gold', couponCode = null) {
    if (!token) {
        toast.error("Please login to purchase courses");
        if (navigate) navigate("/login");
        return;
    }

    if (navigate) {
        navigate("/checkout", { state: { directCourse: courses && courses[0] } });
    }
}

export async function verifyPayment(sessionId, courses, token, navigate, dispatch, plan = 'gold', offerId = null) {
    const toastId = toast.loading("Verifying Payment....");
    if (typeof dispatch === 'function') {
        dispatch(setPaymentLoading(true));
    }
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
        const response = await apiConnector(
            "POST",
            COURSE_VERIFY_API,
            { sessionId, courses, plan, offerId },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Payment verification failed");
        }

        toast.success("Payment Successful! You are enrolled in the course.");
        if (typeof dispatch === 'function') {
            dispatch(resetCart());
        }
    } catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        const errMsg = error.response?.data?.message || error.message || "Could not verify payment";
        toast.error(errMsg);
    } finally {
        toast.dismiss(toastId);
        if (typeof dispatch === 'function') {
            dispatch(setPaymentLoading(false));
        }
    }
}