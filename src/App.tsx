import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import Collection from './pages/Collection';
import Templates from './pages/Templates';
import NewCollectionForm from './components/collections/NewCollectionForm';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import FormBuilderPage from './pages/FormBuilderPage';
import PublicFormPage from './pages/PublicFormPage';
import { useAuth } from './context/AuthContext';

// Wrapper component for protected routes
const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    // Optional: Add a better loading indicator
    return <div>Loading...</div>;
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper component for public routes (like login/signup)
const PublicRoute: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    // Optional: Add a better loading indicator
    return <div>Loading...</div>;
  }

  return !session ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { loading } = useAuth(); // Get loading state for initial root redirect

  if (loading) {
     // Optional: Add a better loading indicator for the whole app initial load
    return <div>Loading application...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes (redirect if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Truly Public routes (accessible to all) */}
        <Route path="/form/:collectionId" element={<PublicFormPage />} />

        {/* Protected routes (redirect to login if not logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<Collection />} />
          <Route path="/collections/new" element={
            <div className="min-h-screen bg-gray-50 p-6">
              <NewCollectionForm />
            </div>
          } />
          <Route path="/templates" element={<Templates />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/builder" element={<FormBuilderPage />} />
          {/* Root path redirects inside protected context */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Optional: Add a 404 Not Found route - place it outside protected/public wrappers if needed */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;