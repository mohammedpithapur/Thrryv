import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import LocalDB from '../utils/localDB';
import PostCard from './PostCard';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setPosts(LocalDB.getAllPosts());
    };
    
    loadData();
    const interval = setInterval(loadData, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    
    <div className="pb-20 max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-black rounded-full grid place-items-center">
            <div className="w-3 h-3 border-2 border-white rounded-full"></div>
          </div>
          <span className="font-bold text-lg tracking-tight">Reflections</span>
        </div>
        <Bell className="w-5 h-5 text-black" />
      </div>

<div className="bg-red-500 p-4 text-white">Tailwind Test</div>
      <div className="flex space-x-6 px-4 py-3 text-sm font-medium text-gray-400 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <span className="text-black border-b-2 border-black pb-1">All</span>
        <span>Connections</span>
        <span>Trending</span>
        <span>Nearby</span>
      </div>

      <div className="pt-4">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
};

export default FeedPage;