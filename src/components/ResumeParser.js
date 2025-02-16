import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCV } from '../contexts/CVContext';
import { cvService } from '../services/cvService';
import { 
  Box, 
  Button, 
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Chip,
  Autocomplete
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

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
          <Typography variant="body1" sx={{ mb: 1 }}>Position</Typography>
          <TextField
            fullWidth
            value={experience.position || ''}
            onChange={e => onUpdate({ ...experience, position: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Company</Typography>
          <TextField
            fullWidth
            value={experience.company || ''}
            onChange={e => onUpdate({ ...experience, company: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Start Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
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
            <Typography variant="body1" sx={{ mb: 1 }}>End Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
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
          <Typography variant="body1" sx={{ mb: 1 }}>Description</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
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
          <Typography variant="body1" sx={{ mb: 1 }}>Institution</Typography>
          <TextField
            fullWidth
            value={education.institution || ''}
            onChange={e => onUpdate({ ...education, institution: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Degree</Typography>
          <TextField
            fullWidth
            value={education.degree || ''}
            onChange={e => onUpdate({ ...education, degree: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Start Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
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
            <Typography variant="body1" sx={{ mb: 1 }}>End Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
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
          <Typography variant="body1" sx={{ mb: 1 }}>Full Name</Typography>
          <TextField
            fullWidth
            value={personalInfo.name}
            onChange={e => onUpdate({ ...personalInfo, name: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Email</Typography>
          <TextField
            fullWidth
            value={personalInfo.email}
            onChange={e => onUpdate({ ...personalInfo, email: e.target.value })}
            variant="outlined"
            type="email"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Phone</Typography>
          <TextField
            fullWidth
            value={personalInfo.phone}
            onChange={e => onUpdate({ ...personalInfo, phone: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Location</Typography>
          <TextField
            fullWidth
            value={personalInfo.location}
            onChange={e => onUpdate({ ...personalInfo, location: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>LinkedIn URL</Typography>
          <TextField
            fullWidth
            value={personalInfo.linkedin}
            onChange={e => onUpdate({ ...personalInfo, linkedin: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>GitHub URL</Typography>
          <TextField
            fullWidth
            value={personalInfo.github}
            onChange={e => onUpdate({ ...personalInfo, github: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" sx={{ mb: 1 }}>Professional Summary</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
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
          <Typography variant="body1" sx={{ mb: 1 }}>Language</Typography>
          <TextField
            fullWidth
            value={language.name}
            onChange={e => onUpdate({ ...language, name: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>Proficiency</Typography>
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

export default function ResumeParser() {
  const { currentUser } = useAuth();
  const { cvData, updateCVData } = useCV();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    summary: ''
  });

  // Education state
  const [education, setEducation] = useState([]);
  
  // Work Experience state
  const [workExperience, setWorkExperience] = useState([]);
  
  // Skills state
  const [skills, setSkills] = useState([]);
  
  // Languages state
  const [languages, setLanguages] = useState([]);

  // Certifications state
  const [certifications, setCertifications] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSave = async () => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Please log in to save your changes',
        severity: 'error'
      });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const cvData = {
        summary: personalInfo.summary,
        personal_info: personalInfo,
        education,
        experience: workExperience,
        skills,
        languages,
        certifications
      };
      
      await cvService.processCV(new Blob([JSON.stringify(cvData)], { type: 'application/json' }));
      setSuccessMessage('CV saved successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePersonalInfo = (newInfo) => {
    setPersonalInfo(newInfo);
    setHasUnsavedChanges(true);
  };

  const handleUpdateEducation = (index, newData) => {
    setEducation(prev => {
      const updated = [...prev];
      updated[index] = newData;
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateExperience = (index, newData) => {
    setWorkExperience(prev => {
      const updated = [...prev];
      updated[index] = newData;
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleDeleteExperience = (index) => {
    setWorkExperience(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const result = await cvService.processCV(file);
      
      if (result) {
        setPersonalInfo(result.personal_info || {});
        setEducation(result.education || []);
        setWorkExperience(result.experience || []);
        setSkills(result.skills || []);
        setLanguages(result.languages || []);
        setCertifications(result.certifications || []);
        setSuccessMessage('CV data extracted successfully!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    await handleFileUpload({ target: { files: [file] } });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const addWorkExperience = () => {
    const newExp = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      highlights: []
    };
    setWorkExperience(prev => [...prev, newExp]);
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: ''
    };
    setEducation(prev => [...prev, newEdu]);
  };

  useEffect(() => {
    const loadUserCVData = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setLoading(true);
        const profile = await cvService.getCVProfile(currentUser.uid);
        if (profile) {
          setPersonalInfo(profile.personal_info || {});
          setEducation(profile.education || []);
          setWorkExperience(profile.experience || []);
          setSkills(profile.skills || []);
          setLanguages(profile.languages || []);
          setCertifications(profile.certifications || []);
        }
      } catch (error) {
        console.error('Error loading CV data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load CV data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserCVData();
  }, [currentUser]);

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle route changes within the app
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleLocationChange = () => {
      if (hasUnsavedChanges) {
        setShowLeaveDialog(true);
        return false;
      }
      return true;
    };

    return navigate(handleLocationChange);
  }, [hasUnsavedChanges, navigate]);

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  // Leave confirmation dialog
  const LeaveConfirmationDialog = () => (
    <Dialog 
      open={showLeaveDialog} 
      onClose={() => setShowLeaveDialog(false)}
    >
      <DialogTitle>Unsaved Changes</DialogTitle>
      <DialogContent>
        <Typography>
          You have unsaved changes. Would you like to save them before leaving?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowLeaveDialog(false)} 
          color="primary"
        >
          Stay on Page
        </Button>
        <Button
          onClick={async () => {
            try {
              await handleSave();
              setShowLeaveDialog(false);
              setHasUnsavedChanges(false);
              // Allow navigation to proceed
              window.history.forward();
            } catch (error) {
              console.error('Failed to save changes:', error);
              setSnackbar({
                open: true,
                message: 'Failed to save changes. Please try again.',
                severity: 'error'
              });
            }
          }}
          color="primary"
        >
          Save and Leave
        </Button>
        <Button
          onClick={() => {
            setShowLeaveDialog(false);
            setHasUnsavedChanges(false);
            // Allow navigation to proceed
            window.history.forward();
          }}
          color="error"
        >
          Leave Without Saving
        </Button>
      </DialogActions>
    </Dialog>
  );

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
      <Box sx={{
        position: 'fixed',
        top: 20,
        left: 32,
        cursor: 'pointer',
        zIndex: 1200
      }} onClick={() => navigate('/home')}>
        <Logo />
      </Box>

      <Sidebar />

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
                    {loading && (
                      <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                    )}
                  </Box>
                </Paper>
              </Grid>

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
                      onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                      {snackbar.message}
                    </MuiAlert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Grid item xs={12}>
                <PersonalInfoForm
                  personalInfo={personalInfo}
                  onUpdate={handleUpdatePersonalInfo}
                />
              </Grid>

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
                        key={`skill-${index}`}
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

              <Grid item xs={12}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Languages
                  </Typography>
                  {languages.map((language, index) => (
                    <LanguageForm
                      key={`lang-${index}`}
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
                {workExperience.map((exp, index) => (
                  <WorkExperienceForm
                    key={`exp-${index}`}
                    experience={exp}
                    onUpdate={updated => setWorkExperience(workExperience.map(e => e.id === updated.id ? updated : e))}
                    onDelete={id => setWorkExperience(workExperience.filter(e => e.id !== id))}
                  />
                ))}
              </Grid>

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
                {education.map((edu, index) => (
                  <EducationForm
                    key={`edu-${index}`}
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

      {loading && (
        <Box display="flex" alignItems="center" justifyContent="center" my={2}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Saving changes...
          </Typography>
        </Box>
      )}
      <LeaveConfirmationDialog />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}