import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  login: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  subscribers: number;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  duration: string;
  category: string;
  subtitles?: string;
}

export interface Comment {
  id: string;
  videoId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  videos: Video[];
  comments: Comment[];
  theme: 'dark' | 'light';
  history: string[];
  favorites: string[];
  subscriptions: string[];
  reactions: Record<string, 'like' | 'dislike' | null>;
  login: (loginVal: string, password: string) => boolean;
  register: (loginVal: string, email: string, name: string, password: string) => boolean;
  switchAccount: (userId: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  uploadVideo: (video: Omit<Video, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'views' | 'likes' | 'dislikes' | 'createdAt'>) => void;
  deleteVideo: (id: string) => void;
  addComment: (videoId: string, text: string) => void;
  deleteComment: (id: string) => void;
  toggleFavorite: (videoId: string) => void;
  toggleSubscription: (authorId: string) => void;
  react: (videoId: string, reaction: 'like' | 'dislike') => void;
  addView: (videoId: string) => void;
  toggleTheme: () => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  users: 'yuvist_users',
  videos: 'yuvist_videos',
  comments: 'yuvist_comments',
  currentUser: 'yuvist_current_user',
  theme: 'yuvist_theme',
  history: 'yuvist_history',
  favorites: 'yuvist_favorites',
  subscriptions: 'yuvist_subscriptions',
  reactions: 'yuvist_reactions',
  passwords: 'yuvist_passwords',
};

function load<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}
function save(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load(STORAGE_KEYS.users, []));
  const [passwords, setPasswords] = useState<Record<string, string>>(() => load(STORAGE_KEYS.passwords, {}));
  const [videos, setVideos] = useState<Video[]>(() => load(STORAGE_KEYS.videos, []));
  const [comments, setComments] = useState<Comment[]>(() => load(STORAGE_KEYS.comments, []));
  const [user, setUser] = useState<User | null>(() => load(STORAGE_KEYS.currentUser, null));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => load(STORAGE_KEYS.theme, 'dark'));
  const [history, setHistory] = useState<string[]>(() => load(STORAGE_KEYS.history, []));
  const [favorites, setFavorites] = useState<string[]>(() => load(STORAGE_KEYS.favorites, []));
  const [subscriptions, setSubscriptions] = useState<string[]>(() => load(STORAGE_KEYS.subscriptions, []));
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike' | null>>(() => load(STORAGE_KEYS.reactions, {}));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    save(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => { save(STORAGE_KEYS.users, users); }, [users]);
  useEffect(() => { save(STORAGE_KEYS.passwords, passwords); }, [passwords]);
  useEffect(() => { save(STORAGE_KEYS.videos, videos); }, [videos]);
  useEffect(() => { save(STORAGE_KEYS.comments, comments); }, [comments]);
  useEffect(() => { save(STORAGE_KEYS.currentUser, user); }, [user]);
  useEffect(() => { save(STORAGE_KEYS.history, history); }, [history]);
  useEffect(() => { save(STORAGE_KEYS.favorites, favorites); }, [favorites]);
  useEffect(() => { save(STORAGE_KEYS.subscriptions, subscriptions); }, [subscriptions]);
  useEffect(() => { save(STORAGE_KEYS.reactions, reactions); }, [reactions]);

  const login = (loginVal: string, password: string): boolean => {
    const found = users.find(u => u.login === loginVal || u.email === loginVal);
    if (!found || passwords[found.id] !== password) return false;
    setUser(found);
    return true;
  };

  const register = (loginVal: string, email: string, name: string, password: string): boolean => {
    if (users.find(u => u.login === loginVal || u.email === email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      login: loginVal,
      email,
      name,
      avatar: '',
      bio: '',
      subscribers: 0,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setPasswords(prev => ({ ...prev, [newUser.id]: password }));
    setUser(newUser);
    return true;
  };

  const switchAccount = (userId: string, password: string): boolean => {
    const found = users.find(u => u.id === userId);
    if (!found || passwords[found.id] !== password) return false;
    setUser(found);
    setHistory([]);
    setFavorites([]);
    setSubscriptions([]);
    setReactions({});
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    setVideos(prev => prev.map(v => v.authorId === user.id
      ? { ...v, authorName: updated.name, authorAvatar: updated.avatar }
      : v
    ));
    setComments(prev => prev.map(c => c.authorId === user.id
      ? { ...c, authorName: updated.name, authorAvatar: updated.avatar }
      : c
    ));
  };

  const uploadVideo = (video: Omit<Video, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'views' | 'likes' | 'dislikes' | 'createdAt'>) => {
    if (!user) return;
    const newVideo: Video = {
      ...video,
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      views: 0,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
    };
    setVideos(prev => [newVideo, ...prev]);
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setComments(prev => prev.filter(c => c.videoId !== id));
    setFavorites(prev => prev.filter(fid => fid !== id));
    setHistory(prev => prev.filter(hid => hid !== id));
  };

  const addComment = (videoId: string, text: string) => {
    if (!user) return;
    const c: Comment = {
      id: Date.now().toString(),
      videoId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, c]);
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const toggleSubscription = (authorId: string) => {
    setSubscriptions(prev =>
      prev.includes(authorId) ? prev.filter(id => id !== authorId) : [...prev, authorId]
    );
  };

  const react = (videoId: string, reaction: 'like' | 'dislike') => {
    const prev = reactions[videoId];
    setReactions(r => ({ ...r, [videoId]: prev === reaction ? null : reaction }));
    setVideos(vids => vids.map(v => {
      if (v.id !== videoId) return v;
      let likes = v.likes;
      let dislikes = v.dislikes;
      if (prev === 'like') likes--;
      if (prev === 'dislike') dislikes--;
      if (reaction !== prev) {
        if (reaction === 'like') likes++;
        else dislikes++;
      }
      return { ...v, likes, dislikes };
    }));
  };

  const addView = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, views: v.views + 1 } : v));
    setHistory(prev => {
      const filtered = prev.filter(id => id !== videoId);
      return [videoId, ...filtered].slice(0, 100);
    });
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const deleteAccount = () => {
    if (!user) return;
    setVideos(prev => prev.filter(v => v.authorId !== user.id));
    setComments(prev => prev.filter(c => c.authorId !== user.id));
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setPasswords(prev => { const copy = { ...prev }; delete copy[user.id]; return copy; });
    setUser(null);
    setHistory([]);
    setFavorites([]);
    setSubscriptions([]);
    setReactions({});
  };

  return (
    <AuthContext.Provider value={{
      user, users, videos, comments, theme, history, favorites, subscriptions, reactions,
      login, register, switchAccount, logout, updateProfile, uploadVideo, deleteVideo,
      addComment, deleteComment, toggleFavorite, toggleSubscription,
      react, addView, toggleTheme, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
