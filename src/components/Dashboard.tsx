import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Activity, Users, TrendingUp, Wallet, Award, Clock, BarChart2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import client from '../lib/hiveClient';
import useAuthStore from '../store/authStore';

interface DashboardStats {
  activeAccounts: number;
  totalAccounts: number;
  avgTransactions: number;
  realtimeTransactions: number[];
}

interface UserStats {
  postCount: number;
  followers: number;
  following: number;
  reputation: number;
  balance: string;
  lastActive: string;
  votingPower: number;
  postingCount: number;
}

const Dashboard = () => {
  const username = useAuthStore((state) => state.username);
  const [stats, setStats] = useState<DashboardStats>({
    activeAccounts: 0,
    totalAccounts: 0,
    avgTransactions: 0,
    realtimeTransactions: Array(30).fill(0),
  });
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateReputation = (reputation: number) => {
    if (reputation === 0) return 25;
    const neg = reputation < 0;
    const rep = Math.log10(Math.abs(reputation));
    const result = Math.max(reputation > 0 ? rep - 9 : rep - 9 + 1, -9);
    return (neg ? -1 : 1) * result * 9 + 25;
  };

  const fetchFollowerCount = async (username: string) => {
    try {
      const result = await client.call('condenser_api', 'get_follow_count', [username]);
      return {
        follower_count: result.follower_count,
        following_count: result.following_count
      };
    } catch (error) {
      console.error('Error fetching follower count:', error);
      return { follower_count: 0, following_count: 0 };
    }
  };

  const fetchUserStats = async (username: string) => {
    try {
      const [account] = await client.database.getAccounts([username]);
      if (account) {
        const followers = await fetchFollowerCount(username);
        
        // Calculate voting power
        const secondsago = (new Date().getTime() - new Date(account.last_vote_time + "Z").getTime()) / 1000;
        const votingPower = Math.min(10000, account.voting_power + (10000 * secondsago / 432000)) / 100;

        // Get recent account history
        const accountHistory = await client.database.call('get_account_history', [username, -1, 100]);
        const postingCount = accountHistory.filter((h: any) => 
          ['comment', 'vote', 'transfer'].includes(h[1].op[0])
        ).length;

        setUserStats({
          postCount: account.post_count,
          followers: followers.follower_count,
          following: followers.following_count,
          reputation: Math.floor(calculateReputation(account.reputation)),
          balance: account.balance,
          lastActive: format(new Date(account.last_post || account.created), 'PPP'),
          votingPower: Math.floor(votingPower),
          postingCount
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const properties = await client.database.getDynamicGlobalProperties();
      const accounts = await client.database.call('get_account_count', []);
      
      // Get real transaction count from recent blocks
      const blockNum = properties.head_block_number;
      const recentBlocks = await Promise.all(
        Array.from({ length: 5 }, (_, i) => 
          client.database.getBlock(blockNum - i)
        )
      );

      const txCount = recentBlocks.reduce((sum, block) => 
        sum + (block?.transactions?.length || 0), 0
      );

      setStats(prev => ({
        activeAccounts: Math.floor(accounts * 0.15),
        totalAccounts: accounts,
        avgTransactions: txCount,
        realtimeTransactions: [...prev.realtimeTransactions.slice(1), txCount],
      }));

      // Update transaction history with timestamp
      const newHistory = {
        time: format(new Date(), 'HH:mm:ss'),
        transactions: txCount,
      };
      setTransactionHistory(prev => [...prev.slice(-29), newHistory]);
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserStats(username);
    }
    fetchGlobalStats();
    setIsLoading(false);

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchGlobalStats();
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hive Blockchain Analytics</h1>
        
        {userStats && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Reputation Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.reputation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Followers/Following</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {userStats.followers}/{userStats.following}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">HIVE Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.balance}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart2 className="h-8 w-8 text-indigo-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Voting Power</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.votingPower}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Posts</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.postCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.postingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-teal-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Last Active</p>
                    <p className="text-lg font-semibold text-gray-900">{userStats.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAccounts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAccounts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Current Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Transaction Activity</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.realtimeTransactions.map((value, index) => ({
                  time: index,
                  value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#82ca9d" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;