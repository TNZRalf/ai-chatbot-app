import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import debounce from 'lodash/debounce';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';

const CVEditor = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [cvData, setCVData] = useState({
    summary: '',
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      github_url: '',
      location: ''
    },
    education: [],
    experience: [],
    skills: []
  });

  // Load existing CV data
  useEffect(() => {
    const loadCVData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('http://localhost:3001/api/cv/editor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCVData(data);
        } else if (response.status !== 404) {
          console.error('Error loading CV data:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading CV data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadCVData();
    }
  }, [currentUser]);

  // Auto-save functionality
  const saveCV = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:3001/api/cv/editor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cvData)
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        setShowSaveSuccess(true);
      } else {
        throw new Error('Failed to save CV');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setSaving(false);
    }
  };

  // Debounce save function to prevent too many API calls
  const debouncedSave = useCallback(
    debounce((data) => saveCV(data), 2000),
    []
  );

  // Handle changes in CV data
  const handleChange = (section, field, value) => {
    const newData = {
      ...cvData,
      [section]: section === 'personal_info'
        ? { ...cvData.personal_info, [field]: value }
        : value
    };
    setCVData(newData);
    setHasUnsavedChanges(true);
    debouncedSave(newData);
  };

  // Handle page leave attempts
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Navigation guard
  const handleNavigationAttempt = (to) => {
    if (hasUnsavedChanges) {
      setShowLeaveDialog(true);
      setNextLocation(to);
      return false;
    }
    return true;
  };

  // Add navigation guard
  useNavigationGuard(hasUnsavedChanges, handleNavigationAttempt);

  // Handle dialog actions
  const handleStayOnPage = () => {
    setShowLeaveDialog(false);
    setNextLocation(null);
  };

  const handleLeavePage = async () => {
    if (hasUnsavedChanges) {
      await saveCV();
    }
    setShowLeaveDialog(false);
    if (nextLocation) {
      navigate(nextLocation);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          CV Editor
        </Typography>

        {/* Summary Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Professional Summary
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={cvData.summary}
            onChange={(e) => handleChange('summary', null, e.target.value)}
            placeholder="Write a brief professional summary..."
          />
        </Box>

        {/* Personal Information Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Box display="grid" gridGap={16}>
            <TextField
              fullWidth
              label="Full Name"
              value={cvData.personal_info.full_name}
              onChange={(e) => handleChange('personal_info', 'full_name', e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={cvData.personal_info.email}
              onChange={(e) => handleChange('personal_info', 'email', e.target.value)}
            />
            <TextField
              fullWidth
              label="Phone"
              value={cvData.personal_info.phone}
              onChange={(e) => handleChange('personal_info', 'phone', e.target.value)}
            />
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={cvData.personal_info.linkedin_url}
              onChange={(e) => handleChange('personal_info', 'linkedin_url', e.target.value)}
            />
            <TextField
              fullWidth
              label="GitHub URL"
              value={cvData.personal_info.github_url}
              onChange={(e) => handleChange('personal_info', 'github_url', e.target.value)}
            />
            <TextField
              fullWidth
              label="Location"
              value={cvData.personal_info.location}
              onChange={(e) => handleChange('personal_info', 'location', e.target.value)}
            />
          </Box>
        </Box>

        {/* Save Status */}
        {saving && (
          <Box display="flex" alignItems="center" justifyContent="center" my={2}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Saving changes...
            </Typography>
          </Box>
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={showSaveSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSaveSuccess(false)}
        >
          <Alert severity="success" onClose={() => setShowSaveSuccess(false)}>
            Changes saved successfully
          </Alert>
        </Snackbar>

        {/* Leave Page Dialog */}
        <Dialog open={showLeaveDialog} onClose={handleStayOnPage}>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogContent>
            <Typography>
              You have unsaved changes. Would you like to save them before leaving?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStayOnPage}>Stay on Page</Button>
            <Button onClick={handleLeavePage} color="primary">
              Save and Leave
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CVEditor;
