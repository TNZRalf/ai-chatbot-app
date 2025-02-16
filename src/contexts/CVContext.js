import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCVProfile } from '../services/postgresService';

const CVContext = createContext();

export const useCV = () => {
  return useContext(CVContext);
};

export const CVProvider = ({ children }) => {
  const [cvData, setCVData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const fetchCVData = async () => {
    if (!currentUser) {
      setCVData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getCVProfile(currentUser.uid);
      
      if (response && response.data) {
        // Transform the data to match the expected format
        setCVData({
          personal_info: {
            name: response.data.personalInfo?.name || '',
            email: response.data.personalInfo?.email || '',
            phone: response.data.personalInfo?.phone || '',
            linkedin: response.data.personalInfo?.linkedin || '',
            github: response.data.personalInfo?.github || '',
            location: response.data.personalInfo?.location || '',
            summary: response.data.summary || ''
          },
          education: response.data.education || [],
          experience: response.data.experience || [],
          skills: response.data.skills || [],
          languages: response.data.languages || [],
          certifications: response.data.certifications || []
        });
      } else {
        // Set default empty state if no data
        setCVData({
          personal_info: {
            name: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            location: '',
            summary: ''
          },
          education: [],
          experience: [],
          skills: [],
          languages: [],
          certifications: []
        });
      }
    } catch (err) {
      console.error('Error fetching CV data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVData();
  }, [currentUser]);

  const updateCVData = (newData) => {
    // Transform the data to match the component's expected format
    setCVData({
      personal_info: {
        name: newData.personalInfo?.name || '',
        email: newData.personalInfo?.email || '',
        phone: newData.personalInfo?.phone || '',
        linkedin: newData.personalInfo?.linkedin || '',
        github: newData.personalInfo?.github || '',
        location: newData.personalInfo?.location || '',
        summary: newData.summary || ''
      },
      education: newData.education || [],
      experience: newData.experience || [],
      skills: newData.skills || [],
      languages: newData.languages || [],
      certifications: newData.certifications || []
    });
  };

  const value = {
    cvData,
    updateCVData,
    loading,
    error,
    refreshCV: fetchCVData
  };

  return (
    <CVContext.Provider value={value}>
      {children}
    </CVContext.Provider>
  );
};

export default CVContext;
