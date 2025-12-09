import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appwriteService } from '../services/appwriteService';
import { Article, UserProfile } from '../types';
import { CATEGORIES } from '../constants';
import { SetupGuide } from '../components/SetupGuide';
import { ThreeBackground } from '../components/ThreeBackground';

interface HomeProps {
  user: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(false);
    try {
      let queries: string[] = [];
      const response = await appwriteService.getArticles(queries);
      let docs = response.documents as unknown as Article[];

      if (activeCategory) {
        docs = docs.filter(d => d.tags && d.tags.includes(activeCategory));
      }
      
      setArticles(docs);
    } catch (e) {
      console.error("Home fetch error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (article: Article) => {
      if (article.coverImageId) {
          return appwriteService.getFilePreview(article.coverImageId).toString();
      }
      return `https://picsum.photos/seed/${article.$id}/800/600`;
  };

  if (error) return <SetupGuide onRetry={fetchArticles} />;

  return (
    <div className="relative min-h-screen bg-brand-light dark:bg-brand-darker transition-colors duration-300">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Hero Section */}
        {!user && (
           <div className="text-center py-20 mb-16 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white mb-6 tracking-tight">
                  Ideas worth <span className="text-brand-accent italic">amplifying.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  A premium space for writers, thinkers, and creators to share knowledge without noise.
              </p>
              <Link to="/signup" className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition transform shadow-xl">
                  Start Reading
              </Link>
           </div>
        )}

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Feed */}
          <div className="lg:w-2/3">
             <div className="flex items-center space-x-6 overflow-x-auto pb-4 mb-10 border-b border-gray-200 dark:border-gray-800 no-scrollbar">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={`text-sm font-bold whitespace-nowrap pb-2 transition-colors ${activeCategory === null ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  For you
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm font-bold whitespace-nowrap pb-2 transition-colors ${activeCategory === cat ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>

             {loading ? (
               <div className="space-y-12">
                 {[1,2,3].map(i => (
                   <div key={i} className="animate-pulse flex flex-col gap-4">
                     <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                     <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                     <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="space-y-16">
                 {filteredArticles.length === 0 ? (
                   <div className="text-center py-20 bg-gray-50 dark:bg-brand-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                       <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">It's quiet here.</h3>
                       <p className="text-gray-500 mb-6">Be the first to write a story in this category.</p>
                       <Link to="/write" className="text-brand-accent font-bold hover:underline">Write a story</Link>
                   </div>
                 ) : (
                   filteredArticles.map((article) => (
                     <article key={article.$id} className="group cursor-pointer flex flex-col md:flex-row gap-8 items-start border-b border-gray-100 dark:border-gray-800 pb-12 last:border-0" onClick={() => window.location.hash = `#/article/${article.$id}`}>
                        <div className="flex-1 order-2 md:order-1">
                          <div className="flex items-center space-x-2 mb-3">
                             <img 
                               src={`https://ui-avatars.com/api/?name=${article.authorName}&background=0d9488&color=fff`} 
                               alt="Author" 
                               className="w-6 h-6 rounded-full"
                             />
                             <span className="text-sm font-semibold text-gray-900 dark:text-white">{article.authorName}</span>
                             <span className="text-gray-400 text-sm">·</span>
                             <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h2 className="text-2xl font-bold font-serif mb-3 text-gray-900 dark:text-white group-hover:text-brand-accent transition-colors leading-tight">
                            {article.title}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300 font-serif mb-4 line-clamp-3 leading-relaxed">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                                 <span className="bg-gray-100 dark:bg-brand-card text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-transparent dark:border-gray-700">
                                   {article.tags?.[0] || 'General'}
                                 </span>
                                 <span className="text-xs text-gray-400 font-medium">
                                   {Math.ceil(article.content.length / 2000)} min read
                                 </span>
                             </div>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-brand-accent transition-transform group-hover:translate-x-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                             </svg>
                          </div>
                        </div>
                        <div className="w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden order-1 md:order-2 shadow-sm group-hover:shadow-md transition bg-gray-100 dark:bg-brand-card">
                          <img 
                            src={getImageUrl(article)} 
                            alt="Cover" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                          />
                        </div>
                     </article>
                   ))
                 )}
               </div>
             )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-1/3 pl-8 h-fit sticky top-24">
             <div className="mb-10">
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="Search stories..." 
                   className="w-full bg-white dark:bg-brand-card border border-gray-200 dark:border-gray-700 rounded-full py-3 px-6 pl-12 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition shadow-sm text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-brand-accent transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
             </div>

             <h3 className="font-bold text-xs uppercase tracking-widest mb-6 text-gray-900 dark:text-white">Discover Topics</h3>
             <div className="flex flex-wrap gap-3">
               {CATEGORIES.map(tag => (
                 <button 
                  key={tag} 
                  onClick={() => setActiveCategory(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === tag ? 'bg-brand-accent text-white' : 'bg-gray-100 dark:bg-brand-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700'}`}
                 >
                   {tag}
                 </button>
               ))}
             </div>

             <div className="mt-12 p-6 bg-brand-light dark:bg-brand-card/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-serif font-bold text-lg mb-2 text-gray-900 dark:text-white">Write on Pedium</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Share your knowledge with the world. AI tools included.</p>
                <Link to="/write" className="text-brand-accent font-bold text-sm hover:underline">Start writing &rarr;</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;