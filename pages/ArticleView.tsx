import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { appwriteService } from '../services/appwriteService';
import { Article, UserProfile } from '../types';

interface ArticleViewProps {
  user: UserProfile | null;
}

const ArticleView: React.FC<ArticleViewProps> = ({ user }) => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        appwriteService.getArticle(id)
            .then(doc => {
                const articleData = doc as unknown as Article;
                setArticle(articleData);
                if (articleData.coverImageId) {
                    try {
                        const url = appwriteService.getFileView(articleData.coverImageId);
                        setCoverUrl(url.toString());
                    } catch (e) { console.error("Cover image error", e); }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }
  }, [id]);

  // Helper to render Editor.js blocks safely
  const renderContent = (jsonString: string) => {
      try {
          const data = JSON.parse(jsonString);
          return data.blocks.map((block: any, idx: number) => {
              switch (block.type) {
                  case 'header':
                      const Level = `h${block.data.level}` as React.ElementType;
                      return <Level key={idx} className="font-serif font-bold text-gray-900 dark:text-white mt-8 mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
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
          // Fallback for old content (plain text)
          return jsonString.split('\n').map((p, i) => <p key={i} className="mb-4 text-lg">{p}</p>);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-dark dark:text-white">Loading article...</div>;
  if (!article) return <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-dark dark:text-white">Article not found.</div>;

  return (
    <article className="min-h-screen bg-white dark:bg-brand-darker transition-colors duration-300">
      
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
            
            <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white dark:border-brand-dark">
                    {article.authorName.charAt(0)}
                </div>
                <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white">{article.authorName}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                        <span>{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                        <span>·</span>
                        <span>{Math.ceil(article.content.length / 2000)} min read</span>
                    </div>
                </div>
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
      </div>
    </article>
  );
};

export default ArticleView;