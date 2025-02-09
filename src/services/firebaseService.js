import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// User related operations
export const createUserProfile = async (uid, userData) => {
  try {
    console.log('Creating user profile for:', uid);
    const userRef = doc(db, 'users', uid);
    
    // Check if user document already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log('User profile already exists, updating...');
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    } else {
      console.log('Creating new user profile...');
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('User profile operation successful');
    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    console.log('Updating user profile for:', uid);
    const userRef = doc(db, 'users', uid);
    
    // Check if user exists before updating
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.warn('User document does not exist, creating new profile...');
      return await createUserProfile(uid, updates);
    }

    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    console.log('Fetching user profile for:', uid);
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log('User profile found');
      return userSnap.data();
    } else {
      console.warn('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

// File upload operations
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Message operations
export const saveMessage = async (userId, message, attachmentUrl = null) => {
  try {
    const messagesRef = collection(db, 'messages');
    const newMessage = {
      userId,
      content: message,
      attachmentUrl,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(messagesRef, newMessage);
    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getUserMessages = async (userId, limit = 50) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ ...doc.data(), id: doc.id });
    });
    return messages;
  } catch (error) {
    console.error('Error getting user messages:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
