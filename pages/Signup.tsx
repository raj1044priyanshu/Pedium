import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { appwriteService } from '../services/appwriteService';
import { UserProfile } from '../types';

interface SignupProps {
  setUser: (user: UserProfile) => void;
}

const Signup: React.FC<SignupProps> = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await appwriteService.register(email, password, name);
      const user = await appwriteService.getCurrentUser();
      setUser(user as unknown as UserProfile);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-brand-darker px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
           <h2 className="text-4xl font-serif font-medium text-gray-900 dark:text-white">Join Pedium</h2>
           <p className="mt-2 text-gray-600 dark:text-gray-400">Create an account to start writing.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white dark:bg-brand-card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Email address</label>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white dark:bg-brand-card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white dark:bg-brand-card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm text-center font-medium">
                  {error}
              </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white dark:text-brand-darker bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition shadow-lg"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
          <div className="text-center text-sm mt-4">
             <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
             <Link to="/login" className="font-bold text-brand-accent hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;