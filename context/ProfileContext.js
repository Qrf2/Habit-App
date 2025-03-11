import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(require('../assets/images/dp.jpg'));

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) setProfileImage({ uri: savedImage });
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };
    loadProfileImage();
  }, []);

  const updateProfileImage = async (newImage) => {
    setProfileImage(newImage);
    if (newImage.uri) {
      await AsyncStorage.setItem('profileImage', newImage.uri);
    } else {
      await AsyncStorage.removeItem('profileImage');
    }
  };

  return (
    <ProfileContext.Provider value={{ profileImage, updateProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
};
