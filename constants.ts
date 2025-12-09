
// Safely access environment variables with fallback
// using optional chaining to prevent "Cannot read properties of undefined"
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

export const APPWRITE_ENDPOINT = getEnv('VITE_APPWRITE_ENDPOINT') || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = getEnv('VITE_APPWRITE_PROJECT_ID') || "6936f3d0000790358ae9";

// Appwrite Database Constants
export const DB_ID = "pedium_db";
export const COLLECTION_ID_ARTICLES = "articles";
export const COLLECTION_ID_COMMENTS = "comments";
export const COLLECTION_ID_FOLLOWS = "follows";
export const BUCKET_ID_IMAGES = "article_covers";

export const CATEGORIES = [
  "Technology",
  "Life",
  "Productivity",
  "Artificial Intelligence",
  "Design",
  "Culture",
  "Programming"
];
