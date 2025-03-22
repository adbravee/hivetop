import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import PostList from '../components/PostList';

const Posts = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        <Link
          to="/posts/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Post
        </Link>
      </div>
      <PostList />
    </div>
  );
};

export default Posts;