import React, { useEffect, useState } from 'react';
import { appwriteService } from '../services/appwriteService';
import { Article, UserProfile } from '../types';
import { Link, useParams, useLocation } from 'react-router-dom';

interface ProfileProps {
  currentUser: UserProfile | null;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const { userId } = useParams(); // If present, we are viewing someone else
  const location = useLocation(); // To retrieve passed state (authorName) if available
  
  // Determine who we are looking at
  const targetUserId = userId || currentUser?.$id;
  const isOwnProfile = currentUser && targetUserId === currentUser.$id;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState<string>(isOwnProfile ? currentUser.name : (location.state?.authorName || 'User'));
  
  // Social Stats
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Interaction State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);

  useEffect(() => {
    if (targetUserId) {
        loadProfileData(targetUserId);
    }
  }, [targetUserId, currentUser]);

  const loadProfileData = async (uid: string) => {
        setLoading(true);
        try {
            // 1. Fetch Articles
            const res = await appwriteService.getUserArticles(uid);
            const docs = res.documents as unknown as Article[];
            setArticles(docs);
            
            // If we didn't have the name from state/props, try to get it from their latest article
            if (!isOwnProfile && !location.state?.authorName && docs.length > 0) {
                setProfileName(docs[0].authorName);
            }

            // 2. Fetch Stats
            const followers = await appwriteService.getFollowersCount(uid);
            const following = await appwriteService.getFollowingCount(uid);
            setFollowersCount(followers);
            setFollowingCount(following);

            // 3. Check Follow Status (only if viewing someone else)
            if (!isOwnProfile && currentUser) {
                const followRecord = await appwriteService.isFollowing(currentUser.$id, uid);
                if (followRecord) {
                    setIsFollowing(true);
                    setFollowDocId(followRecord.$id);
                } else {
                    setIsFollowing(false);
                    setFollowDocId(null);
                }
            }
        } catch (e) {
            console.error("Profile load error", e);
        } finally {
            setLoading(false);
        }
  };

  const handleFollowToggle = async () => {
      if (!currentUser || !targetUserId) return;

      // Optimistic Update
      const previousState = isFollowing;
      const previousCount = followersCount;
      
      setIsFollowing(!previousState);
      setFollowersCount(previousState ? previousCount - 1 : previousCount + 1);

      try {
          if (previousState && followDocId) {
              await appwriteService.unfollowUser(followDocId);
              setFollowDocId(null);
          } else {
              const res = await appwriteService.followUser(currentUser.$id, targetUserId);
              setFollowDocId(res.$id);
          }
      } catch (e) {
          console.error("Follow action failed", e);
          // Revert
          setIsFollowing(previousState);
          setFollowersCount(previousCount);
      }
  };

  if (!targetUserId) return <div className="min-h-screen flex items-center justify-center dark:text-white">User not found.</div>;

  return (
    <div className="min-h-screen bg-brand-light dark:bg-[#0B1120] transition-colors duration-300">
        
        {/* Header Gradient */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-brand-accent to-blue-600 dark:from-gray-900 dark:to-gray-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
            <div className="bg-white dark:bg-[#151f32] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 mb-12 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#151f32] bg-brand-accent text-white flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
                        {profileName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{profileName}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {isOwnProfile && currentUser ? (
                                <span>@{currentUser.name.toLowerCase().replace(/\s/g, '')} · Joined {new Date(currentUser.registration).getFullYear() || 'Recently'}</span>
                            ) : (
                                <span>Author on Pedium</span>
                            )}
                        </p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-sm font-medium">
                            <div className="flex flex-col md:flex-row items-center gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">{followersCount}</span>
                                <span className="text-gray-500 dark:text-gray-400">Followers</span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">{followingCount}</span>
                                <span className="text-gray-500 dark:text-gray-400">Following</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        {isOwnProfile ? (
                            <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-sm hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Edit Profile
                            </button>
                        ) : (
                            currentUser ? (
                                <button 
                                    onClick={handleFollowToggle}
                                    className={`px-8 py-2.5 rounded-full font-bold text-sm transition transform hover:-translate-y-0.5 shadow-md ${
                                        isFollowing 
                                        ? 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300' 
                                        : 'bg-brand-accent text-white border-2 border-transparent'
                                    }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            ) : (
                                <Link to="/login" className="px-6 py-2 bg-brand-accent text-white rounded-full font-bold text-sm">
                                    Sign in to Follow
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-2/3">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                            {isOwnProfile ? "Your Stories" : "Published Stories"}
                        </h2>
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                            {articles.length}
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
                                   <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                       {isOwnProfile ? "Share your ideas with the world." : "This user hasn't published anything yet."}
                                   </p>
                                   {isOwnProfile && (
                                       <Link to="/write" className="text-brand-accent font-bold hover:underline">Start writing now</Link>
                                   )}
                                </div>
                            ) : (
                                articles.map(article => (
                                    <Link key={article.$id} to={`/article/${article.$id}`} className="block group bg-white dark:bg-[#151f32] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-brand-accent/30 dark:hover:border-brand-accent/30 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span>{new Date(article.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    <span>•</span>
                                                    <span className="uppercase tracking-wider">{article.tags?.[0] || 'Article'}</span>
                                                </div>
                                                <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-3 group-hover:text-brand-accent transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                                                    {article.summary}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm font-medium">
                                                    <span className="text-brand-accent">Read story &rarr;</span>
                                                    {article.views !== undefined && (
                                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {article.views} views
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {article.coverImageId && (
                                                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                    <img 
                                                        src={appwriteService.getFileView(article.coverImageId).toString()} 
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
                </div>
            </div>
        </div>
    </div>
  );
};

export default Profile;