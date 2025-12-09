import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, DB_ID, COLLECTION_ID_ARTICLES, BUCKET_ID_IMAGES } from '../constants';
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

  async register(email: string, pass: string, name: string) {
    await account.create(ID.unique(), email, pass, name);
    return this.login(email, pass);
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

  // Storage
  async uploadFile(file: File) {
      return storage.createFile(BUCKET_ID_IMAGES, ID.unique(), file);
  },

  getFilePreview(fileId: string) {
      return storage.getFilePreview(BUCKET_ID_IMAGES, fileId);
  },
  
  getFileView(fileId: string) {
      return storage.getFileView(BUCKET_ID_IMAGES, fileId);
  },

  // Articles
  async createArticle(article: Omit<Article, '$id' | 'createdAt'>) {
    return databases.createDocument(
      DB_ID,
      COLLECTION_ID_ARTICLES,
      ID.unique(),
      article
    );
  },

  async getArticles(queries: string[] = []) {
    try {
        return await databases.listDocuments(
            DB_ID,
            COLLECTION_ID_ARTICLES,
            [Query.orderDesc('createdAt'), ...queries]
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
          [Query.equal('userId', userId), Query.orderDesc('createdAt')]
        );
    } catch (e) {
         return await databases.listDocuments(
          DB_ID,
          COLLECTION_ID_ARTICLES,
          [Query.equal('userId', userId)]
        );
    }
  }
};