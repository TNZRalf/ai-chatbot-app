import { auth } from '../config/firebase';

const API_URL = 'http://localhost:8000/api';

export const cvService = {
  async processCV(file) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const idToken = await user.getIdToken(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user.uid);

      console.log('Uploading file:', file.name);
      const response = await fetch(`${API_URL}/cv/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process CV');
      }

      const data = await response.json();
      console.log('Processed CV data:', data);
      return data;
    } catch (error) {
      console.error('Error processing CV:', error);
      throw error;
    }
  },

  async getCVProfile(userId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const idToken = await user.getIdToken(true);
      const response = await fetch(`${API_URL}/cv/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch CV profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching CV profile:', error);
      throw error;
    }
  }
};