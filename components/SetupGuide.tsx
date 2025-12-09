import React from 'react';
import { APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT, DB_ID, COLLECTION_ID_ARTICLES, COLLECTION_ID_COMMENTS, COLLECTION_ID_FOLLOWS } from '../constants';

interface SetupGuideProps {
  onRetry?: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ onRetry }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-brand-black">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-4 font-serif">Database Sync Required</h1>
        <p className="text-red-700 mb-4 text-lg">
          The app connected to Appwrite, but some Collections or Attributes are missing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded border border-red-100">
           <div>
               <span className="block text-gray-500 font-bold text-xs uppercase">Endpoint</span>
               <code className="text-gray-800 break-all">{APPWRITE_ENDPOINT}</code>
           </div>
           <div>
               <span className="block text-gray-500 font-bold text-xs uppercase">Project ID</span>
               <code className="text-gray-800">{APPWRITE_PROJECT_ID}</code>
           </div>
        </div>
      </div>

      <div className="space-y-12">

        {/* Step 1: Articles Update */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Update 'articles' Collection</h3>
            <p className="text-gray-600 mb-3">Go to <strong>Database</strong> &gt; <strong>{DB_ID}</strong> &gt; <strong>{COLLECTION_ID_ARTICLES}</strong> &gt; <strong>Attributes</strong>.</p>
            <div className="overflow-x-auto border rounded-lg mb-4">
              <table className="min-w-full text-sm text-left text-gray-700 bg-white">
                <thead className="bg-gray-100 font-bold uppercase text-xs tracking-wider">
                  <tr><th className="px-4 py-3">Key</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Details</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-green-50"><td className="px-4 py-3 font-mono font-bold">views</td><td>Integer</td><td>Default: 0</td></tr>
                  <tr className="bg-green-50"><td className="px-4 py-3 font-mono font-bold">likedBy</td><td>String</td><td>Array: <span className="font-bold text-green-700">Yes</span> (Size 255)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500">Ensure existing attributes (title, content, summary, userId, etc.) still exist.</p>
          </div>
        </div>

        {/* Step 2: Comments */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Create 'comments' Collection</h3>
            <p className="text-gray-600 mb-3">Create a new collection with ID: <code className="bg-yellow-100 px-2 py-1 rounded font-bold">{COLLECTION_ID_COMMENTS}</code></p>
            
            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Attributes</h4>
            <div className="overflow-x-auto border rounded-lg mb-4">
              <table className="min-w-full text-sm text-left text-gray-700 bg-white">
                <thead className="bg-gray-100 font-bold uppercase text-xs tracking-wider">
                  <tr><th className="px-4 py-3">Key</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Size/Req</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-4 py-3 font-mono font-bold">content</td><td>String</td><td>1000 / Required</td></tr>
                  <tr><td className="px-4 py-3 font-mono font-bold">articleId</td><td>String</td><td>255 / Required</td></tr>
                  <tr><td className="px-4 py-3 font-mono font-bold">userId</td><td>String</td><td>255 / Required</td></tr>
                  <tr><td className="px-4 py-3 font-mono font-bold">authorName</td><td>String</td><td>255 / Required</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Permissions (Settings Tab)</h4>
            <ul className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <li>Role <strong>Any</strong>: Read</li>
                <li>Role <strong>Users</strong>: Create, Update, Delete</li>
            </ul>
          </div>
        </div>

        {/* Step 3: Follows */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Create 'follows' Collection</h3>
            <p className="text-gray-600 mb-3">Create a new collection with ID: <code className="bg-yellow-100 px-2 py-1 rounded font-bold">{COLLECTION_ID_FOLLOWS}</code></p>
            
            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Attributes</h4>
            <div className="overflow-x-auto border rounded-lg mb-4">
              <table className="min-w-full text-sm text-left text-gray-700 bg-white">
                <thead className="bg-gray-100 font-bold uppercase text-xs tracking-wider">
                  <tr><th className="px-4 py-3">Key</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Size/Req</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-4 py-3 font-mono font-bold">followerId</td><td>String</td><td>255 / Required</td></tr>
                  <tr><td className="px-4 py-3 font-mono font-bold">followingId</td><td>String</td><td>255 / Required</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Permissions (Settings Tab)</h4>
            <ul className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <li>Role <strong>Any</strong>: Read</li>
                <li>Role <strong>Users</strong>: Create, Read, Delete</li>
            </ul>
          </div>
        </div>

      </div>
      
      <div className="mt-16 text-center border-t border-gray-200 pt-8">
         <button onClick={() => onRetry ? onRetry() : window.location.reload()} className="bg-brand-accent text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-teal-700 transition transform hover:scale-105">
            I've Updated the Database - Retry
         </button>
      </div>
    </div>
  );
};