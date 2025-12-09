import React from 'react';

interface PublishDialogProps {
  isOpen: boolean;
  stage: string; // e.g., "Uploading Image", "Generating AI Tags", "Saving"
  error?: string;
  onClose: () => void;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({ isOpen, stage, error, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
        
        {error ? (
           <>
             <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Publish Failed</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
             <button onClick={onClose} className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold">
               Close
             </button>
           </>
        ) : (
           <>
             <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-brand-accent rounded-full border-t-transparent animate-spin"></div>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Publishing Story</h3>
             <p className="text-brand-accent font-medium animate-pulse">{stage}...</p>
             <p className="text-xs text-gray-400 mt-4">Please do not close this window.</p>
           </>
        )}
      </div>
    </div>
  );
};