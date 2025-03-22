import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Award } from 'lucide-react';
import client from '../lib/hiveClient';
import Big from 'big.js';

interface Account {
  name: string;
  balance: string;
  hbd_balance: string;
  vesting_shares: string;
  vesting_balance: string;
  reputation: number;
  post_count: number;
  total_balance_hive: string;
}

const RichList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalProps, setGlobalProps] = useState<any>(null);

  const calculateReputation = (reputation: number) => {
    if (reputation === 0) return 25;
    const neg = reputation < 0;
    const rep = Math.log10(Math.abs(reputation));
    const result = Math.max(reputation > 0 ? rep - 9 : rep - 9 + 1, -9);
    return (neg ? -1 : 1) * result * 9 + 25;
  };

  const calculateVestingHive = (vestingShares: string, props: any) => {
    try {
      const totalVestingShares = new Big(props.total_vesting_shares.split(' ')[0]);
      const totalVestingFundHive = new Big(props.total_vesting_fund_hive.split(' ')[0]);
      const userVestingShares = new Big(vestingShares.split(' ')[0]);
      
      const vestingHive = userVestingShares
        .times(totalVestingFundHive)
        .div(totalVestingShares)
        .round(3)
        .toString();
      
      return `${vestingHive} HIVE`;
    } catch (error) {
      console.error('Error calculating vesting HIVE:', error);
      return '0 HIVE';
    }
  };

  const calculateTotalBalance = (hiveBalance: string, vestingBalance: string) => {
    try {
      const hive = new Big(hiveBalance.split(' ')[0]);
      const vesting = new Big(vestingBalance.split(' ')[0]);
      return `${hive.plus(vesting).round(3).toString()} HIVE`;
    } catch (error) {
      console.error('Error calculating total balance:', error);
      return '0 HIVE';
    }
  };

  const fetchRichAccounts = async () => {
    try {
      // First get global properties
      const props = await client.database.getDynamicGlobalProperties();
      setGlobalProps(props);

      // Get witness accounts
      const witnesses = await client.database.call('get_witnesses_by_vote', ['', 100]);
      const witnessAccounts = witnesses.map((w: any) => w.owner);

      // Get accounts with highest vesting shares
      const accounts = await client.database.call('lookup_accounts', ['', 1000]);
      const accountDetails = await client.database.getAccounts(accounts);
      
      const processedAccounts = accountDetails.map((account: any) => {
        const vestingBalance = calculateVestingHive(account.vesting_shares, props);
        const totalBalance = calculateTotalBalance(account.balance, vestingBalance);
        
        return {
          name: account.name,
          balance: account.balance,
          hbd_balance: account.hbd_balance,
          vesting_shares: account.vesting_shares,
          vesting_balance: vestingBalance,
          total_balance_hive: totalBalance,
          reputation: Math.floor(calculateReputation(account.reputation)),
          post_count: account.post_count,
          is_witness: witnessAccounts.includes(account.name)
        };
      });

      // Sort by total balance
      const sortedAccounts = processedAccounts.sort((a: Account, b: Account) => {
        const aBalance = parseFloat(a.total_balance_hive.split(' ')[0]);
        const bBalance = parseFloat(b.total_balance_hive.split(' ')[0]);
        return bBalance - aBalance;
      }).slice(0, 100);

      setAccounts(sortedAccounts);
      setError(null);
    } catch (error) {
      console.error('Error fetching rich accounts:', error);
      setError('Failed to fetch account data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRichAccounts();
    const interval = setInterval(fetchRichAccounts, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading rich list...</div>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hive Rich List</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total HIVE Supply</p>
              <p className="text-2xl font-semibold text-gray-900">
                {globalProps?.current_supply || '0 HIVE'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vesting Fund</p>
              <p className="text-2xl font-semibold text-gray-900">
                {globalProps?.total_vesting_fund_hive || '0 HIVE'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vesting Shares</p>
              <p className="text-2xl font-semibold text-gray-900">
                {globalProps?.total_vesting_shares || '0 VESTS'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Top 100 Accounts by Total HIVE Value</h2>
          <p className="mt-1 text-sm text-gray-500">Including HIVE and Vesting Shares</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total HIVE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HIVE Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vesting HIVE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HBD Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account, index) => (
                <tr key={account.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <div className="flex items-center">
                      <a
                        href={`https://hive.blog/@${account.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-900"
                      >
                        @{account.name}
                      </a>
                      {account.is_witness && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Witness
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.total_balance_hive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.balance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.vesting_balance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.hbd_balance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.reputation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RichList;