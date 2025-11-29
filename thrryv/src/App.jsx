import React, { useState, useEffect } from 'react';
import { 
  Home, Mail, PlusSquare, Search, User, 
  Flame, MessageSquare, Share2, Bookmark, 
  Bell, Settings, Send, ShieldCheck, 
  AlertTriangle, CheckCircle, Loader2, X, TrendingUp,
  PenLine, MoreHorizontal, LogOut, History
} from 'lucide-react';

// ==========================================
// 1. CONFIGURATION & SERVICES
// ==========================================

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// --- Local Database Engine (Advanced: History & Vectors) ---
const LocalDB = {
  init: () => {
    // Initialize Users
    if (!localStorage.getItem('thrryv_users')) {
      const defaultUser = {
        id: 'u1',
        username: 'Julie Murray',
        handle: '@juliem',
        avatar: 'https://i.pravatar.cc/150?img=9',
        bio: "I don't wait for opportunities, I make them!",
        reputationScore: 750,
        moments: 90,
        supporters: 8405,
        interests: 450,
        consistencyStreak: 3, 
        contentVector: "nature, hiking, outdoors, landscapes, mountains, authentic, travel" 
      };
      localStorage.setItem('thrryv_users', JSON.stringify([defaultUser]));
      localStorage.setItem('thrryv_current_user_id', 'u1');
    }

    // Initialize Posts
    if (!localStorage.getItem('thrryv_posts')) {
      const defaultPosts = [
        {
          id: 'p1',
          userId: 'u1',
          username: 'Julie Murray',
          userScore: 950,
          avatar: 'https://i.pravatar.cc/150?img=9',
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          caption: 'Went on a hike this afternoon, & was a blast. The view is unreal!',
          reputationGain: 5,
          likes: 42,
          type: 'image',
          timestamp: Date.now() - 10000000
        }
      ];
      localStorage.setItem('thrryv_posts', JSON.stringify(defaultPosts));
    }

    // Initialize Inbox Messages
    if (!localStorage.getItem('thrryv_inbox')) {
      const defaultInbox = [
        {
          id: 'm1',
          senderId: 'u2',
          senderName: 'Barbera Smith',
          senderAvatar: 'https://i.pravatar.cc/150?img=5',
          content: 'Hey Julie! Loved your hiking post. Where is that trail?',
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: false
        },
        {
          id: 'm2',
          senderId: 'u3',
          senderName: 'Charlie Spencer',
          senderAvatar: 'https://i.pravatar.cc/150?img=11',
          content: 'Great work on maintaining that reputation score! 🔥',
          timestamp: Date.now() - 86400000, // 1 day ago
          read: true
        },
        {
            id: 'm3',
            senderId: 'u4',
            senderName: 'System',
            senderAvatar: 'https://ui-avatars.com/api/?name=Thrryv+Guardian&background=000&color=fff',
            content: 'Your recent post has been verified. +5 Reputation.',
            timestamp: Date.now() - 172800000, // 2 days ago
            read: true
        }
      ];
      localStorage.setItem('thrryv_inbox', JSON.stringify(defaultInbox));
    }
  },

  getCurrentUser: () => {
    const userId = localStorage.getItem('thrryv_current_user_id');
    const users = JSON.parse(localStorage.getItem('thrryv_users') || '[]');
    return users.find(u => u.id === userId) || users[0];
  },

  getAllPosts: () => {
    const posts = JSON.parse(localStorage.getItem('thrryv_posts') || '[]');
    return posts.sort((a, b) => b.timestamp - a.timestamp);
  },

  getUserPosts: (username) => {
    const posts = JSON.parse(localStorage.getItem('thrryv_posts') || '[]');
    return posts.filter(p => p.username === username).sort((a, b) => b.timestamp - a.timestamp);
  },

  getInboxMessages: () => {
    const messages = JSON.parse(localStorage.getItem('thrryv_inbox') || '[]');
    return messages.sort((a, b) => b.timestamp - a.timestamp);
  },

  addPost: (post) => {
    const posts = JSON.parse(localStorage.getItem('thrryv_posts') || '[]');
    const newPost = { ...post, id: `p${Date.now()}`, timestamp: Date.now(), likes: 0 };
    posts.unshift(newPost);
    localStorage.setItem('thrryv_posts', JSON.stringify(posts));
    
    // Update User Stats
    const users = JSON.parse(localStorage.getItem('thrryv_users') || '[]');
    const userIndex = users.findIndex(u => u.username === post.username);
    
    if (userIndex !== -1) {
      const user = users[userIndex];
      
      // 1. Apply Reputation Score (Can be negative now)
      user.reputationScore += (post.reputationGain || 0);
      user.moments += 1;

      // 2. Update Momentum & Vectors
      if (post.reputationGain > 0) {
        // Good post: Increase streak
        user.consistencyStreak = (user.consistencyStreak || 0) + 1;
        const newVector = (user.contentVector || "") + ", " + (post.vectorTags || "general");
        const vectorWords = newVector.split(', ').slice(-20).join(', '); 
        user.contentVector = vectorWords;
      } else {
        // Bad/Unsafe post: Reset streak to 0
        user.consistencyStreak = 0;
      }

      localStorage.setItem('thrryv_users', JSON.stringify(users));
    }
    return newPost;
  },

  likePost: (postId) => {
    const posts = JSON.parse(localStorage.getItem('thrryv_posts') || '[]');
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].likes += 1;
      localStorage.setItem('thrryv_posts', JSON.stringify(posts));
      return posts[postIndex];
    }
  }
};

