import React, { useState } from 'react';
import { Bookmark, TrendingUp, Flame, MessageCircle, Share2 } from 'lucide-react';
import LocalDB from '../utils/localDB';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    LocalDB.likePost(post.id);
    setLikes(prev => prev + 1);
  };

  return (
    <div className="bg-white mb-6 border-b border-gray-100 pb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={post.avatar || 'https://i.pravatar.cc/150'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-black">{post.username}</span>
              <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {post.userScore || 750}
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-400">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mb-3">
        <p className="text-sm text-gray-800 mb-3 leading-relaxed">{post.caption}</p>
        <div className="w-full bg-gray-100 rounded-xl overflow-hidden relative shadow-sm">
          {post.type === 'video' ? (
            <video src={post.image} controls className="w-full h-auto max-h-96 object-cover" />
          ) : (
            <img src={post.image} alt="post" className="w-full h-auto max-h-96 object-cover" />
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-black" />
            +{post.reputationGain || 5} rep
          </div>
        </div>
      </div>

      <div className="px-4 flex items-center space-x-6">
        <button onClick={handleLike} className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition group">
          <Flame className={`w-5 h-5 ${likes > 0 ? 'text-red-500 fill-red-500' : ''}`} />
          <span className="text-xs font-bold">{likes}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-black transition">
          <MessageCircle className="w-5 h-5" />
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-black transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;