import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appwriteService } from '../services/appwriteService';
import { Article, UserProfile, Comment } from '../types';

interface ArticleViewProps {
  user: UserProfile | null;
}

const ArticleView: React.FC<ArticleViewProps> = ({ user }) => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Social State
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (id) {
        fetchArticleData(id);
    }
  }, [id]);

  const fetchArticleData = async (articleId: string) => {
      try {
          const doc = await appwriteService.getArticle(articleId);
          const articleData = doc as unknown as Article;
          
          setArticle(articleData);
          setViews(articleData.views || 0);
          setLikes(articleData.likedBy || []);

          if (articleData.coverImageId) {
             try {
                 const url = appwriteService.getFileView(articleData.coverImageId);
                 setCoverUrl(url.toString());
             } catch (e) { console.error("Cover image error", e); }
          }

          // View Counting Logic
          try {
              const viewedKey = 'pedium_viewed_articles';
              const viewedArticles = JSON.parse(localStorage.getItem(viewedKey) || '[]');
              
              if (!viewedArticles.includes(articleId)) {
                   // Only increment if not viewed locally on this device
                   await appwriteService.incrementView(articleId, articleData.views || 0);
                   
                   // Update LocalStorage
                   viewedArticles.push(articleId);
                   localStorage.setItem(viewedKey, JSON.stringify(viewedArticles));
                   
                   // Optimistically update local state for the UI
                   setViews((prev) => prev + 1);
              }
          } catch (storageError) {
              console.warn("Could not access localStorage for views", storageError);
          }

          // Fetch Comments
          const commentsRes = await appwriteService.getComments(articleId);
          setComments(commentsRes.documents as unknown as Comment[]);

          // Check Follow Status
          if (user && user.$id !== articleData.userId) {
              const followRecord = await appwriteService.isFollowing(user.$id, articleData.userId);
              if (followRecord) {
                  setIsFollowing(true);
                  setFollowDocId(followRecord.$id);
              }
          }

      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleLike = async () => {
      if (!user || !article) return alert("Please sign in to like.");
      
      // Optimistic Update
      const isLiked = likes.includes(user.$id);
      const newLikes = isLiked ? likes.filter(id => id !== user.$id) : [...likes, user.$id];
      setLikes(newLikes);

      try {
          await appwriteService.toggleLike(article.$id, likes, user.$id);
      } catch (e) {
          // Revert on error
          setLikes(likes);
          console.error("Like failed", e);
      }
  };

  const handleFollow = async () => {
      if (!user || !article) return alert("Please sign in to follow.");
      
      const targetUserId = article.userId;
      
      setIsFollowing(!isFollowing); // Optimistic

      try {
          if (isFollowing && followDocId) {
              await appwriteService.unfollowUser(followDocId);
              setFollowDocId(null);
          } else {
              const res = await appwriteService.followUser(user.$id, targetUserId);
              setFollowDocId(res.$id);
          }
      } catch (e) {
          setIsFollowing(isFollowing); // Revert
          console.error("Follow failed", e);
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !article || !newComment.trim()) return;

      const tempId = Date.now().toString();
      const optimisticComment: Comment = {
          $id: tempId,
          content: newComment,
          articleId: article.$id,
          userId: user.$id,
          authorName: user.name,
          $createdAt: new Date().toISOString()
      };

      setComments([optimisticComment, ...comments]);
      setNewComment('');

      try {
          await appwriteService.addComment(article.$id, optimisticComment.content, user.$id, user.name);
          // Refresh to get real ID and data
          const res = await appwriteService.getComments(article.$id);
          setComments(res.documents as unknown as Comment[]);
      } catch (e) {
          console.error("Comment failed", e);
          setComments(comments); // Revert
      }
  };

  // Helper to render Editor.js blocks safely
  const renderContent = (jsonString: string) => {
      try {
          const data = JSON.parse(jsonString);
          return data.blocks.map((block: any, idx: number) => {
              switch (block.type) {
                  case 'header':
                      const Level = `h${block.data.level}` as React.ElementType;
                      let sizeClass = "text-xl";
                      if (block.data.level === 1) sizeClass = "text-4xl md:text-5xl";
                      if (block.data.level === 2) sizeClass = "text-3xl md:text-4xl";
                      if (block.data.level === 3) sizeClass = "text-2xl md:text-3xl";
                      return <Level key={idx} className={`font-serif font-bold text-gray-900 dark:text-white mt-8 mb-4 ${sizeClass}`} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                  case 'paragraph':
                      return <p key={idx} className="mb-6 leading-8 text-xl text-gray-800 dark:text-gray-300 font-serif" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                  case 'list':
                      const Tag = (block.data.style === 'ordered' ? 'ol' : 'ul') as React.ElementType;
                      return (
                          <Tag key={idx} className="list-inside list-disc mb-6 ml-4 text-xl text-gray-800 dark:text-gray-300 font-serif">
                              {block.data.items.map((item: string, i: number) => (
                                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                              ))}
                          </Tag>
                      );
                  case 'image':
                      return (
                        <div key={idx} className="my-8">
                           <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                             <img src={block.data.file.url} alt={block.data.caption || "Image"} className="w-full h-auto" />
                           </div>
                           {block.data.caption && <p className="text-center text-sm text-gray-500 mt-2 italic">{block.data.caption}</p>}
                        </div>
                      );
                  case 'quote':
                      return (
                        <blockquote key={idx} className="border-l-4 border-brand-accent pl-4 py-2 my-8 italic text-xl text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-brand-card rounded-r-lg">
                           <p className="mb-2">"{block.data.text}"</p>
                           {block.data.caption && <footer className="text-sm text-gray-500 not-italic">— {block.data.caption}</footer>}
                        </blockquote>
                      );
                  case 'delimiter':
                      return <div key={idx} className="text-center text-3xl text-gray-400 my-8">***</div>;
                  case 'code':
                      return (
                        <pre key={idx} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm font-mono">
                          <code>{block.data.code}</code>
                        </pre>
                      );
                  case 'table':
                      return (
                        <div key={idx} className="overflow-x-auto my-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                           <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                              <tbody>
                                 {block.data.content.map((row: string[], rIdx: number) => (
                                    <tr key={rIdx} className="border-b dark:border-gray-700 last:border-b-0">
                                       {row.map((cell: string, cIdx: number) => (
                                          <td key={cIdx} className="px-6 py-4 whitespace-nowrap bg-white dark:bg-brand-card" dangerouslySetInnerHTML={{ __html: cell }}></td>
                                       ))}
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                      );
                  default:
                      return null;
              }
          });
      } catch (e) {
          return jsonString.split('\n').map((p, i) => <p key={i} className="mb-4 text-lg">{p}</p>);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-dark dark:text-white">Loading article...</div>;
  if (!article) return <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-dark dark:text-white">Article not found.</div>;

  return (
    <article className="min-h-screen bg-white dark:bg-brand-darker transition-colors duration-300 pb-20">
      
      {/* Cover Image Hero */}
      {coverUrl && (
          <div className="w-full h-[50vh] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-brand-darker to-transparent z-10"></div>
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
      )}

      <div className={`max-w-3xl mx-auto px-4 py-12 ${coverUrl ? '-mt-32 relative z-20' : ''}`}>
        <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-8 text-gray-900 dark:text-white drop-shadow-sm">
                {article.title}
            </h1>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex items-center space-x-4">
                    <Link 
                        to={`/user/${article.userId}`} 
                        state={{ authorName: article.authorName }}
                        className="flex items-center space-x-4 hover:opacity-80 transition"
                    >
                        <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white dark:border-brand-dark">
                            {article.authorName.charAt(0)}
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-gray-900 dark:text-white hover:underline decoration-brand-accent">{article.authorName}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                <span>{new Date(article.$createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Follow Button */}
                {user && user.$id !== article.userId && (
                    <button 
                        onClick={handleFollow}
                        className={`px-5 py-1.5 rounded-full text-sm font-bold transition ${isFollowing 
                            ? 'bg-transparent border border-gray-400 text-gray-600 dark:text-gray-300 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-300' 
                            : 'bg-brand-accent text-white hover:bg-brand-accentHover shadow-md'}`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-gray-800 py-4 max-w-lg mx-auto">
                 <div className="flex items-center space-x-2" title="Views">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{views}</span>
                 </div>
                 <button onClick={handleLike} className={`flex items-center space-x-2 transition ${user && likes.includes(user.$id) ? 'text-red-500' : 'hover:text-red-500'}`} title="Likes">
                     {user && likes.includes(user.$id) ? (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                     ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                     )}
                    <span>{likes.length}</span>
                 </button>
                 <a href="#comments" className="flex items-center space-x-2 hover:text-gray-900 dark:hover:text-white transition" title="Comments">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                    <span>{comments.length}</span>
                 </a>
            </div>
        </header>

        {/* Content Renderer */}
        <div className="prose prose-lg dark:prose-invert prose-a:text-brand-accent max-w-none">
            {renderContent(article.content)}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
                {article.tags?.map(tag => (
                    <span key={tag} className="bg-gray-100 dark:bg-brand-card text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-transparent dark:border-gray-700">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        {/* Comment Section */}
        <div id="comments" className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold font-serif mb-8 text-gray-900 dark:text-white">Responses ({comments.length})</h3>
            
            {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-50 dark:bg-brand-card/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                    <textarea 
                        className="w-full bg-white dark:bg-brand-card border border-gray-200 dark:border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        rows={3}
                        placeholder="What are your thoughts?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <button 
                            type="submit" 
                            disabled={!newComment.trim()}
                            className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50 hover:shadow-lg transition transform hover:-translate-y-0.5"
                        >
                            Respond
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-brand-card border border-gray-200 dark:border-gray-700 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to leave a comment.</p>
                    <Link to="/login" className="text-brand-accent font-bold hover:underline">Sign In</Link>
                </div>
            )}

            <div className="space-y-8">
                {comments.map(comment => (
                    <div key={comment.$id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <Link to={`/user/${comment.userId}`} state={{ authorName: comment.authorName }} className="group flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-bold text-xs group-hover:ring-2 ring-brand-accent transition">
                                        {comment.authorName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-brand-accent transition">{comment.authorName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.$createdAt).toLocaleDateString()}</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-lg">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </article>
  );
};

export default ArticleView;