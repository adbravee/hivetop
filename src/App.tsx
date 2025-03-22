import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Posts from './pages/Posts';
import CreatePost from './components/CreatePost';
import Transactions from './pages/Transactions';
import Blockchain from './pages/Blockchain';
import RichList from './pages/RichList';
import Trading from './pages/Trading';
import Navbar from './components/Navbar';
import useAuthStore from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/blockchain"
            element={
              <PrivateRoute>
                <Blockchain />
              </PrivateRoute>
            }
          />
          <Route
            path="/rich-list"
            element={
              <PrivateRoute>
                <RichList />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <PrivateRoute>
                <Posts />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/trading"
            element={
              <PrivateRoute>
                <Trading />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;