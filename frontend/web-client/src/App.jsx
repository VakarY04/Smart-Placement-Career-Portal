import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

const getStoredUser = () => {
  try {
    const parsedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      ...parsedUser,
      role: typeof parsedUser.role === 'string' ? parsedUser.role.toUpperCase() : parsedUser.role,
    };
  } catch {
    return {};
  }
};

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.role) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard/resume-upload'} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  
  if (token) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard/resume-upload" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="cyber-shell min-h-screen text-slate-100 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/resume-upload" replace />} />
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />
          <Route path="/signup" element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          } />
          <Route path="/dashboard/*" element={
            <ProtectedRoute requiredRole="STUDENT">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard/*" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
