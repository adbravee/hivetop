import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import client from '../lib/hiveClient';

interface Transaction {
  block_num: number;
  timestamp: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  memo?: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const props = await client.database.getDynamicGlobalProperties();
      const latestBlock = props.head_block_number;
      
      // Fetch last 3 blocks for real-time transactions
      const blocks = await Promise.all(
        Array.from({ length: 3 }, (_, i) => 
          client.database.getBlock(latestBlock - i)
        )
      );

      const newTransactions = blocks.flatMap((block) => 
        block.transactions
          .filter((tx: any) => tx.operations[0][0] === 'transfer')
          .map((tx: any) => ({
            block_num: block.block_num,
            timestamp: block.timestamp,
            type: tx.operations[0][0],
            from: tx.operations[0][1].from,
            to: tx.operations[0][1].to,
            amount: tx.operations[0][1].amount,
            memo: tx.operations[0][1].memo
          }))
      );

      setTransactions(prev => {
        const combined = [...newTransactions, ...prev];
        return combined.slice(0, 100); // Keep last 100 transactions
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Live Transactions</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transfers</h2>
          <p className="mt-1 text-sm text-gray-500">Updates every 3 seconds</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx, index) => (
                <tr key={`${tx.block_num}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(tx.timestamp), 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <a href={`https://hive.blog/@${tx.from}`} target="_blank" rel="noopener noreferrer">
                      @{tx.from}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <a href={`https://hive.blog/@${tx.to}`} target="_blank" rel="noopener noreferrer">
                      @{tx.to}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.memo?.substring(0, 30)}
                    {tx.memo && tx.memo.length > 30 ? '...' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;