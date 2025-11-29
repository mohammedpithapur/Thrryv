import React from 'react';
import { Home, MessageSquare, PlusCircle, Search, User } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center pb-8 sticky bottom-0 z-50">
      <button 
        onClick={() => setActiveTab('feed')} 
        className={`flex flex-col items-center transition ${activeTab === 'feed' ? 'text-black' : 'text-gray-300'}`}
      >
        <Home className="w-6 h-6 stroke-[2.5] mb-1" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      
      <button className="flex flex-col items-center text-gray-300 hover:text-gray-500 transition">
        <MessageSquare className="w-6 h-6 stroke-[2.5] mb-1" />
        <span className="text-[10px] font-bold">Inbox</span>
      </button>

      <button 
        onClick={() => setActiveTab('upload')} 
        className={`flex flex-col items-center transition ${activeTab === 'upload' ? 'text-black' : 'text-gray-300'}`}
      >
        <PlusCircle className="w-7 h-7 stroke-[2.5] mb-1" />
        <span className="text-[10px] font-bold">Create</span>
      </button>

      <button className="flex flex-col items-center text-gray-300 hover:text-gray-500 transition">
        <Search className="w-6 h-6 stroke-[2.5] mb-1" />
        <span className="text-[10px] font-bold">Explore</span>
      </button>

      <button 
        onClick={() => setActiveTab('profile')} 
        className={`flex flex-col items-center transition ${activeTab === 'profile' ? 'text-black' : 'text-gray-300'}`}
      >
        <User className="w-6 h-6 stroke-[2.5] mb-1" />
        <span className="text-[10px] font-bold">Me</span>
      </button>
    </div>
  );
};

export default Navbar;