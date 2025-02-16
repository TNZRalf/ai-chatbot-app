import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:8000';

export const createUserInDatabase = async (firebaseUser) => {
  try {
    if (!firebaseUser || !firebaseUser.uid) {
      throw new Error('Invalid Firebase user');
    }

    // Ensure we have an email
    const email = firebaseUser.email || `${firebaseUser.uid}@placeholder.com`;
    const displayName = firebaseUser.displayName || 'User';

    // Get the user's ID token
    const idToken = await firebaseUser.getIdToken(true);

    console.log('Creating user in database:', {
      firebase_uid: firebaseUser.uid,
      email: email,
      display_name: displayName
    });

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: email,
        display_name: displayName
      })
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      let errorDetail;
      try {
        const errorData = JSON.parse(responseText);
        errorDetail = errorData.detail || 'Unknown error';
      } catch {
        errorDetail = responseText || 'Failed to create user in database';
      }
      console.error('Server error response:', errorDetail);
      throw new Error(errorDetail);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Invalid response from server');
    }

    console.log('User created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};
