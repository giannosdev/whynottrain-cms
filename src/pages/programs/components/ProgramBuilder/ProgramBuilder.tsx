import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useCreate, useList, useUpdate } from "@refinedev/core";
import { v4 as uuidv4 } from "uuid";
import ProgramBuilderDragDrop from "./ProgramBuilderDragDrop";
import ExerciseSetEditor from "./ExerciseSetEditor";
import { AllocatedWorkout, AllocatedExercise, Program } from "../CreateOrEditProgramPage";
import AddNewWorkoutDialog from "../AddNewWorkoutDialog";

/**
 * Interface for the ProgramBuilder component props
 */
interface ProgramBuilderProps {
  /**
   * The current program data
   */
  program: Program;
  
  /**
   * Function to update the program data
   */
  onProgramUpdate: (updatedProgram: Program) => void;
  
  /**
   * Function to call when saving the program
   */
  onSave: () => void;
  
  /**
   * Boolean indicating if program is being saved
   */
  isSaving: boolean;
}

/**
 * Main Program Builder component that integrates the drag-drop interface and exercise editor
 */
const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  program,
  onProgramUpdate,
  onSave,
  isSaving
}) => {
  // State for tracking selected items
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  
  // Workouts data from the program
  const [workouts, setWorkouts] = useState<AllocatedWorkout[]>(program.allocatedWorkouts || []);
  
  // State for dialogs
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [targetWorkoutIdForExercise, setTargetWorkoutIdForExercise] = useState<string | null>(null);
  
  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info"
  });
  
  // Resource hooks for data fetching
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useList({
    resource: "workouts",
    pagination: { current: 1, pageSize: 100 }
  });
  
  const { data: exercisesData, isLoading: isLoadingExercises } = useList({
    resource: "exercises",
    pagination: { current: 1, pageSize: 100 }
  });

  /**
   * Update the workouts in the program when they change
   */
  useEffect(() => {
    if (workouts !== program.allocatedWorkouts) {
      onProgramUpdate({
        ...program,
        allocatedWorkouts: workouts
      });
    }
  }, [workouts]);

  /**
   * Update selected workout if it gets removed
   */
  useEffect(() => {
    if (selectedWorkoutId && !workouts.some(w => w.id === selectedWorkoutId)) {
      setSelectedWorkoutId(null);
      setSelectedExerciseId(null);
    }
  }, [workouts, selectedWorkoutId]);

  /**
   * Update selected exercise if it gets removed
   */
  useEffect(() => {
    if (selectedExerciseId && selectedWorkoutId) {
      const workout = workouts.find(w => w.id === selectedWorkoutId);
      if (!workout || !workout.allocatedExercises.some(e => e.id === selectedExerciseId)) {
        setSelectedExerciseId(null);
      }
    }
  }, [workouts, selectedWorkoutId, selectedExerciseId]);

  /**
   * Handle workout reordering from drag and drop
   */
  const handleWorkoutsReorder = (updatedWorkouts: AllocatedWorkout[]) => {
    setWorkouts(updatedWorkouts);
  };

  /**
   * Open dialog to add a new workout
   */
  const handleAddWorkout = () => {
    setIsAddWorkoutDialogOpen(true);
  };

  /**
   * Add a workout to the program
   */
  const handleWorkoutAdded = (newWorkout: any) => {
    const newAllocatedWorkout: AllocatedWorkout = {
      id: `new-${uuidv4()}`,
      workoutId: newWorkout.id,
      workout: { ...newWorkout },
      order: workouts.length + 1,
      name: newWorkout.name,
      note: "",
      allocatedExercises: newWorkout.workoutExercises?.map((ae: any) => ({
        id: uuidv4(),
        exerciseId: (ae.exercise || (ae.exerciseData ? JSON.parse(ae.exerciseData) : null))?.id,
        exercise: { ...(ae.exercise || (ae.exerciseData ? JSON.parse(ae.exerciseData) : { id: "", name: "Unknown" })) },
        sets: ae.sets || [],
        order: ae.order || 1,
        notes: "",
      })) || [],
    };
    
    const updatedWorkouts = [...workouts, newAllocatedWorkout];
    setWorkouts(updatedWorkouts);
    setSelectedWorkoutId(newAllocatedWorkout.id);
    
    if (newAllocatedWorkout.allocatedExercises.length > 0) {
      setSelectedExerciseId(newAllocatedWorkout.allocatedExercises[0].id);
    }
    
    setNotification({
      open: true,
      message: "Workout added successfully",
      severity: "success"
    });
    
    setIsAddWorkoutDialogOpen(false);
  };

  /**
   * Edit a workout
   */
  const handleEditWorkout = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    const workout = workouts.find(w => w.id === workoutId);
    
    // For now, we'll just allow editing the notes in a simple dialog
    // In a more advanced version, you could open a full workout editor
    const newNote = prompt("Enter workout notes:", workout?.note || "");
    
    if (newNote !== null) {
      const updatedWorkouts = workouts.map(w => {
        if (w.id === workoutId) {
          return {
            ...w,
            note: newNote
          };
        }
        return w;
      });
      
      setWorkouts(updatedWorkouts);
    }
  };

  /**
   * Delete a workout from the program
   */
  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      const updatedWorkouts = workouts
        .filter(w => w.id !== workoutId)
        .map((w, index) => ({
          ...w,
          order: index + 1
        }));
      
      setWorkouts(updatedWorkouts);
      
      if (selectedWorkoutId === workoutId) {
        setSelectedWorkoutId(null);
        setSelectedExerciseId(null);
      }
      
      setNotification({
        open: true,
        message: "Workout removed from program",
        severity: "info"
      });
    }
  };

  /**
   * Open dialog to add an exercise to a workout
   */
  const handleAddExercise = (workoutId: string) => {
    setTargetWorkoutIdForExercise(workoutId);
    setSelectedWorkoutId(workoutId);
    
    // Here we'd normally open a dialog to select exercises
    // For simplicity, we'll just add a sample exercise
    if (exercisesData?.data && exercisesData.data.length > 0) {
      const randomExercise = exercisesData.data[Math.floor(Math.random() * exercisesData.data.length)];
      
      const newExercise: AllocatedExercise = {
        id: uuidv4(),
        exerciseId: randomExercise.id,
        exercise: randomExercise,
        sets: [
          {
            id: uuidv4(),
            setNumber: 1,
            value: 12,
            type: "REPS",
            weight: 0,
            breakTime: 60
          }
        ],
        order: 1,
        notes: ""
      };
      
      const updatedWorkouts = workouts.map(w => {
        if (w.id === workoutId) {
          const exercises = [...w.allocatedExercises, newExercise].map((ex, idx) => ({
            ...ex,
            order: idx + 1
          }));
          
          return {
            ...w,
            allocatedExercises: exercises
          };
        }
        return w;
      });
      
      setWorkouts(updatedWorkouts);
      setSelectedExerciseId(newExercise.id);
      
      setNotification({
        open: true,
        message: "Exercise added successfully",
        severity: "success"
      });
    } else {
      setNotification({
        open: true,
        message: "No exercises available to add",
        severity: "error"
      });
    }
  };

  /**
   * Edit an exercise in a workout
   */
  const handleEditExercise = (workoutId: string, exerciseId: string) => {
    setSelectedWorkoutId(workoutId);
    setSelectedExerciseId(exerciseId);
    
    // The exercise will be edited in the ExerciseSetEditor component
  };

  /**
   * Delete an exercise from a workout
   */
  const handleDeleteExercise = (workoutId: string, exerciseId: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      const updatedWorkouts = workouts.map(w => {
        if (w.id === workoutId) {
          const exercises = w.allocatedExercises
            .filter(e => e.id !== exerciseId)
            .map((ex, idx) => ({
              ...ex,
              order: idx + 1
            }));
          
          return {
            ...w,
            allocatedExercises: exercises
          };
        }
        return w;
      });
      
      setWorkouts(updatedWorkouts);
      
      if (selectedExerciseId === exerciseId) {
        setSelectedExerciseId(null);
      }
      
      setNotification({
        open: true,
        message: "Exercise removed successfully",
        severity: "info"
      });
    }
  };

  /**
   * Update exercise sets
   */
  const handleUpdateSets = (exerciseId: string, sets: any[]) => {
    if (!selectedWorkoutId) return;
    
    const updatedWorkouts = workouts.map(w => {
      if (w.id === selectedWorkoutId) {
        const exercises = w.allocatedExercises.map(e => {
          if (e.id === exerciseId) {
            return {
              ...e,
              sets
            };
          }
          return e;
        });
        
        return {
          ...w,
          allocatedExercises: exercises
        };
      }
      return w;
    });
    
    setWorkouts(updatedWorkouts);
  };

  /**
   * Update exercise notes
   */
  const handleUpdateNotes = (exerciseId: string, notes: string) => {
    if (!selectedWorkoutId) return;
    
    const updatedWorkouts = workouts.map(w => {
      if (w.id === selectedWorkoutId) {
        const exercises = w.allocatedExercises.map(e => {
          if (e.id === exerciseId) {
            return {
              ...e,
              notes
            };
          }
          return e;
        });
        
        return {
          ...w,
          allocatedExercises: exercises
        };
      }
      return w;
    });
    
    setWorkouts(updatedWorkouts);
  };

  /**
   * Get the selected exercise object
   */
  const getSelectedExercise = (): AllocatedExercise | null => {
    if (!selectedWorkoutId || !selectedExerciseId) return null;
    
    const workout = workouts.find(w => w.id === selectedWorkoutId);
    if (!workout) return null;
    
    return workout.allocatedExercises.find(e => e.id === selectedExerciseId) || null;
  };

  /**
   * Handle notification close
   */
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Program Builder</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Program"}
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <ProgramBuilderDragDrop
              workouts={workouts}
              onWorkoutsReorder={handleWorkoutsReorder}
              onAddWorkout={handleAddWorkout}
              onEditWorkout={handleEditWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              onAddExercise={handleAddExercise}
              onEditExercise={handleEditExercise}
              onDeleteExercise={handleDeleteExercise}
              selectedWorkoutId={selectedWorkoutId}
              onSelectWorkout={setSelectedWorkoutId}
              selectedExerciseId={selectedExerciseId}
              onSelectExercise={setSelectedExerciseId}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            {selectedExerciseId ? (
              <ExerciseSetEditor
                exercise={getSelectedExercise()}
                onUpdateSets={handleUpdateSets}
                onUpdateNotes={handleUpdateNotes}
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <Typography color="textSecondary">
                  Select an exercise to edit its details or add a new exercise to a workout.
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add Workout Dialog */}
      <Dialog
        open={isAddWorkoutDialogOpen}
        onClose={() => setIsAddWorkoutDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Workout to Program</DialogTitle>
        <DialogContent>
          <AddNewWorkoutDialog 
            onAddWorkout={handleWorkoutAdded}
            onCancel={() => setIsAddWorkoutDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProgramBuilder;
