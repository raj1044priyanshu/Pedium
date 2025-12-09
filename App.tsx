import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Write from './pages/Write';
import ArticleView from './pages/ArticleView';
import Profile from './pages/Profile';
import { appwriteService } from './services/appwriteService';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await appwriteService.getCurrentUser();
        
        // Auto-generate avatar for users (e.g. Google Login) who don't have one yet
        if (userData && (!userData.prefs || !userData.prefs.avatar)) {
             const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
             try {
                 await appwriteService.updatePrefs({ avatar: avatarUrl });
                 // Manually update local state to reflect change immediately
                 if (!userData.prefs) userData.prefs = {};
                 userData.prefs.avatar = avatarUrl;
             } catch (prefError) {
                 console.warn("Failed to auto-set avatar preference", prefError);
             }
        }

        setUser(userData as unknown as UserProfile);

        // Clean up Appwrite OAuth parameters from URL after successful login
        const params = new URLSearchParams(window.location.search);
        if (params.get('project') || params.get('key') || params.get('secret')) {
             // Keep the path and hash, but remove the query params
             window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }

      } catch (e) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Removed the blocking if(loading) return ... to allow immediate render of Home
  
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-[#0B1120] font-sans text-brand-black dark:text-white transition-colors duration-300">
        {/* Navbar now handles the authLoading state internally to show/hide elements cleanly */}
        <Navbar user={user} setUser={setUser} authLoading={authLoading} />
        <main>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup setUser={setUser} /> : <Navigate to="/" />} />
            {/* Protected Routes */}
            <Route path="/write" element={user ? <Write user={user} /> : (authLoading ? <div className="h-screen flex items-center justify-center">Loading...</div> : <Navigate to="/login" />)} />
            <Route path="/article/:id" element={<ArticleView user={user} />} />
            
            {/* "My Profile" Route */}
            <Route path="/profile" element={user ? <Profile currentUser={user} /> : (authLoading ? <div className="h-screen flex items-center justify-center">Loading...</div> : <Navigate to="/login" />)} />
            
            {/* "Public Profile" Route */}
            <Route path="/user/:userId" element={<Profile currentUser={user} />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;