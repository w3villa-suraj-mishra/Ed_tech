import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../services/slices/authSlice";
import { setUser } from "../services/slices/profileSlice";
import { apiConnector } from "../services/apiConnector";
import { profileEndpoints } from "../services/apis";
import toast from "react-hot-toast";

const getOAuthUser = (token, role) => {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(window.atob(base64), (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    const first_name = payload.first_name || "";
    const last_name = payload.last_name || "";

    return {
      id: payload.user_id,
      email: payload.email || "",
      accountType: payload.account_type || role || "Student",
      account_type: payload.account_type || role || "Student",
      firstName: first_name,
      lastName: last_name,
      first_name,
      last_name,
      image: payload.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${first_name}${last_name}`)}`
    };
  } catch (error) {
    console.error("Could not read OAuth user data from token", error);
    return null;
  }
};

function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handledOAuth = useRef(false);

  useEffect(() => {
    if (handledOAuth.current) return;
    handledOAuth.current = true;

    const handleOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const role = params.get("role");

      if (token) {
        const userObj = getOAuthUser(token, role);
        if (!userObj) {
          toast.error("Could not complete social sign in. Please try again.");
          navigate("/login", { replace: true });
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userObj));
        dispatch(setToken(token));
        dispatch(setUser(userObj));

        // Complete navigation immediately; enrich the local user in the
        // background so profile details remain available without delaying login.
        apiConnector(
          "GET",
          profileEndpoints.GET_USER_DETAILS_API,
          null,
          { Authorization: `Bearer ${token}` },
          null,
          { skipAuthRedirect: true }
        ).then((response) => {
          const rawUser = response?.data?.data;
          if (!rawUser) return;
          const first_name = rawUser.firstName || rawUser.first_name || userObj.first_name;
          const last_name = rawUser.lastName || rawUser.last_name || userObj.last_name;
          const enrichedUser = {
            ...userObj,
            ...rawUser,
            accountType: rawUser.accountType || rawUser.account_type || userObj.accountType,
            account_type: rawUser.accountType || rawUser.account_type || userObj.accountType,
            firstName: first_name,
            lastName: last_name,
            first_name,
            last_name,
            image: rawUser.image || userObj.image
          };
          localStorage.setItem("user", JSON.stringify(enrichedUser));
          dispatch(setUser(enrichedUser));
        }).catch((error) => {
          console.log("OAuth profile enrichment failed", error);
        });

        toast.success("Logged in successfully!");

        const normalizedRole = String(userObj.accountType || userObj.account_type || "").toLowerCase();

        let targetDashboard = "/dashboard/my-profile";
        if (normalizedRole === "admin") {
          targetDashboard = "/admin/dashboard";
        } else if (normalizedRole === "instructor") {
          targetDashboard = "/dashboard/instructor";
        } else {
          targetDashboard = "/dashboard/my-profile";
        }

        navigate(targetDashboard, { replace: true });
        return;
      } else {
        const errMsg = params.get("error") || "Authentication failed. Please try again.";
        toast.error(errMsg);
        navigate("/login", { replace: true });
      }
    };

    handleOAuth();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-richblack-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-sm font-semibold text-slate-300">Completing Social Login...</h1>
      </div>
    </div>
  );
}

export default OAuthSuccess;
