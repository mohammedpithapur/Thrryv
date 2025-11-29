import React, { useState, useEffect } from 'react';
import { User, Settings, Send } from 'lucide-react';
import LocalDB from '../utils/localDB';

const ProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(currentUser);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const u = LocalDB.getCurrentUser();
      setUser(u);
      setPosts(LocalDB.getUserPosts(u.username));
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <div className="pb-20 max-w-md mx-auto bg-white min-h-screen pt-4">
      <div className="flex justify-between items-start px-4 mb-4">
        <span className="font-bold text-lg">@{user.username.toLowerCase().replace(/\s/g, '')}</span>
        <div className="flex space-x-4">
          <User className="w-6 h-6" />
          <Settings className="w-6 h-6" />
        </div>
      </div>

      <div className="flex flex-col items-center mb-8 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 mb-3 border border-gray-200 p-1">
           <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="profile"/>
        </div>
        
        <h2 className="text-xl font-bold mb-1">{user.username}</h2>
        <p className="text-gray-600 text-sm text-center max-w-xs mb-4">{user.bio}</p>

        <div className="text-center mb-6">
          <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Reputation Score</span>
          <span className="block text-4xl font-black">{user.reputationScore}</span>
        </div>

        <div className="flex items-center space-x-3 w-full max-w-xs mb-8">
          <button className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold text-sm">Forge Bond</button>
          <button className="flex-1 bg-gray-100 text-black py-2.5 rounded-lg font-bold text-sm">Feedback</button>
          <button className="p-2.5 border border-gray-200 rounded-lg">
            <Send className="w-5 h-5 -rotate-45 mb-0.5 ml-0.5" />
          </button>
        </div>

        <div className="flex justify-between w-full max-w-sm px-2 text-center">
          <div>
            <span className="block font-bold text-lg">{posts.length}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Moments</span>
          </div>
          <div>
            <span className="block font-bold text-lg">{user.supporters}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Supporters</span>
          </div>
          <div>
            <span className="block font-bold text-lg">{user.interests}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Interests</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="grid grid-cols-3 gap-0.5">
          {posts.map(post => (
            <div key={post.id} className="aspect-square bg-gray-100 relative">
              {post.type === 'video' ? (
                <video src={post.image} className="w-full h-full object-cover" />
              ) : (
                <img src={post.image} className="w-full h-full object-cover" alt="grid" />
              )}
            </div>
          ))}
          {[1,2,3].map(i => <div key={i} className="aspect-square bg-gray-50/50"></div>)}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;