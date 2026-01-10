import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Photo {
  id: string;
  uri: string;
  projectId: string;
  timestamp: number;
  type: 'before' | 'progress' | 'after' | 'other';
}

const PHOTOS_STORAGE_KEY = 'electrical_photos';

export class PhotoService {
  /**
   * 写真を保存
   */
  static async savePhoto(photo: Omit<Photo, 'id'>): Promise<Photo> {
    const photos = await this.getAllPhotos();
    const newPhoto: Photo = {
      ...photo,
      id: Date.now().toString(),
    };
    photos.push(newPhoto);
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    return newPhoto;
  }

  /**
   * すべての写真を取得
   */
  static async getAllPhotos(): Promise<Photo[]> {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      return photosJson ? JSON.parse(photosJson) : [];
    } catch (error) {
      console.error('Failed to load photos:', error);
      return [];
    }
  }

  /**
   * プロジェクトIDで写真をフィルター
   */
  static async getPhotosByProject(projectId: string): Promise<Photo[]> {
    const allPhotos = await this.getAllPhotos();
    return allPhotos.filter((photo) => photo.projectId === projectId);
  }

  /**
   * 写真を削除
   */
  static async deletePhoto(photoId: string): Promise<void> {
    const photos = await this.getAllPhotos();
    const filteredPhotos = photos.filter((photo) => photo.id !== photoId);
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(filteredPhotos));
  }

  /**
   * プロジェクトの写真をすべて削除
   */
  static async deleteProjectPhotos(projectId: string): Promise<void> {
    const photos = await this.getAllPhotos();
    const filteredPhotos = photos.filter((photo) => photo.projectId !== projectId);
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(filteredPhotos));
  }

  /**
   * 写真の枚数を取得
   */
  static async getPhotoCount(projectId: string): Promise<number> {
    const photos = await this.getPhotosByProject(projectId);
    return photos.length;
  }
}
