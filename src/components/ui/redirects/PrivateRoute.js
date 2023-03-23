import { Navigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function PrivateRoute({ children }) {
  const isUserLogged = useAuth();
  return isUserLogged ? children : <Navigate to="/"></Navigate>;
}
