import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Grid, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Autocomplete,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Logo from './Logo';
import Sidebar from './Sidebar';
import debounce from 'lodash/debounce';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const commonSkills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
  'Project Management', 'Leadership', 'Communication',
  'Problem Solving', 'Team Management', 'Agile',
  'Data Analysis', 'Machine Learning', 'DevOps',
];

const degrees = ['High School', 'Associate', "Bachelor's", "Master's", 'PhD', 'Other'];

const WorkExperienceForm = ({ experience, onUpdate, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(experience.endDate === 'Present' || !experience.endDate);
  const theme = useTheme();

  useEffect(() => {
    // If end date is not set, automatically set it to Present
    if (!experience.endDate) {
      onUpdate({
        ...experience,
        endDate: 'Present'
      });
    }
  }, [experience.endDate]);

  const handleDateChange = (field, date) => {
    if (field === 'endDate' && isPresent) {
      return; // Don't update if "Present" is selected
    }
    onUpdate({
      ...experience,
      [field]: date ? date.toISOString().split('T')[0] : ''
    });
  };

  const togglePresent = () => {
    setIsPresent(!isPresent);
    onUpdate({
      ...experience,
      endDate: !isPresent ? 'Present' : ''
    });
  };

  // Helper function to parse date string
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Present') return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Position"
            value={experience.position || ''}
            onChange={e => onUpdate({ ...experience, position: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company"
            value={experience.company || ''}
            onChange={e => onUpdate({ ...experience, company: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={parseDate(experience.startDate)}
              onChange={(date) => handleDateChange('startDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined"
                }
              }}
              format="MMM yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={!isPresent ? parseDate(experience.endDate) : null}
                onChange={(date) => handleDateChange('endDate', date)}
                disabled={isPresent}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: {
                      '& .MuiInputBase-root': {
                        color: 'inherit',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                    }
                  }
                }}
                format="MMM yyyy"
              />
            </LocalizationProvider>
            <Button
              variant={isPresent ? "contained" : "outlined"}
              onClick={togglePresent}
              size="small"
              sx={{ 
                minWidth: '100px',
                height: '56px',
                color: isPresent ? 'white' : 'primary.main',
                borderColor: 'primary.main'
              }}
            >
              Present
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={experience.highlights.join('\n')}
            onChange={e => onUpdate({ ...experience, highlights: e.target.value.split('\n').filter(h => h.trim()) })}
            variant="outlined"
            placeholder="Enter each achievement on a new line"
          />
        </Grid>
        <Grid item xs={12}>
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={() => setDeleteDialogOpen(true)} 
            color="error" 
            variant="outlined" 
            size="small"
          >
            Remove Experience
          </Button>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this experience?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            onDelete(experience.id);
            setDeleteDialogOpen(false);
          }} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const EducationForm = ({ education, onUpdate, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(education.endDate === 'Present' || !education.endDate);
  const theme = useTheme();

  useEffect(() => {
    // If end date is not set, automatically set it to Present
    if (!education.endDate) {
      onUpdate({
        ...education,
        endDate: 'Present'
      });
    }
  }, [education.endDate]);

  const handleDateChange = (field, date) => {
    if (field === 'endDate' && isPresent) {
      return; // Don't update if "Present" is selected
    }
    onUpdate({
      ...education,
      [field]: date ? date.toISOString().split('T')[0] : ''
    });
  };

  const togglePresent = () => {
    setIsPresent(!isPresent);
    onUpdate({
      ...education,
      endDate: !isPresent ? 'Present' : ''
    });
  };

  // Helper function to parse date string
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Present') return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Institution"
            value={education.institution || ''}
            onChange={e => onUpdate({ ...education, institution: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Degree"
            value={education.degree || ''}
            onChange={e => onUpdate({ ...education, degree: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={parseDate(education.startDate)}
              onChange={(date) => handleDateChange('startDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined"
                }
              }}
              format="MMM yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={!isPresent ? parseDate(education.endDate) : null}
                onChange={(date) => handleDateChange('endDate', date)}
                disabled={isPresent}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: {
                      '& .MuiInputBase-root': {
                        color: 'inherit',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                    }
                  }
                }}
                format="MMM yyyy"
              />
            </LocalizationProvider>
            <Button
              variant={isPresent ? "contained" : "outlined"}
              onClick={togglePresent}
              size="small"
              sx={{ 
                minWidth: '100px',
                height: '56px',
                color: isPresent ? 'white' : 'primary.main',
                borderColor: 'primary.main'
              }}
            >
              Present
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={() => setDeleteDialogOpen(true)} 
            color="error" 
            variant="outlined" 
            size="small"
          >
            Remove Education
          </Button>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this education?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            onDelete(education.id);
            setDeleteDialogOpen(false);
          }} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const PersonalInfoForm = ({ personalInfo, onUpdate }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={personalInfo.name}
            onChange={e => onUpdate({ ...personalInfo, name: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            value={personalInfo.email}
            onChange={e => onUpdate({ ...personalInfo, email: e.target.value })}
            variant="outlined"
            type="email"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={personalInfo.phone}
            onChange={e => onUpdate({ ...personalInfo, phone: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Location"
            value={personalInfo.location}
            onChange={e => onUpdate({ ...personalInfo, location: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="LinkedIn URL"
            value={personalInfo.linkedin}
            onChange={e => onUpdate({ ...personalInfo, linkedin: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="GitHub URL"
            value={personalInfo.github}
            onChange={e => onUpdate({ ...personalInfo, github: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Professional Summary"
            value={personalInfo.summary}
            onChange={e => onUpdate({ ...personalInfo, summary: e.target.value })}
            variant="outlined"
            placeholder="Write a brief summary of your professional background, key qualifications, and career objectives..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const LanguageForm = ({ language, onUpdate, onDelete }) => {
  const proficiencyLevels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'];

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Language"
            value={language.name}
            onChange={e => onUpdate({ ...language, name: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Proficiency</InputLabel>
            <Select
              value={language.proficiency}
              onChange={e => onUpdate({ ...language, proficiency: e.target.value })}
              label="Proficiency"
            >
              {proficiencyLevels.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={onDelete} 
            color="error" 
            variant="outlined" 
            size="small"
          >
            Remove Language
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const ResumeParser = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    summary: ''
  });
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('No authenticated user found, redirecting to login...');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleParseResume = async (uploadedFile) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      setParsing(true);
      setSnackbar({ 
        open: false, 
        message: '', 
        severity: 'info' 
      });

      if (!uploadedFile || !uploadedFile.type.includes('pdf')) {
        throw new Error('Please upload a valid PDF file');
      }

      const token = await currentUser.getIdToken(true); // Force refresh the token
      console.log('Starting resume parsing process...');
      console.log('File details:', {
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size
      });

      const formData = new FormData();
      formData.append('file', uploadedFile);

      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:3001/api/cv/parse', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received parsed resume data:', data);

      // Update state with parsed data
      if (data.data && data.data.parsedData) {
        const parsedData = data.data.parsedData;
        
        // Update personal info
        if (parsedData.personalInfo) {
          setPersonalInfo(prev => ({
            ...prev,
            name: parsedData.personalInfo.name || '',
            email: parsedData.personalInfo.email || '',
            phone: parsedData.personalInfo.phone || '',
            linkedin: parsedData.personalInfo.linkedin || '',
            github: parsedData.personalInfo.github || '',
            location: parsedData.personalInfo.location || '',
            summary: parsedData.summary || ''
          }));
        }

        // Update education
        if (Array.isArray(parsedData.education)) {
          setEducation(parsedData.education.map((edu, index) => ({
            id: `edu-${index}`,
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: edu.startDate ? new Date(edu.startDate) : null,
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            gpa: edu.gpa || ''
          })));
        }

        // Update work experience
        if (Array.isArray(parsedData.workExperience)) {
          setWorkExperience(parsedData.workExperience.map((exp, index) => ({
            id: `exp-${index}`,
            company: exp.company || '',
            position: exp.position || '',
            location: exp.location || '',
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description || ''
          })));
        }

        // Update skills
        if (Array.isArray(parsedData.skills)) {
          setSkills(parsedData.skills.map(skill => ({
            name: skill.name,
            category: skill.category || 'Other',
            proficiency: skill.proficiency || 'Intermediate'
          })));
        }

        setSnackbar({
          open: true,
          message: 'Resume parsed successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error parsing resume:', {
        message: error.message,
        stack: error.stack
      });
      setSnackbar({
        open: true,
        message: `Failed to parse resume: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setParsing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    await handleParseResume(file);
  }, [currentUser]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      id: Date.now(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      highlights: []
    }]);
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: ''
    }]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const idToken = await currentUser.getIdToken();
      const response = await fetch('http://localhost:3001/api/cv/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          personalInfo,
          education,
          experience: workExperience,
          skills,
          summary: personalInfo.summary
        })
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        setShowSaveSuccess(true);
      } else {
        throw new Error('Failed to save CV data');
      }
    } catch (error) {
      console.error('Error saving CV data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save CV data',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((data) => handleSave(), 2000),
    []
  );

  const handleFormChange = (newData) => {
    setPersonalInfo(newData);
    setHasUnsavedChanges(true);
    debouncedSave(newData);
  };

  const handleNavigationAttempt = (to) => {
    if (hasUnsavedChanges) {
      setShowLeaveDialog(true);
      setNextLocation(to);
      return false;
    }
    return true;
  };

  useNavigationGuard(hasUnsavedChanges, handleNavigationAttempt);

  const handleStayOnPage = () => {
    setShowLeaveDialog(false);
    setNextLocation(null);
  };

  const handleLeavePage = async () => {
    if (hasUnsavedChanges) {
      await handleSave();
    }
    setShowLeaveDialog(false);
    if (nextLocation) {
      navigate(nextLocation);
    }
  };

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

  // Fetch CV data when component mounts
  useEffect(() => {
    const fetchCVData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const idToken = await currentUser.getIdToken();
        const response = await fetch('http://localhost:3001/api/cv/profile', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Only update states if data exists
          if (data && Object.keys(data).length > 0) {
            if (data.personalInfo) {
              setPersonalInfo(data.personalInfo);
            }
            if (data.education) {
              setEducation(data.education);
            }
            if (data.experience) {
              setWorkExperience(data.experience);
            }
            if (data.skills) {
              setSkills(data.skills);
            }
          }
          // No need to show any error if no data exists
        } else if (response.status === 404) {
          // CV data doesn't exist yet, this is normal for new users
          console.log('No existing CV data found');
        } else {
          // Only show error for actual API failures
          console.error('Error fetching CV data:', response.statusText);
          setSnackbar({
            open: true,
            message: 'Failed to fetch CV data. Please try again later.',
            severity: 'error'
          });
        }
      } catch (error) {
        // Only show error for network/connection issues
        console.error('Error fetching CV data:', error);
        setSnackbar({
          open: true,
          message: 'Connection error. Please check your internet connection.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCVData();
  }, [currentUser]);

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Logo */}
      <Box sx={{
        position: 'fixed',
        top: 20,
        left: 32,
        cursor: 'pointer',
        zIndex: 1200
      }} onClick={() => navigate('/home')}>
        <Logo />
      </Box>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        pt: 2
      }}>
        <Container maxWidth="lg" sx={{ py: 8, mt: 4 }}>
          <Paper elevation={3} sx={{
            p: 4,
            bgcolor: theme => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{
                background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                Resume Parser
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  py: 1.2,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    background: theme => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    transform: 'translateY(-1px)',
                    boxShadow: theme => `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                Save Resume
              </Button>
            </Box>

            {/* File Upload */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper {...getRootProps()} elevation={0} sx={{
                  p: 3,
                  mb: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: theme => alpha(theme.palette.background.paper, 0.6),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: theme => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }}>
                  <input {...getInputProps()} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CloudUploadIcon sx={{
                      fontSize: 48,
                      color: isDragActive ? 'primary.main' : 'text.secondary'
                    }} />
                    <Typography variant="h6" sx={{
                      color: isDragActive ? 'primary.main' : 'text.primary',
                      textAlign: 'center'
                    }}>
                      {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume here, or click to select'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Supports PDF and DOCX files (max 5MB)
                    </Typography>
                    {parsing && (
                      <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Status Messages */}
              <AnimatePresence>
                {snackbar.open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <MuiAlert
                      severity={snackbar.severity}
                      sx={{ mb: 2 }}
                      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    >
                      {snackbar.message}
                    </MuiAlert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personal Information */}
              <Grid item xs={12}>
                <PersonalInfoForm
                  personalInfo={personalInfo}
                  onUpdate={handleFormChange}
                />
              </Grid>

              {/* Skills */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Skills & Languages
                </Typography>
                <Autocomplete
                  multiple
                  options={commonSkills}
                  value={skills}
                  onChange={(_, newValue) => setSkills(newValue)}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option}
                        label={option}
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: theme => alpha(
                            option.includes('Language') ? theme.palette.secondary.main : theme.palette.primary.main,
                            0.1
                          )
                        }}
                      />
                    ))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Add skills..."
                      helperText="Type or select skills from the list"
                    />
                  )}
                />
              </Grid>

              {/* Languages Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Languages
                  </Typography>
                  {languages.map((language, index) => (
                    <LanguageForm
                      key={index}
                      language={language}
                      onUpdate={updatedLanguage => {
                        const newLanguages = [...languages];
                        newLanguages[index] = updatedLanguage;
                        setLanguages(newLanguages);
                      }}
                      onDelete={() => {
                        const newLanguages = languages.filter((_, i) => i !== index);
                        setLanguages(newLanguages);
                      }}
                    />
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setLanguages([...languages, { name: '', proficiency: '' }])}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Add Language
                  </Button>
                </Box>
              </Grid>

              {/* Work Experience */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Work Experience</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addWorkExperience}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Add Experience
                  </Button>
                </Box>
                {workExperience.map(exp => (
                  <WorkExperienceForm
                    key={exp.id}
                    experience={exp}
                    onUpdate={updated => setWorkExperience(workExperience.map(e => e.id === updated.id ? updated : e))}
                    onDelete={id => setWorkExperience(workExperience.filter(e => e.id !== id))}
                  />
                ))}
              </Grid>

              {/* Education */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Education</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addEducation}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Add Education
                  </Button>
                </Box>
                {education.map(edu => (
                  <EducationForm
                    key={edu.id}
                    education={edu}
                    onUpdate={updated => setEducation(education.map(e => e.id === updated.id ? updated : e))}
                    onDelete={id => setEducation(education.filter(e => e.id !== id))}
                  />
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Container>
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
        <MuiAlert severity="success" onClose={() => setShowSaveSuccess(false)}>
          Changes saved successfully
        </MuiAlert>
      </Snackbar>

      {/* Leave Page Dialog */}
      <Dialog open={showLeaveDialog} onClose={handleStayOnPage}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Would you like to save them before leaving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStayOnPage}>Stay on Page</Button>
          <Button onClick={handleLeavePage} color="primary">
            Save and Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeParser;