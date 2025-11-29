const API_URL = "http://localhost:3001";

export const API = {
  getCurrentUser: async (userId = 'u1') => {
    const res = await fetch(`${API_URL}/users/${userId}`);
    return res.json();
  },

  getAllPosts: async () => {
    const res = await fetch(`${API_URL}/posts`);
    return res.json();
  },

  addPost: async (post) => {
    const newPost = { ...post, id: `p${Date.now()}`, timestamp: Date.now(), likes: 0 };
    
    await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    return newPost;
  },

  likePost: async (postId) => {
    await fetch(`${API_URL}/posts/${postId}/like`, { method: 'POST' });
  }
};