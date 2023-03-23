import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/ui/redirects/PrivateRoute";
import PublicRoute from "./components/ui/redirects/Redirects";
import useAuthCheck from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const authChecked = useAuthCheck();
  return !authChecked ? (
    <div>Check authentication...</div>
  ) : (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <PrivateRoute>
              <Conversation />
            </PrivateRoute>
          }
        />
        <Route
          path="/inbox/:id"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound></NotFound>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
