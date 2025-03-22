import React from 'react';
import { ArrowRightLeft, DollarSign, Wallet, ExternalLink } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Trading = () => {
  const { username } = useAuthStore();

  const handleTransferToSavings = () => {
    if (!username) {
      toast.error('Please login first');
      return;
    }
    window.location.href = 'https://wallet.hive.blog/savings';
  };

  const handleConvertHive = () => {
    if (!username) {
      toast.error('Please login first');
      return;
    }
    window.location.href = 'https://wallet.hive.blog/convert';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Trading & Savings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Convert HIVE to HBD</h2>
          <p className="text-gray-600 mb-6">
            Convert your HIVE to HBD safely using the official Hive wallet interface.
          </p>
          <button
            onClick={handleConvertHive}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Go to Conversion Page
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Savings Management</h2>
          <p className="text-gray-600 mb-6">
            Manage your HBD savings securely through the official Hive wallet interface.
          </p>
          <button
            onClick={handleTransferToSavings}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Go to Savings Page
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Security Notice</h3>
        <p className="text-blue-700">
          For enhanced security, all financial transactions are handled through the official Hive wallet interface.
          This ensures your funds remain secure and transactions are processed safely.
        </p>
      </div>
    </div>
  );
};

export default Trading;