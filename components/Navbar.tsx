import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { appwriteService } from '../services/appwriteService';

interface NavbarProps {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  authLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser, authLoading = false }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await appwriteService.logout();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  // Avatar Logic: Prefs > Initial
  const avatarSrc = user?.prefs?.avatar || null;

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-brand-dark/95 backdrop-blur-md z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="font-serif text-3xl font-bold tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-accent transition-colors">Pedium</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
               {darkMode ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
               )}
            </button>

            {authLoading ? (
               <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            ) : user ? (
              <>
                <Link to="/write" className="text-gray-500 dark:text-gray-300 hover:text-brand-accent dark:hover:text-brand-accent flex items-center space-x-2 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <span className="hidden sm:inline font-medium">Write</span>
                </Link>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none transition-transform hover:scale-105"
                  >
                     {avatarSrc ? (
                        <img src={avatarSrc} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-brand-dark shadow-md bg-white" />
                     ) : (
                        <div className="w-10 h-10 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white dark:border-brand-dark">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                     )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-brand-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 animate-fade-in origin-top-right">
                       <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                       </div>
                       <Link 
                          to="/profile" 
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                       <button 
                          onClick={handleLogout} 
                          className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          Sign out
                        </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-accent transition">Sign In</Link>
                <Link to="/signup" className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;