// --- Media Utils ---
const extractFramesFromVideo = async (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames = [];
    const url = URL.createObjectURL(file);
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const timestamps = [0.5, duration / 2, duration - 0.5];
      canvas.width = 512; canvas.height = 512;
      for (let time of timestamps) {
        video.currentTime = time;
        await new Promise(r => { video.onseeked = r; });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      }
      URL.revokeObjectURL(url);
      resolve(frames);
    };
    video.onerror = reject;
  });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

// --- Groq API ---
const callGroq = async (apiKey, contentPayload) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: contentPayload }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq API Error');
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

// ==========================================
// 2. COMPONENTS
// ==========================================

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);
  const handleLike = () => {
    LocalDB.likePost(post.id);
    setLikes(prev => prev + 1);
  };

  const isFlagged = post.reputationGain < 0;

  return (
    <div className={`bg-white mb-4 pb-2 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow ${isFlagged ? 'border-red-100 bg-red-50/10' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition">
             <img src={post.avatar} alt="user" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
             <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-black hover:underline cursor-pointer">{post.username}</span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {post.userScore || 750}
                </span>
             </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>
      <div className="px-4">
        <p className="text-sm text-gray-900 mb-3 leading-snug font-normal">{post.caption}</p>
        <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative mb-3 shadow-sm border border-gray-100 bg-black">
          {post.type === 'video' ? (
            <video 
              src={post.image} 
              controls 
              playsInline
              className={`w-full h-full object-contain ${isFlagged ? 'grayscale opacity-80' : ''}`} 
            />
          ) : (
            <img src={post.image} className={`w-full h-full object-cover ${isFlagged ? 'grayscale opacity-80' : ''}`} alt="content" />
          )}
          {isFlagged && (
            <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-lg z-10">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Flagged Content
            </div>
          )}
        </div>
      </div>
      <div className="px-4 flex items-center justify-between mt-2 mb-2">
        <div className="flex items-center space-x-6">
          <button onClick={handleLike} className="flex items-center space-x-1 transition group">
             <Flame className={`w-6 h-6 stroke-[1.5] transition ${likes > 0 ? 'fill-black text-black scale-110' : 'text-gray-600 group-hover:text-black'}`} />
             <span className="text-xs font-bold">{likes > 0 ? likes : ''}</span>
          </button>
          <button className="text-gray-600 hover:text-black transition"><MessageSquare className="w-6 h-6 stroke-[1.5]" /></button>
          <button className="text-gray-600 hover:text-black transition"><Share2 className="w-6 h-6 stroke-[1.5]" /></button>
        </div>
        <div className={`flex items-center text-xs font-bold uppercase tracking-wide ${isFlagged ? 'text-red-600' : 'text-gray-400'}`}>
          <TrendingUp className={`w-3 h-3 mr-1 ${isFlagged ? 'rotate-180' : ''}`} />
          {isFlagged ? '' : '+'} {post.reputationGain} REP
        </div>
      </div>
    </div>
  );
};

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const loadData = () => setPosts(LocalDB.getAllPosts());
    loadData();
    const interval = setInterval(loadData, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-black tracking-tight text-black">Reflections</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Bell className="w-6 h-6 stroke-[1.5] text-black" />
            </button>
        </div>
        <div className="flex space-x-6 text-sm font-medium text-gray-400 overflow-x-auto no-scrollbar">
            <button className="text-black border-b-2 border-black pb-2 px-1 transition">All</button>
            <button className="pb-2 px-1 hover:text-black transition">Connections</button>
            <button className="pb-2 px-1 hover:text-black transition">Trending</button>
        </div>
      </div>
      <div className="pt-4 pb-20 md:pb-0 px-2">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
};

const InboxPage = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const msgs = LocalDB.getInboxMessages();
      setMessages(msgs);
    };
    loadData();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto pt-4 pb-20 md:pb-0">
       <div className="px-4 mb-6 sticky top-0 bg-white/95 backdrop-blur-sm z-20 pt-2 pb-2 border-b border-gray-100">
        <h1 className="text-xl font-black tracking-tight text-black mb-4">Inbox</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/5 transition font-medium"
          />
        </div>
      </div>

      <div className="px-4">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer border-b border-gray-50 last:border-0">
            <div className="relative">
                <img src={msg.senderAvatar} alt={msg.senderName} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                {!msg.read && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm ${!msg.read ? 'font-bold text-black' : 'font-medium text-gray-900'}`}>{msg.senderName}</h4>
                    <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                </div>
                <p className={`text-sm truncate ${!msg.read ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadData = () => {
      const allPosts = LocalDB.getAllPosts();
      setPosts(allPosts.sort(() => Math.random() - 0.5));
    };
    loadData();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto pt-4 pb-20 md:pb-0">
      <div className="px-4 mb-6 sticky top-0 bg-white/95 backdrop-blur-sm z-20 pt-2 pb-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search people, posts, tags..." 
            className="w-full bg-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/5 transition font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
          {['Trending', 'AI', 'Design', 'Travel', 'Tech', 'Minimalism'].map(tag => (
            <button key={tag} className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-black hover:text-white transition cursor-pointer">
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 mb-8">
        <h3 className="font-bold text-sm mb-4 text-black">People you may want to know</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex flex-col items-center space-y-2 min-w-[80px] group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-100 overflow-hidden relative">
                   <img src={`https://i.pravatar.cc/150?img=${i + 20}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" alt="suggestion" />
                </div>
                <span className="text-xs font-bold truncate w-full text-center">User {i}</span>
                <button className="bg-black text-white text-[10px] px-3 py-1 rounded-full font-bold hover:bg-gray-800 transition">Follow</button>
             </div>
           ))}
        </div>
      </div>
      <div className="px-4">
        <h3 className="font-bold text-sm mb-4 text-black">Explore</h3>
        <div className="grid grid-cols-3 gap-1">
          {posts.map(post => (
             <div key={post.id} className="aspect-[4/5] bg-gray-100 relative group overflow-hidden cursor-pointer">
                {post.type === 'video' ? (
                  <video src={post.image} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.image} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="explore" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                   <span className="text-white text-xs font-bold flex items-center">
                     <Flame className="w-3 h-3 mr-1 fill-white" /> {post.likes || 0}
                   </span>
                </div>
             </div>
          ))}
          {[1,2,3,4,5,6].map(i => <div key={`fill-${i}`} className="aspect-[4/5] bg-gray-50"></div>)}
        </div>
      </div>
    </div>
  );
};

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
    <div className="w-full max-w-2xl mx-auto pt-4 pb-20 md:pb-0">
      <div className="flex justify-between items-center px-4 mb-6">
        <span className="font-bold text-lg tracking-tight">@{user.handle.replace('@','')}</span>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition"><Settings className="w-6 h-6 stroke-[1.5]" /></button>
        </div>
      </div>
      <div className="flex flex-col items-center px-6">
        <div className="w-32 h-32 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-sm">
           <img src={user.avatar} className="w-full h-full object-cover" alt="profile" />
        </div>
        <h2 className="text-2xl font-black mb-1">{user.username}</h2>
        <p className="text-gray-600 text-sm text-center leading-snug mb-2 max-w-sm">{user.bio}</p>
        
        {/* MOMENTUM BADGE */}
        <div className="mb-6 flex items-center gap-2 bg-black/5 px-3 py-1 rounded-full border border-black/5">
           <History className="w-3 h-3 text-gray-600" />
           <span className="text-xs font-bold text-gray-600">Streak: <span className="text-black">{user.consistencyStreak || 0}</span> Quality Posts</span>
        </div>

        <div className="flex flex-col items-center mb-8 bg-gray-50 px-6 py-3 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reputation Score</span>
          <span className="text-4xl font-black text-black tracking-tighter">{user.reputationScore}</span>
        </div>
        <div className="flex items-center justify-center w-full gap-3 mb-10 max-w-sm">
          <button className="bg-black text-white py-3 px-6 rounded-xl text-sm font-bold flex-1 shadow-lg hover:opacity-90 transition">Forge Bond</button>
          <button className="bg-white text-black border border-gray-200 py-3 px-6 rounded-xl text-sm font-bold flex-1 shadow-sm hover:bg-gray-50 transition">Feedback</button>
        </div>
        <div className="flex justify-between w-full max-w-sm px-4 text-center mb-10 border-t border-b border-gray-100 py-4">
          <div><span className="block text-xl font-bold">{user.moments}</span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Moments</span></div>
          <div><span className="block text-xl font-bold">{user.supporters}</span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Supporters</span></div>
          <div><span className="block text-xl font-bold">{user.interests}</span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Interests</span></div>
        </div>
      </div>
      <div className="px-4 pb-3 font-bold text-lg">Recent Moments</div>
      <div className="grid grid-cols-3 gap-1 px-4 mb-10">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-gray-100 rounded-md overflow-hidden hover:opacity-90 cursor-pointer transition relative">
            {post.reputationGain < 0 && <div className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"><AlertTriangle className="w-3 h-3" /></div>}
            <img src={post.image} className={`w-full h-full object-cover ${post.reputationGain < 0 ? 'grayscale contrast-125' : ''}`} alt="moment" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Upload Page ---
const UploadPage = ({ onUploadComplete, currentUser }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [caption, setCaption] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_key') || '');

  useEffect(() => { if (apiKey) localStorage.setItem('groq_key', apiKey); }, [apiKey]);
  useEffect(() => { if (file && apiKey && !analysis && !analyzing) runAgentAnalysis(); }, [file, apiKey]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); setAnalysis(null); }
  };

  const runAgentAnalysis = async () => {
    if (!file || !apiKey) return;
    setAnalyzing(true);
    try {
      let frames = [];
      const isVideo = file.type.startsWith('video');
      if (isVideo) frames = await extractFramesFromVideo(file);
      else frames = [await fileToBase64(file)];

      const historySummary = currentUser.contentVector || "New user";
      const currentStreak = currentUser.consistencyStreak || 0;

      const contentPayload = [
        { type: "text", text: `You are the 'Thrryv Guardian'. 
        CONTEXT: User has a streak of ${currentStreak} good posts. History keywords: "${historySummary}".
        
        TASK: Analyze this NEW content.
        1. CRITICAL: First, check for Misinformation, Deepfakes, Hate Speech, or Spam.
        2. IF UNSAFE/MISINFO: Override all history. Mark is_safe=false immediately. Ignore their streak.
        3. IF SAFE: Compare keywords to history. If matches well, give Consistency Bonus.
        
        Return JSON: { 
            "safety_check": { "is_safe": boolean, "reason": "string" }, 
            "quality_score": { "total": 0-100 }, 
            "content_vector": "keywords of this image",
            "coach_feedback": "short feedback" 
        }` },
        ...frames.map(f => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${f}` } }))
      ];
      const result = await callGroq(apiKey, contentPayload);
      setAnalysis(result);
    } catch (error) { console.error(error); alert("Analysis failed. Check API Key."); } finally { setAnalyzing(false); }
  };

  const handlePost = async () => {
    if (!analysis || !currentUser) return;
    
    const isSafe = analysis.safety_check?.is_safe;
    
    let reputationGain = 0;
    const streak = currentUser.consistencyStreak || 0;

    if (isSafe) {
        const baseScore = Math.round((analysis.quality_score?.total || 50) / 10);
        const momentumBonus = Math.floor(streak / 3); 
        reputationGain = baseScore + momentumBonus;
    } else {
        reputationGain = -20; 
    }
    
    let finalImage = preview;
    try {
        if (file.type.startsWith('video')) {
            // Save full video data
            const b64 = await fileToBase64(file);
            finalImage = `data:${file.type};base64,${b64}`;
        } else {
            const b64 = await fileToBase64(file);
            finalImage = `data:${file.type};base64,${b64}`;
        }
    } catch (e) { console.error("Image conversion failed", e); }

    const newPost = {
      username: currentUser.username,
      avatar: currentUser.avatar,
      userScore: currentUser.reputationScore + reputationGain,
      image: finalImage,
      caption: caption,
      reputationGain: reputationGain,
      vectorTags: analysis.content_vector,
      type: file.type.startsWith('video') ? 'video' : 'image',
    };
    LocalDB.addPost(newPost);
    onUploadComplete();
  };

  return (
    <div className="w-full max-w-xl mx-auto min-h-screen pt-10 px-6 flex flex-col font-sans pb-20 md:pb-0">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-3 tracking-tighter">Verify Experience</h2>
        <div className="flex justify-center items-center gap-3 mb-6 bg-gray-50 py-2 px-5 rounded-full w-fit mx-auto border border-gray-100">
           <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
             <img src={currentUser?.avatar} className="w-full h-full object-cover" alt="me"/>
           </div>
           <span className="text-sm font-bold">{currentUser?.username}</span>
        </div>
        <h3 className="text-xl font-bold leading-tight text-gray-800 px-4">Upload your proof to earn reputation</h3>
      </div>

      {!apiKey && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
           <p className="text-xs text-red-500 font-bold mb-2 uppercase tracking-wide">⚠️ API Key Required for Agent</p>
           <input type="password" placeholder="Paste Groq API Key Here..." className="w-full bg-white p-3 rounded-lg text-sm outline-none border border-red-200 focus:border-red-400 transition" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
      )}

      <div className="flex-1">
        {!preview ? (
          <div className="w-full aspect-[4/3] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer relative hover:bg-gray-100 hover:border-gray-400 transition-all group">
             <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-50" />
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlusSquare className="w-7 h-7 text-black" />
             </div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-black transition">Upload Evidence</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden relative shadow-lg border border-gray-100">
                {file.type.startsWith('video') ? <video src={preview} className="w-full h-full object-cover" /> : <img src={preview} className="w-full h-full object-cover" alt="prev" />}
                <button onClick={() => {setPreview(null); setFile(null); setAnalysis(null);}} className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black transition backdrop-blur-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 focus-within:border-black focus-within:ring-1 focus-within:ring-black/5 transition">
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full bg-transparent text-sm outline-none resize-none h-24 placeholder-gray-400 font-medium text-lg" placeholder="What is the story behind this?" />
              <div className="text-right text-[10px] font-bold text-gray-400 mt-2">0/300</div>
            </div>
            {analyzing ? (
               <div className="flex flex-col items-center justify-center p-8 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl border border-gray-100"><Loader2 className="w-8 h-8 animate-spin mb-3 text-black" /> AGENT ANALYZING HISTORY & CONTENT...</div>
            ) : analysis ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-in fade-in zoom-in duration-300">
                 <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Agent Verdict</span>
                    {analysis.safety_check?.is_safe ? <span className="text-green-700 text-[10px] font-black flex items-center bg-green-100 px-3 py-1 rounded-full tracking-wide"><CheckCircle className="w-3 h-3 mr-1.5"/> APPROVED</span> : <span className="text-red-700 text-[10px] font-black flex items-center bg-red-100 px-3 py-1 rounded-full tracking-wide"><AlertTriangle className="w-3 h-3 mr-1.5"/> FLAGGED</span>}
                 </div>
                 <div className="flex items-end justify-between mb-4">
                    <span className="font-bold text-sm text-gray-600">Quality Score</span>
                    <span className="font-black text-5xl text-black">{analysis.quality_score?.total || 0}</span>
                 </div>
                 <div className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-xl border-l-4 border-black">"{analysis.coach_feedback}"</div>
                 
                 {/* WARNING for Unsafe Content */}
                 {!analysis.safety_check?.is_safe && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-800 font-bold">Warning: Posting this will break your streak and reduce your score by 20+ points.</div>
                    </div>
                 )}
              </div>
            ) : null}
            {analysis && (
              <button onClick={handlePost} className={`w-full font-black py-5 rounded-2xl shadow-xl uppercase text-sm tracking-widest transition transform active:scale-[0.98] ${analysis.safety_check?.is_safe ? 'bg-black text-white hover:bg-gray-900' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {analysis.safety_check?.is_safe ? "Submit Reflection" : "Post Anyway (-20 Rep)"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Navbar (Responsive) ---
const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 px-6 py-4 flex justify-between items-center md:static md:w-64 md:h-screen md:border-t-0 md:border-r md:flex-col md:justify-start md:items-start md:px-8 md:py-10 md:space-y-8">
      <div className="hidden md:flex items-center gap-3 mb-8 px-4">
         <div className="w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center"><div className="w-4 h-4 border-[3px] border-black rounded-full"></div></div>
         <span className="text-xl font-black tracking-tighter italic">THRRYV</span>
      </div>
      <button onClick={() => setActiveTab('feed')} className={`flex md:flex-row flex-col items-center md:space-x-4 group ${activeTab === 'feed' ? 'text-black' : 'text-gray-400 hover:text-gray-600'} md:px-4 md:py-2 md:w-full md:hover:bg-gray-50 md:rounded-xl transition`}>
        <Home className={`w-6 h-6 stroke-[2] mb-1 md:mb-0 transition-transform group-active:scale-90`} /><span className="text-[10px] md:text-base font-bold">Home</span>
      </button>
      <button onClick={() => setActiveTab('inbox')} className={`flex md:flex-row flex-col items-center md:space-x-4 group ${activeTab === 'inbox' ? 'text-black' : 'text-gray-400 hover:text-gray-600'} md:px-4 md:py-2 md:w-full md:hover:bg-gray-50 md:rounded-xl transition`}>
        <Mail className="w-6 h-6 stroke-[2] mb-1 md:mb-0" /><span className="text-[10px] md:text-base font-bold">Inbox</span>
      </button>
      <button onClick={() => setActiveTab('upload')} className={`flex md:flex-row flex-col items-center md:space-x-4 group ${activeTab === 'upload' ? 'text-black' : 'text-gray-400 hover:text-gray-600'} md:px-4 md:py-2 md:w-full md:hover:bg-gray-50 md:rounded-xl transition`}>
        <PlusSquare className={`w-7 h-7 stroke-[2] mb-1 md:mb-0 transition-transform group-active:scale-90`} /><span className="text-[10px] md:text-base font-bold">Create</span>
      </button>
      <button onClick={() => setActiveTab('explore')} className={`flex md:flex-row flex-col items-center md:space-x-4 group ${activeTab === 'explore' ? 'text-black' : 'text-gray-400 hover:text-gray-600'} md:px-4 md:py-2 md:w-full md:hover:bg-gray-50 md:rounded-xl transition`}>
        <Search className={`w-6 h-6 stroke-[2] mb-1 md:mb-0 transition-transform group-active:scale-90`} /><span className="text-[10px] md:text-base font-bold">Explore</span>
      </button>
      <button onClick={() => setActiveTab('profile')} className={`flex md:flex-row flex-col items-center md:space-x-4 group ${activeTab === 'profile' ? 'text-black' : 'text-gray-400 hover:text-gray-600'} md:px-4 md:py-2 md:w-full md:hover:bg-gray-50 md:rounded-xl transition`}>
        <User className={`w-6 h-6 stroke-[2] mb-1 md:mb-0 transition-transform group-active:scale-90`} /><span className="text-[10px] md:text-base font-bold">Profile</span>
      </button>
      <div className="hidden md:block mt-auto pt-10 border-t border-gray-100 w-full px-4">
         <button className="flex items-center space-x-3 text-gray-400 hover:text-red-500 transition w-full"><LogOut className="w-5 h-5 stroke-[2]" /><span className="font-bold">Sign Out</span></button>
      </div>
    </div>
  );
};

// --- App Shell ---
export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [user, setUser] = useState(null);
  useEffect(() => { 
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const init = async () => {
      try { LocalDB.init(); const u = LocalDB.getCurrentUser(); setUser(u); } catch(e) { console.log("Connecting to server..."); }
    };
    init();
  }, [activeTab]);
  
  return (
    <div className="bg-white min-h-screen font-[Inter] antialiased flex flex-col md:flex-row">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex justify-center bg-white min-h-screen">
        <div className="w-full max-w-2xl border-x border-gray-100 min-h-screen pb-24 md:pb-0">
          {activeTab === 'feed' && <FeedPage currentUser={user} />}
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'upload' && <UploadPage currentUser={user} onUploadComplete={() => setActiveTab('profile')} />}
          {activeTab === 'profile' && <ProfilePage currentUser={user} />}
          {activeTab === 'inbox' && <InboxPage />}
        </div>
      </main>
      <div className="hidden lg:block w-80 p-8 border-l border-gray-100 h-screen sticky top-0">
         <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Trending Now</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between"><span className="text-sm font-medium">#AgenticAI</span><TrendingUp className="w-4 h-4 text-gray-400" /></div>
               <div className="flex items-center justify-between"><span className="text-sm font-medium">#MumbaiHacks</span><TrendingUp className="w-4 h-4 text-gray-400" /></div>
               <div className="flex items-center justify-between"><span className="text-sm font-medium">#Design</span><TrendingUp className="w-4 h-4 text-gray-400" /></div>
            </div>
         </div>
         <div className="text-xs text-gray-400 px-2">© 2025 Thrryv Inc.</div>
      </div>
    </div>
  );
}