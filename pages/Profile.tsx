import React, { useEffect, useState } from 'react';
import { appwriteService } from '../services/appwriteService';
import { Article, UserProfile } from '../types';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.$id) {
        appwriteService.getUserArticles(user.$id)
            .then(res => setArticles(res.documents as unknown as Article[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-brand-light dark:bg-[#0B1120] transition-colors duration-300">
        
        {/* Header Gradient */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-brand-accent to-blue-600 dark:from-gray-900 dark:to-gray-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
            <div className="bg-white dark:bg-[#151f32] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 mb-12 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#151f32] bg-brand-accent text-white flex items-center justify-center text-5xl font-serif font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">@{user.name.toLowerCase().replace(/\s/g, '')} · Joined {new Date(user.registration).getFullYear() || 'Recently'}</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-sm hover:shadow-lg transition transform hover:-translate-y-0.5">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-2/3">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Your Stories</h2>
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                            {articles.length} Published
                        </span>
                    </div>

                    {loading ? (
                         <div className="space-y-6">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-[#151f32] h-40 rounded-xl"></div>
                            ))}
                         </div>
                    ) : (
                        <div className="space-y-6">
                            {articles.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-[#151f32] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                   <div className="text-4xl mb-4">✍️</div>
                                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No stories yet</h3>
                                   <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Share your ideas with the world. Your first masterpiece is waiting.</p>
                                   <Link to="/write" className="text-brand-accent font-bold hover:underline">Start writing now</Link>
                                </div>
                            ) : (
                                articles.map(article => (
                                    <Link key={article.$id} to={`/article/${article.$id}`} className="block group bg-white dark:bg-[#151f32] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-brand-accent/30 dark:hover:border-brand-accent/30 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span>{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    <span>•</span>
                                                    <span className="uppercase tracking-wider">{article.tags?.[0] || 'Article'}</span>
                                                </div>
                                                <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-3 group-hover:text-brand-accent transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                                                    {article.summary}
                                                </p>
                                                <div className="flex items-center text-sm font-medium text-brand-accent">
                                                    Read story &rarr;
                                                </div>
                                            </div>
                                            {article.coverImageId && (
                                                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                    <img 
                                                        src={appwriteService.getFilePreview(article.coverImageId).toString()} 
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:w-1/3 space-y-8">
                     <div className="bg-white dark:bg-[#151f32] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">About</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            Writer on Pedium. Sharing insights on technology, design, and life.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>Earth, Milky Way</span>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-brand-dark to-black p-6 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Pedium Premium</h3>
                            <p className="text-gray-300 text-sm mb-4">Upgrade to access exclusive features and analytics.</p>
                            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold w-full">Coming Soon</button>
                        </div>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-accent/30 rounded-full blur-xl"></div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Profile;