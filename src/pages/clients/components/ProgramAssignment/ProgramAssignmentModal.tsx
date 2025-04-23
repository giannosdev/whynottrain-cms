import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { 
  useList, 
  useCreate, 
  useNotification
} from "@refinedev/core";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveIcon from "@mui/icons-material/Save";

/**
 * Interface for the ProgramAssignmentModal component props
 */
interface ProgramAssignmentModalProps {
  /**
   * Boolean for modal open state
   */
  open: boolean;
  
  /**
   * Function to close the modal
   */
  onClose: () => void;
  
  /**
   * Client ID to assign the program to
   */
  clientId: string;
  
  /**
   * Client name to display
   */
  clientName: string;
}

/**
 * Interface for a program instance used in the assignment
 */
interface ProgramInstance {
  programId: string;
  userId: string;
  startDate: Date;
  chosenDays: number[];
  assignedById: string;
}

/**
 * Component for assigning a workout program to a client
 */
const ProgramAssignmentModal: React.FC<ProgramAssignmentModalProps> = ({
  open,
  onClose,
  clientId,
  clientName
}) => {
  // State for selected program
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  
  // State for program schedule
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [chosenDays, setChosenDays] = useState<number[]>([1, 3, 5]); // Default to Mon, Wed, Fri
  
  // State for form validation
  const [errors, setErrors] = useState<{
    program?: string;
    startDate?: string;
    chosenDays?: string;
  }>({});
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Get notification controller from refine
  const { open: openNotification } = useNotification();
  
  // Fetch available programs
  const { data: programsData, isLoading: isLoadingPrograms } = useList({
    resource: "programs",
    pagination: {
      current: 1,
      pageSize: 100
    }
  });
  
  // Create mutation for program instance
  const { mutate: createProgramInstance } = useCreate();
  
  // Get selected program details
  const selectedProgram = programsData?.data?.find(
    (program: any) => program.id === selectedProgramId
  );
  
  /**
   * Handle program selection
   */
  const handleProgramSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProgramId(event.target.value as string);
    
    if (errors.program) {
      setErrors(prev => ({ ...prev, program: undefined }));
    }
  };
  
  /**
   * Toggle a day selection
   */
  const handleToggleDay = (day: number) => {
    setChosenDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort((a, b) => a - b);
      }
    });
    
    if (errors.chosenDays) {
      setErrors(prev => ({ ...prev, chosenDays: undefined }));
    }
  };
  
  /**
   * Validate the form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: {
      program?: string;
      startDate?: string;
      chosenDays?: string;
    } = {};
    
    if (!selectedProgramId) {
      newErrors.program = "Please select a program";
    }
    
    if (!startDate) {
      newErrors.startDate = "Please select a start date";
    }
    
    if (chosenDays.length === 0) {
      newErrors.chosenDays = "Please select at least one training day";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle form submission to assign program
   */
  const handleAssignProgram = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create program instance payload
    const programInstance: ProgramInstance = {
      programId: selectedProgramId,
      userId: clientId,
      startDate: startDate as Date,
      chosenDays,
      assignedById: "current-user-id" // TODO: Replace with actual logged-in user ID
    };
    
    // Call the create mutation
    createProgramInstance(
      {
        resource: "program-instances",
        values: programInstance
      },
      {
        onSuccess: () => {
          // Show success notification
          openNotification?.({
            type: "success",
            message: "Program Assigned Successfully",
            description: `Program has been assigned to ${clientName}`
          });
          
          // Reset form and close modal
          resetForm();
          onClose();
        },
        onError: (error) => {
          // Show error notification
          openNotification?.({
            type: "error",
            message: "Failed to Assign Program",
            description: error.message || "An unexpected error occurred"
          });
          setIsSubmitting(false);
        }
      }
    );
  };
  
  /**
   * Reset the form to default values
   */
  const resetForm = () => {
    setSelectedProgramId("");
    setStartDate(new Date());
    setChosenDays([1, 3, 5]);
    setErrors({});
    setIsSubmitting(false);
  };
  
  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  // Day names for display
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Assign Program to {clientName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3}>
            {/* Program Selection */}
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.program}
              >
                <InputLabel id="program-select-label">Select Program</InputLabel>
                <Select
                  labelId="program-select-label"
                  value={selectedProgramId}
                  onChange={handleProgramSelect}
                  label="Select Program"
                  disabled={isLoadingPrograms || isSubmitting}
                  startAdornment={
                    isLoadingPrograms ? (
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    ) : (
                      <FitnessCenterIcon sx={{ mr: 1 }} />
                    )
                  }
                >
                  {programsData?.data?.map((program: any) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.program && (
                  <FormHelperText error>{errors.program}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Program Details (if selected) */}
            {selectedProgram && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Program Details
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {selectedProgram.description || "No description provided"}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip 
                        icon={<CalendarMonthIcon />} 
                        label={`${selectedProgram.durationDays || 28} Days Total`} 
                        variant="outlined" 
                        color="primary"
                      />
                      <Chip 
                        icon={<DateRangeIcon />} 
                        label={`${selectedProgram.rotationDays || 7} Day Rotation`}
                        variant="outlined"
                        color="secondary" 
                      />
                      <Chip 
                        icon={<FitnessCenterIcon />} 
                        label={`${selectedProgram.allocatedWorkouts?.length || 0} Workouts`}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Program Schedule */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newDate) => {
                  setStartDate(newDate);
                  if (errors.startDate) {
                    setErrors(prev => ({ ...prev, startDate: undefined }));
                  }
                }}
                disablePast
                slotProps={{
                  textField: {
                    variant: "outlined",
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                    disabled: isSubmitting
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                Training Days
                {errors.chosenDays && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.chosenDays}
                  </Typography>
                )}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {dayNames.map((day, index) => (
                  <Chip
                    key={index}
                    label={day.substring(0, 3)}
                    color={chosenDays.includes(index) ? "primary" : "default"}
                    onClick={() => handleToggleDay(index)}
                    disabled={isSubmitting}
                    sx={{ 
                      fontWeight: chosenDays.includes(index) ? 'bold' : 'normal',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Tips Section */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  <strong>Tips:</strong> Program will be scheduled starting from the selected date. 
                  The client will be notified about the new program assignment and will see the program 
                  in their mobile app dashboard.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignProgram}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSubmitting ? "Assigning..." : "Assign Program"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramAssignmentModal;
