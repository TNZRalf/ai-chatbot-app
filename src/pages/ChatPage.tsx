import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Chat from '../components/Chat';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: string;
  displayName: string;
  photoURL?: string;
  timestamp: Date;
  attachmentUrl?: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) return;

      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];
        setMessages(newMessages);
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, [user, db]);

  const handleSendMessage = async (text: string, attachment: File | null) => {
    if (!user) return;

    try {
      let attachmentUrl: string | undefined;
      if (attachment) {
        // Here you would typically:
        // 1. Upload the attachment to Firebase Storage
        // 2. Get the download URL
        // 3. Store the URL in attachmentUrl
      }

      await addDoc(collection(db, 'messages'), {
        text,
        sender: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
        attachmentUrl,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <Chat
      messages={messages}
      onSendMessage={handleSendMessage}
      user={user}
      isDarkMode={isDarkMode}
    />
  );
};

export default ChatPage;
