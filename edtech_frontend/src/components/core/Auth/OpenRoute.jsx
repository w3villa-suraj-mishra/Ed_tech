// This will prevent authenticated users from accessing this route
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)

  if (token === null) {
    return children
  } else {
    const redirectPath = token && (JSON.parse(localStorage.getItem("user") || "null")?.accountType === "Instructor")
      ? "/dashboard/instructor"
      : "/dashboard/global"
    return <Navigate to={redirectPath} replace />
  }
}

export default OpenRoute