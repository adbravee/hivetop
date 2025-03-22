import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import client from '../lib/hiveClient';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

interface Post {
  author: string;
  permlink: string;
  title: string;
  body: string;
  created: string;
  net_votes: number;
  children: number;
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { username } = useAuthStore();

  const fetchPosts = async () => {
    try {
      const query = {
        tag: '',
        limit: 20,
      };
      const result = await client.database.getDiscussions('trending', query);
      setPosts(result);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (author: string, permlink: string) => {
    if (!username) {
      toast.error('Please login to vote');
      return;
    }

    try {
      window.hive_keychain.requestVote(
        username,
        permlink,
        author,
        100,
        (response: any) => {
          if (response.success) {
            toast.success('Vote successful!');
            fetchPosts(); // Refresh posts to update vote count
          } else {
            toast.error('Vote failed: ' + response.message);
          }
        }
      );
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={`${post.author}-${post.permlink}`} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/posts/${post.author}/${post.permlink}`}
                className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
              >
                {post.title}
              </Link>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <Link to={`/@${post.author}`} className="hover:text-indigo-600">
                  @{post.author}
                </Link>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(post.created + 'Z'), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 line-clamp-3">{post.body.substring(0, 200)}...</p>
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => handleVote(post.author, post.permlink)}
              className="flex items-center text-gray-500 hover:text-indigo-600"
            >
              <ThumbsUp className="h-5 w-5 mr-1" />
              {post.net_votes}
            </button>
            <Link
              to={`/posts/${post.author}/${post.permlink}`}
              className="flex items-center text-gray-500 hover:text-indigo-600"
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              {post.children}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;