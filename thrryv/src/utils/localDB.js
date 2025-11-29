const LocalDB = {
  init: () => {
    if (!localStorage.getItem('thrryv_users')) {
      const defaultUser = {
        id: 'u1',
        username: 'Julie Murray',
        handle: '@juliem',
        avatar: 'https://i.pravatar.cc/150?img=9',
        bio: "I don't wait for opportunities, I make them!",
        reputationScore: 750,
        moments: 12,
        supporters: 8405,
        interests: 450
      };
      localStorage.setItem('thrryv_users', JSON.stringify([defaultUser]));
      localStorage.setItem('thrryv_current_user_id', 'u1');
    }

    if (!localStorage.getItem('thrryv_posts')) {
      const defaultPosts = [
        {
          id: 'p1',
          userId: 'u2',
          username: 'Barbera Smith',
          userScore: 764,
          avatar: 'https://i.pravatar.cc/150?img=5',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          caption: 'Absolutely loved the architecture of this building!',
          reputationGain: 5,
          likes: 42,
          type: 'image',
          timestamp: Date.now() - 10000000
        },
        {
          id: 'p2',
          userId: 'u3',
          username: 'Charlie Spencer',
          userScore: 537,
          avatar: 'https://i.pravatar.cc/150?img=11',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          caption: 'Starting a new project today, excited to see where it leads us!',
          reputationGain: 3,
          likes: 28,
          type: 'image',
          timestamp: Date.now() - 5000000
        }
      ];
      localStorage.setItem('thrryv_posts', JSON.stringify(defaultPosts));
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

  addPost: (post) => {
    const posts = JSON.parse(localStorage.getItem('thrryv_posts') || '[]');
    const newPost = { ...post, id: `p${Date.now()}`, timestamp: Date.now(), likes: 0 };
    posts.unshift(newPost);
    localStorage.setItem('thrryv_posts', JSON.stringify(posts));

    const users = JSON.parse(localStorage.getItem('thrryv_users') || '[]');
    const userIndex = users.findIndex(u => u.username === post.username);
    if (userIndex !== -1) {
      users[userIndex].reputationScore += (post.reputationGain || 0);
      users[userIndex].moments += 1;
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

export default LocalDB;