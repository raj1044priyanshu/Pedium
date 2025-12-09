import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { appwriteService } from '../services/appwriteService';
import { UserProfile } from '../types';

interface LoginProps {
  setUser: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await appwriteService.login(email, password);
      const user = await appwriteService.getCurrentUser();
      setUser(user as unknown as UserProfile);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      try {
          await appwriteService.loginWithGoogle();
      } catch (e: any) {
          console.error(e);
          // Help the user debug the Appwrite Platform error
          if (e.message && (e.message.includes("Invalid success URL") || e.message.includes("Invalid failure URL"))) {
             setError(`Configuration Error: You must add "${window.location.hostname}" as a Web Platform in your Appwrite Console.`);
          } else {
             setError(e.message || "Google Login failed");
          }
      }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-white dark:bg-brand-darker px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
           <h2 className="text-4xl font-serif font-medium text-gray-900 dark:text-white">Welcome back</h2>
           <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to access your account.</p>
        </div>
        
        <div className="mt-8 space-y-6">
            <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-brand-card hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white font-medium"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-brand-darker text-gray-500">Or sign in with email</span>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2 ml-1">Email address</label>
                    <input
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-400 dark:border-gray-600 rounded-lg placeholder-gray-500 text-gray-900 bg-white dark:text-white dark:bg-brand-card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2 ml-1">Password</label>
                    <input
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-400 dark:border-gray-600 rounded-lg placeholder-gray-500 text-gray-900 bg-white dark:text-white dark:bg-brand-card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm text-center font-medium break-words">
                    {error}
                </div>
            )}

            <div>
                <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white dark:text-brand-darker bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition shadow-lg"
                >
                {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
            <div className="text-center text-sm mt-4">
                <span className="text-gray-600 dark:text-gray-400">No account? </span>
                <Link to="/signup" className="font-bold text-brand-accent hover:underline">Create one</Link>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;