import React from 'react';
import { APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT, DB_ID, COLLECTION_ID_ARTICLES } from '../constants';

interface SetupGuideProps {
  onRetry?: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ onRetry }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-brand-black">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-4 font-serif">Connection Failed</h1>
        <p className="text-red-700 mb-4 text-lg">
          The app cannot connect to Appwrite. Please verify your settings below.
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
        {/* Step 0: CRITICAL - Add Platform */}
        <div className="flex gap-6 relative">
           <div className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-green/20"></div>
          <div className="flex-shrink-0 w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center font-bold text-xl z-10">1</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Add Web Platform (Critical)</h3>
            <p className="text-gray-600 mb-3">This allows your browser to talk to Appwrite.</p>
            <div className="bg-white p-6 rounded-lg border-2 border-brand-green/20 shadow-sm space-y-4">
               <ol className="list-decimal ml-5 space-y-2 font-medium">
                   <li>Go to your Appwrite Project <strong>Overview</strong> page.</li>
                   <li>Scroll down to the "Integrations" or "Platforms" section.</li>
                   <li>Click the <strong>Add Platform</strong> button and select <strong>Web App</strong>.</li>
                   <li>For <strong>Name</strong>, enter: <code>Pedium</code></li>
                   <li>For <strong>Hostname</strong>, enter: <code className="bg-yellow-200 px-2 py-1 rounded text-black font-bold text-lg">*</code></li>
                   <li>Click <strong>Next</strong> and then <strong>Skip</strong> optional steps.</li>
               </ol>
            </div>
          </div>
        </div>

        {/* Step 1 */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Create Database</h3>
            <p className="text-gray-600 mb-3">Go to the <strong>Databases</strong> tab.</p>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
               <div className="flex justify-between items-center">
                   <span className="text-gray-500">Name</span>
                   <span className="font-medium">Pedium Database</span>
               </div>
               <div className="flex justify-between items-center">
                   <span className="text-gray-500">Database ID</span>
                   <code className="bg-yellow-100 px-2 py-1 rounded text-red-600 font-bold">{DB_ID}</code>
               </div>
               <p className="text-xs text-gray-400 mt-2">* Click the pencil icon to edit the ID to match exactly.</p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Create Collection</h3>
            <p className="text-gray-600 mb-3">Inside "Pedium Database", click <strong>Create Collection</strong>.</p>
             <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
               <div className="flex justify-between items-center">
                   <span className="text-gray-500">Name</span>
                   <span className="font-medium">Articles</span>
               </div>
               <div className="flex justify-between items-center">
                   <span className="text-gray-500">Collection ID</span>
                   <code className="bg-yellow-100 px-2 py-1 rounded text-red-600 font-bold">{COLLECTION_ID_ARTICLES}</code>
               </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Add Attributes</h3>
            <p className="text-gray-600 mb-3">Inside "Articles", go to the <strong>Attributes</strong> tab and add these:</p>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm text-left text-gray-700 bg-white">
                <thead className="bg-gray-100 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Req</th>
                    <th className="px-4 py-3">Array</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">title</td><td>String</td><td>255</td><td>Yes</td><td>-</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">content</td><td>String</td><td>10000000</td><td>Yes</td><td>-</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">summary</td><td>String</td><td>5000</td><td>Yes</td><td>-</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">userId</td><td>String</td><td>255</td><td>Yes</td><td>-</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">authorName</td><td>String</td><td>255</td><td>Yes</td><td>-</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold">tags</td><td>String</td><td>255</td><td>No</td><td>Yes</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-mono font-bold text-brand-accent">coverImageId</td><td>String</td><td>255</td><td>No</td><td>-</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">5</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 font-serif">Set Permissions</h3>
            <p className="text-gray-600 mb-3">Go to <strong>Settings</strong> tab in the "Articles" collection.</p>
             <ul className="list-disc ml-5 text-gray-700 space-y-2 bg-gray-50 p-4 rounded border">
              <li>Under <strong>Permissions</strong>, click <strong>+ Add Role</strong>.</li>
              <li>Select <strong>Any</strong> and check <strong>Read</strong>.</li>
              <li>Click <strong>+ Add Role</strong> again.</li>
              <li>Select <strong>Users</strong> and check <strong>Create</strong>, <strong>Update</strong>, <strong>Delete</strong>.</li>
              <li>Click <strong>Update</strong> to save.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center border-t border-gray-200 pt-8">
         <button onClick={() => onRetry ? onRetry() : window.location.reload()} className="bg-brand-green text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-green-700 transition transform hover:scale-105">
            Retry Connection
         </button>
      </div>
    </div>
  );
};