import { Navigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function Redirects({ children }) {
  const isUserLogged = useAuth()
  console.log(isUserLogged)
  if (isUserLogged) {
    return <Navigate to="/inbox"></Navigate>;
  }
  return children;
}
