import { Client, Account, Databases, Storage, ID, Query, OAuthProvider } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, DB_ID, COLLECTION_ID_ARTICLES, COLLECTION_ID_COMMENTS, COLLECTION_ID_FOLLOWS, BUCKET_ID_IMAGES } from '../constants';
import { Article } from '../types';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteService = {
  // Auth
  async login(email: string, pass: string) {
    return account.createEmailPasswordSession(email, pass);
  },

  async loginWithGoogle() {
      // Ensure 'Google' is enabled in Appwrite Console > Auth > Settings
      // Ensure your domain (e.g., 'localhost') is added in Appwrite Console > Overview > Platforms
      // We use 'google' string directly to ensure compatibility if the Enum is not correctly exported in the bundle
      return account.createOAuth2Session(
          'google' as OAuthProvider, 
          window.location.origin, // Success URL
          window.location.origin  // Failure URL
      );
  },

  async register(email: string, pass: string, name: string) {
    // 1. Create Account
    await account.create(ID.unique(), email, pass, name);
    
    // 2. Login to establish session
    await this.login(email, pass);

    // 3. Generate Cute AI Avatar (DiceBear Adventurer)
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    
    // 4. Update User Preferences with Avatar
    await account.updatePrefs({ avatar: avatarUrl });
    
    return true;
  },

  async logout() {
    return account.deleteSession('current');
  },

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  async updatePrefs(prefs: any) {
      return account.updatePrefs(prefs);
  },

  // Storage
  async uploadFile(file: File) {
      return storage.createFile(BUCKET_ID_IMAGES, ID.unique(), file);
  },

  getFilePreview(fileId: string, width?: number, height?: number) {
      return storage.getFilePreview(BUCKET_ID_IMAGES, fileId, width, height);
  },
  
  getFileView(fileId: string) {
      return storage.getFileView(BUCKET_ID_IMAGES, fileId);
  },

  // Articles
  async createArticle(article: Omit<Article, '$id' | '$createdAt' | 'views' | 'likedBy'>) {
    try {
      // Attempt to create with full social schema
      return await databases.createDocument(
        DB_ID,
        COLLECTION_ID_ARTICLES,
        ID.unique(),
        { ...article, views: 0, likedBy: [] }
      );
    } catch (error: any) {
      // Fallback: If 'views' or 'likedBy' attributes are missing in DB, create basic article
      if (error.message && error.message.includes('Unknown attribute')) {
          console.warn("Social attributes missing in Schema. Creating basic article.");
          return databases.createDocument(
            DB_ID,
            COLLECTION_ID_ARTICLES,
            ID.unique(),
            article
          );
      }
      throw error;
    }
  },

  async getArticles(queries: string[] = []) {
    try {
        return await databases.listDocuments(
            DB_ID,
            COLLECTION_ID_ARTICLES,
            [Query.orderDesc('$createdAt'), ...queries]
        );
    } catch (error) {
        console.warn("Sorting failed (likely missing index), fetching unsorted.", error);
        return await databases.listDocuments(
            DB_ID,
            COLLECTION_ID_ARTICLES,
            queries
        );
    }
  },

  async getArticle(id: string) {
    return databases.getDocument(
      DB_ID,
      COLLECTION_ID_ARTICLES,
      id
    );
  },

  async getUserArticles(userId: string) {
    try {
        return await databases.listDocuments(
          DB_ID,
          COLLECTION_ID_ARTICLES,
          [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
        );
    } catch (e) {
         return await databases.listDocuments(
          DB_ID,
          COLLECTION_ID_ARTICLES,
          [Query.equal('userId', userId)]
        );
    }
  },

  // Views & Likes
  async incrementView(articleId: string, currentViews: number) {
      try {
          await databases.updateDocument(DB_ID, COLLECTION_ID_ARTICLES, articleId, {
              views: currentViews + 1
          });
      } catch (e) { 
          // Silently fail if 'views' attribute is missing to prevent UI disruption
          console.warn("Failed to increment view (Attribute might be missing)", e); 
      }
  },

  async toggleLike(articleId: string, likedBy: string[], userId: string) {
      const isLiked = likedBy.includes(userId);
      let newLikedBy = [];
      
      if (isLiked) {
          newLikedBy = likedBy.filter(id => id !== userId);
      } else {
          newLikedBy = [...likedBy, userId];
      }

      try {
        await databases.updateDocument(DB_ID, COLLECTION_ID_ARTICLES, articleId, {
            likedBy: newLikedBy
        });
        return newLikedBy;
      } catch (e: any) {
          if (e.message && e.message.includes('Unknown attribute')) {
              console.warn("Like failed: 'likedBy' attribute missing in DB.");
              return likedBy; // Return original state
          }
          throw e;
      }
  },

  // Comments
  async getComments(articleId: string) {
      try {
        return await databases.listDocuments(
            DB_ID, 
            COLLECTION_ID_COMMENTS, 
            [Query.equal('articleId', articleId), Query.orderDesc('$createdAt')]
        );
      } catch (e: any) {
          if (e.code === 404) {
              console.warn("Comments collection not found/created yet.");
              return { documents: [], total: 0 };
          }
          throw e;
      }
  },

  async addComment(articleId: string, content: string, userId: string, authorName: string) {
      try {
        return await databases.createDocument(
            DB_ID,
            COLLECTION_ID_COMMENTS,
            ID.unique(),
            { articleId, content, userId, authorName }
        );
      } catch (e: any) {
          if (e.code === 404) throw new Error("Comments feature not configured (Collection missing).");
          throw e;
      }
  },

  // Follows
  async getFollowersCount(userId: string) {
      try {
        const res = await databases.listDocuments(DB_ID, COLLECTION_ID_FOLLOWS, [
            Query.equal('followingId', userId)
        ]);
        return res.total;
      } catch (e) { return 0; }
  },

  async getFollowingCount(userId: string) {
      try {
        const res = await databases.listDocuments(DB_ID, COLLECTION_ID_FOLLOWS, [
            Query.equal('followerId', userId)
        ]);
        return res.total;
      } catch (e) { return 0; }
  },

  async isFollowing(currentUserId: string, targetUserId: string) {
      try {
        // Preferred: Check using exact index
        const res = await databases.listDocuments(DB_ID, COLLECTION_ID_FOLLOWS, [
            Query.equal('followerId', currentUserId),
            Query.equal('followingId', targetUserId)
        ]);
        return res.documents.length > 0 ? res.documents[0] : null;
      } catch (e: any) { 
        // Fallback: If "following_idx" is missing but "follower_idx" exists, we can fetch all follows and filter in JS.
        // This prevents the feature from breaking if the user only created one index.
        if (e.code === 400 && e.message.includes('Index not found')) {
            console.warn("Using fallback follow check (Missing Index).");
            try {
                 const res = await databases.listDocuments(DB_ID, COLLECTION_ID_FOLLOWS, [
                    Query.equal('followerId', currentUserId)
                ]);
                return res.documents.find((d: any) => d.followingId === targetUserId) || null;
            } catch (innerE) {
                return null;
            }
        }
        return null; 
      }
  },

  async followUser(currentUserId: string, targetUserId: string) {
      // 1. DUPLICATE CHECK: Check if already following before creating
      try {
          const existing = await this.isFollowing(currentUserId, targetUserId);
          if (existing) {
              return existing; // Return the existing document, do not create a new one
          }
      } catch (checkError) {
          // Ignore check error and proceed to try creation, 
          // or handle specific index errors if strict
      }

      try {
        // Updated payload to match your Database Schema requirements
        return await databases.createDocument(DB_ID, COLLECTION_ID_FOLLOWS, ID.unique(), {
            followerId: currentUserId,
            followingId: targetUserId,
            followDate: new Date().toISOString(),
            status: 'active' 
        });
      } catch (e: any) {
          if (e.code === 401 || e.code === 403) {
             throw new Error("PERMISSION DENIED: Go to Appwrite Console > Database > Follows > Settings > Permissions. Add Role 'Users' with Create/Read/Delete.");
          }
          if (e.code === 404) throw new Error("Follows feature not configured.");
          
          throw e;
      }
  },

  async unfollowUser(docId: string) {
      return databases.deleteDocument(DB_ID, COLLECTION_ID_FOLLOWS, docId);
  }
};