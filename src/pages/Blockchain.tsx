import React, { useState, useEffect } from 'react';
import { Clock, Database, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import client from '../lib/hiveClient';

interface Block {
  height: number;
  timestamp: string;
  witness: string;
  transactions: number;
  votes: number;
  comments: number;
}

interface BlockchainProperties {
  current_supply: string;
  current_hbd_supply: string;
  total_vesting_fund_hive: string;
  total_vesting_shares: string;
  head_block_number: number;
  virtual_supply: string;
  hbd_interest_rate: number;
}

const Blockchain = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [properties, setProperties] = useState<BlockchainProperties | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestBlocks = async () => {
    try {
      const props = await client.database.getDynamicGlobalProperties();
      const latestBlockNum = props.head_block_number;
      
      const blockPromises = Array.from({ length: 12 }, (_, i) => 
        client.database.getBlock(latestBlockNum - i)
      );
      
      const fetchedBlocks = await Promise.all(blockPromises);
      
      const formattedBlocks = fetchedBlocks.map((block, index) => ({
        height: latestBlockNum - index,
        timestamp: block.timestamp,
        witness: block.witness,
        transactions: block.transactions.length,
        votes: block.transactions.filter((tx: any) => tx.operations[0][0] === 'vote').length,
        comments: block.transactions.filter((tx: any) => tx.operations[0][0] === 'comment').length
      }));

      setBlocks(formattedBlocks);
      setProperties(props);
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
    }
  };

  useEffect(() => {
    fetchLatestBlocks();
    const interval = setInterval(fetchLatestBlocks, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!properties) {
    return <div>Loading blockchain data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blockchain Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Supply</p>
              <p className="text-2xl font-semibold text-gray-900">
                {parseFloat(properties.current_supply).toLocaleString()} HIVE
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">HBD Supply</p>
              <p className="text-2xl font-semibold text-gray-900">
                {parseFloat(properties.current_hbd_supply).toLocaleString()} HBD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vesting</p>
              <p className="text-2xl font-semibold text-gray-900">
                {parseFloat(properties.total_vesting_fund_hive).toLocaleString()} HIVE
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-indigo-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">HBD Interest Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(properties.hbd_interest_rate / 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Latest Blocks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Witness</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blocks.map((block) => (
                <tr key={block.height}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{block.height}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(block.timestamp), 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">@{block.witness}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{block.transactions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{block.votes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{block.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Blockchain;