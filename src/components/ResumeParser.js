import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Autocomplete,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import Sidebar from './Sidebar';

// Common skills for autocomplete
const commonSkills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
  'Project Management', 'Leadership', 'Communication',
  'Problem Solving', 'Team Management', 'Agile',
  'Data Analysis', 'Machine Learning', 'DevOps',
];

const degrees = ['High School', 'Associate', "Bachelor's", "Master's", 'PhD', 'Other'];

const WorkExperienceForm = ({ experience, onUpdate, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(experience.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Job Title"
            value={experience.title}
            onChange={(e) => onUpdate({ ...experience, title: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company"
            value={experience.company}
            onChange={(e) => onUpdate({ ...experience, company: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={experience.startDate}
              onChange={(date) => onUpdate({ ...experience, startDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={experience.endDate}
              onChange={(date) => onUpdate({ ...experience, endDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={experience.description}
            onChange={(e) => onUpdate({ ...experience, description: e.target.value })}
            variant="outlined"
            helperText="Use action verbs like 'Led', 'Managed', 'Developed' to describe your achievements"
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            pb: 1,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            Are you sure you want to delete this work experience? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const EducationForm = ({ education, onUpdate, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(education.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Degree</InputLabel>
            <Select
              value={education.degree}
              onChange={(e) => onUpdate({ ...education, degree: e.target.value })}
              label="Degree"
            >
              {degrees.map((degree) => (
                <MenuItem key={degree} value={degree}>
                  {degree}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Institution"
            value={education.institution}
            onChange={(e) => onUpdate({ ...education, institution: e.target.value })}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Graduation Year"
            type="number"
            value={education.graduationYear}
            onChange={(e) => onUpdate({ ...education, graduationYear: e.target.value })}
            variant="outlined"
            InputProps={{ inputProps: { min: 1900, max: 2100 } }}
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
            Remove Education
          </Button>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            pb: 1,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            Are you sure you want to delete this education entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const ResumeParser = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [skills, setSkills] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      if (uploadedFile.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 5MB',
          severity: 'error',
        });
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(uploadedFile.type)) {
        setSnackbar({
          open: true,
          message: 'Please upload a PDF or DOCX file',
          severity: 'error',
        });
        return;
      }
      setFile(uploadedFile);
      handleParseResume(uploadedFile);
    }
  }, []);

  const handleParseResume = async (uploadedFile) => {
    setParsing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('http://localhost:8000/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      
      // Extract name from email or first part of email
      const emailName = data.personal_info.email ? data.personal_info.email.split('@')[0] : '';
      const [firstName = '', lastName = ''] = emailName.split('.');
      
      // Update personal information
      setPersonalInfo({
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        email: data.personal_info.email || '',
        phone: data.personal_info.phone || '',
      });
      
      // Update skills
      if (data.skills && data.skills.length > 0) {
        setSkills(data.skills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)));
      }
      
      // Update work experience
      if (data.work_experience && data.work_experience.length > 0) {
        const formattedExperience = data.work_experience.map((exp, index) => {
          // Try to extract dates from the description
          const datesMatch = exp.dates ? exp.dates.match(/(\d{4})\s*-\s*(\d{4}|present)/i) : null;
          let startDate = null;
          let endDate = null;
          
          if (datesMatch) {
            startDate = new Date(datesMatch[1], 0);
            endDate = datesMatch[2].toLowerCase() === 'present' 
              ? new Date() 
              : new Date(datesMatch[2], 11);
          }

          // Try to extract position from description
          const positionMatch = exp.description ? exp.description.match(/(?:as|position|title|role):\s*([^,.\n]+)/i) : null;
          const position = positionMatch ? positionMatch[1].trim() : '';

          return {
            id: index,
            company: exp.company || '',
            position: position,
            startDate: startDate,
            endDate: endDate,
            description: exp.description || '',
          };
        });

        setWorkExperience(formattedExperience);
      }
      
      // Update education
      if (data.education && data.education.length > 0) {
        const formattedEducation = data.education.map((edu, index) => {
          // Try to extract graduation date
          const yearMatch = edu.description ? edu.description.match(/\b(19|20)\d{2}\b/) : null;
          const graduationDate = yearMatch ? new Date(yearMatch[0], 5) : null;

          // Try to extract field of study
          const fieldMatch = edu.degree ? edu.degree.match(/(?:in|of)\s+([^,.\n]+)/i) : null;
          const field = fieldMatch ? fieldMatch[1].trim() : '';

          return {
            id: index,
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: field,
            graduationDate: graduationDate,
          };
        });

        setEducation(formattedEducation);
      }

      setSnackbar({
        open: true,
        message: 'Resume parsed successfully! Please review and edit the extracted information.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      setSnackbar({
        open: true,
        message: 'Failed to parse resume. Please try again or fill in the information manually.',
        severity: 'error',
      });
    } finally {
      setParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        id: Date.now(),
        title: '',
        company: '',
        startDate: null,
        endDate: null,
        description: '',
      },
    ]);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now(),
        degree: '',
        institution: '',
        graduationYear: '',
      },
    ]);
  };

  const handleSave = async () => {
    setSnackbar({
      open: true,
      message: 'Resume data saved successfully!',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Logo - Fixed position */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: 32,
          cursor: 'pointer',
          zIndex: 1200, // Above sidebar
        }}
        onClick={() => navigate('/home')}
      >
        <Logo />
      </Box>

      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
          pt: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 8, mt: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
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
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                Save Resume
              </Button>
            </Box>

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Paper
                {...getRootProps()}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <input {...getInputProps()} />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 48,
                      color: isDragActive ? 'primary.main' : 'text.secondary',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: isDragActive ? 'primary.main' : 'text.primary',
                      textAlign: 'center',
                    }}
                  >
                    {isDragActive
                      ? 'Drop your resume here'
                      : 'Drag and drop your resume here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Supports PDF and DOCX files (max 5MB)
                  </Typography>
                  {file && (
                    <Chip
                      label={file.name}
                      onDelete={() => setFile(null)}
                      color="primary"
                      variant="outlined"
                      icon={<PreviewIcon />}
                    />
                  )}
                  {parsing && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: 'primary.main',
                      }}
                    />
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
                  <Alert
                    severity={snackbar.severity}
                    sx={{ mb: 2 }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                  >
                    {snackbar.message}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Personal Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Skills */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Skills
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
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      '& .MuiChip-deleteIcon': {
                        color: 'primary.main',
                      },
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Add skills..."
                  helperText="Type or select skills from the list"
                />
              )}
              sx={{ mb: 4 }}
            />

            {/* Work Experience */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Work Experience</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addWorkExperience}
                variant="outlined"
                color="primary"
              >
                Add Experience
              </Button>
            </Box>
            {workExperience.map((exp) => (
              <WorkExperienceForm
                key={exp.id}
                experience={exp}
                onUpdate={(updated) =>
                  setWorkExperience(workExperience.map((e) => (e.id === updated.id ? updated : e)))
                }
                onDelete={(id) => setWorkExperience(workExperience.filter((e) => e.id !== id))}
              />
            ))}

            {/* Education */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
              <Typography variant="h6">Education</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addEducation}
                variant="outlined"
                color="primary"
              >
                Add Education
              </Button>
            </Box>
            {education.map((edu) => (
              <EducationForm
                key={edu.id}
                education={edu}
                onUpdate={(updated) =>
                  setEducation(education.map((e) => (e.id === updated.id ? updated : e)))
                }
                onDelete={(id) => setEducation(education.filter((e) => e.id !== id))}
              />
            ))}
          </Paper>
        </Container>
      </Box>
      {/* Save Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeParser;
