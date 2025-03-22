import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, BookOpen, Activity, LogOut, Coins, LineChart } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <BarChart2 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Hive Social</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <BarChart2 className="h-5 w-5 mr-1" />
                Analytics
              </Link>
              <Link
                to="/blockchain"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <LineChart className="h-5 w-5 mr-1" />
                Blockchain
              </Link>
              <Link
                to="/rich-list"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <Coins className="h-5 w-5 mr-1" />
                Rich List
              </Link>
              <Link
                to="/posts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <BookOpen className="h-5 w-5 mr-1" />
                Posts
              </Link>
              <Link
                to="/transactions"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <Activity className="h-5 w-5 mr-1" />
                Transactions
              </Link>
              <Link
                to="/trading"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <Coins className="h-5 w-5 mr-1" />
                Trading
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {username && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">@{username}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;