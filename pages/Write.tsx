import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import CodeTool from '@editorjs/code';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import Table from '@editorjs/table';

import { appwriteService } from '../services/appwriteService';
import { geminiService } from '../services/geminiService';
import { UserProfile } from '../types';
import { PublishDialog } from '../components/PublishDialog';

interface WriteProps {
  user: UserProfile;
}

const Write: React.FC<WriteProps> = ({ user }) => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStage, setPublishStage] = useState('');
  const [publishError, setPublishError] = useState('');

  const navigate = useNavigate();
  const editorInstance = useRef<EditorJS | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Editor.js
  useEffect(() => {
    if (!editorInstance.current && editorContainerRef.current) {
        editorInstance.current = new EditorJS({
            holder: editorContainerRef.current,
            placeholder: 'Tell your story...',
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: true,
                    config: {
                      placeholder: 'Heading',
                      levels: [1, 2, 3], // Enabled H1, H2, H3
                      defaultLevel: 2
                    }
                },
                paragraph: {
                  class: Paragraph,
                  inlineToolbar: true,
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                },
                image: {
                  class: ImageTool,
                  config: {
                    uploader: {
                      uploadByFile(file: File) {
                        return appwriteService.uploadFile(file).then((response) => {
                          const url = appwriteService.getFileView(response.$id).toString();
                          return {
                            success: 1,
                            file: {
                              url: url,
                            }
                          };
                        });
                      }
                    }
                  }
                },
                quote: {
                  class: Quote,
                  inlineToolbar: true,
                  config: {
                    quotePlaceholder: 'Enter a quote',
                    captionPlaceholder: 'Author',
                  },
                },
                delimiter: Delimiter,
                code: CodeTool,
                table: {
                  class: Table,
                  inlineToolbar: true,
                }
            },
            data: {
              blocks: []
            }
        });
    }

    return () => {
        if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
            editorInstance.current.destroy();
            editorInstance.current = null;
        }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setCoverImage(file);
          setCoverPreview(URL.createObjectURL(file));
      }
  };

  const handlePublish = async () => {
    if (!title.trim()) return alert("Please add a title.");
    
    setIsPublishing(true);
    setPublishError('');
    setPublishStage('Initializing');

    try {
      // 1. Save Editor Data
      setPublishStage('Saving content');
      if (!editorInstance.current) throw new Error("Editor not initialized");
      const outputData = await editorInstance.current.save();
      
      // Check if empty
      if (outputData.blocks.length === 0) {
          throw new Error("Please write some content before publishing.");
      }

      const contentJson = JSON.stringify(outputData);
      
      // Extract plain text for AI Summary
      const plainText = outputData.blocks.map(b => b.data.text || '').join('\n');

      // 2. Upload Cover Image (if any)
      let coverImageId = undefined;
      if (coverImage) {
          setPublishStage('Uploading cover image');
          try {
             const fileUpload = await appwriteService.uploadFile(coverImage);
             coverImageId = fileUpload.$id;
          } catch (err: any) {
              console.error("Image upload failed:", err);
              if (err.message.includes('Permissions')) {
                 throw new Error("Storage permissions missing. Check Appwrite Console.");
              }
          }
      }

      // 3. AI Magic
      setPublishStage('Generating AI summary & tags');
      const summary = await geminiService.generateSummary(plainText);
      const tags = await geminiService.suggestTags(plainText);

      // 4. Save to Database
      // REMOVED 'createdAt' from payload as it causes "Unknown attribute" error if not in schema.
      // Appwrite handles creation time automatically ($createdAt).
      setPublishStage('Publishing to Pedium');
      
      await appwriteService.createArticle({
        title,
        content: contentJson,
        summary,
        tags,
        userId: user.$id,
        authorName: user.name,
        coverImageId
      });

      setPublishStage('Done!');
      setTimeout(() => navigate('/'), 1000);

    } catch (e: any) {
      console.error(e);
      let msg = e.message || "Failed to publish.";
      if (msg.includes('Unknown attribute')) {
         msg = "Database Schema Error: " + msg + ". Please check your Appwrite Database Attributes.";
      }
      setPublishError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
      <PublishDialog 
         isOpen={isPublishing} 
         stage={publishStage} 
         error={publishError} 
         onClose={() => setIsPublishing(false)} 
      />

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8 py-2">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
              <span>Drafting as <span className="font-bold text-gray-900 dark:text-white">{user.name}</span></span>
            </div>
            <button 
              onClick={handlePublish}
              className="bg-brand-accent text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-accentHover transition shadow-lg transform hover:-translate-y-0.5"
            >
              Publish
            </button>
        </div>

        <div className="space-y-8">
            {/* Title Input */}
            <input 
                type="text" 
                placeholder="Title" 
                className="w-full text-4xl md:text-5xl font-serif font-bold placeholder-gray-300 dark:placeholder-gray-700 border-none outline-none focus:ring-0 px-0 bg-transparent text-gray-900 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {/* Cover Image Upload */}
            <div className="group relative">
                {coverPreview ? (
                    <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        <button 
                           onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                           className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-[#111827] hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-brand-accent transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload cover image</span></p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                )}
            </div>

            {/* Editor.js Container */}
            <div className="prose prose-lg dark:prose-invert max-w-none min-h-[500px] pb-20">
                <div id="editorjs" ref={editorContainerRef} className="dark:text-gray-100"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Write;