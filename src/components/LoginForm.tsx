import React, { useState, useEffect } from 'react';
import { User, Shield, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKeychain, setHasKeychain] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for Hive Keychain
    const checkKeychain = () => {
      if (window.hive_keychain) {
        setHasKeychain(true);
      }
    };

    // Check immediately
    checkKeychain();

    // Also check after a delay to allow extension to load
    setTimeout(checkKeychain, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username);
      if (success) {
        navigate('/');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasKeychain) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Hive Keychain Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please install the Hive Keychain browser extension to continue.
              <a
                href="https://hive-keychain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 font-medium text-indigo-600 hover:text-indigo-500"
              >
                Get Hive Keychain
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to Hive Analytics
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure login with Hive Keychain
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Hive Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Hive Keychain'}
            </button>
          </div>

          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              Don't have a Hive account?{' '}
              <a
                href="https://signup.hive.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create one here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;