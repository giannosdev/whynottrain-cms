import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AllocatedExercise } from "../CreateOrEditProgramPage";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface for exercise set data
 */
interface ExerciseSet {
  id: string;
  setNumber: number;
  value?: number | null;
  type?: string | null;
  weight?: number | null;
  breakTime?: number | null;
}

/**
 * Interface for the ExerciseSetEditor component props
 */
interface ExerciseSetEditorProps {
  /**
   * The exercise being edited
   */
  exercise: AllocatedExercise | null;
  
  /**
   * Callback function when exercise sets are updated
   */
  onUpdateSets: (exerciseId: string, sets: ExerciseSet[]) => void;
  
  /**
   * Callback function when exercise notes are updated
   */
  onUpdateNotes: (exerciseId: string, notes: string) => void;
}

/**
 * Component for editing exercise sets and details within a program
 */
const ExerciseSetEditor: React.FC<ExerciseSetEditorProps> = ({
  exercise,
  onUpdateSets,
  onUpdateNotes
}) => {
  const [notes, setNotes] = useState<string>(exercise?.notes || "");

  /**
   * Create a new empty set for the exercise
   */
  const handleAddSet = () => {
    if (!exercise) return;
    
    const currentSets = Array.isArray(exercise.sets) ? [...exercise.sets] : [];
    const newSet: ExerciseSet = {
      id: uuidv4(),
      setNumber: currentSets.length + 1,
      value: null,
      type: "REPS",
      weight: null,
      breakTime: 60
    };
    
    const updatedSets = [...currentSets, newSet];
    onUpdateSets(exercise.id, updatedSets);
  };

  /**
   * Remove a set from the exercise
   */
  const handleRemoveSet = (setIndex: number) => {
    if (!exercise) return;
    
    const currentSets = Array.isArray(exercise.sets) ? [...exercise.sets] : [];
    const updatedSets = currentSets.filter((_, index) => index !== setIndex);
    
    // Renumber sets after removal
    const renumberedSets = updatedSets.map((set, index) => ({
      ...set,
      setNumber: index + 1
    }));
    
    onUpdateSets(exercise.id, renumberedSets);
  };

  /**
   * Update a specific set field
   */
  const handleSetChange = (setIndex: number, field: string, value: any) => {
    if (!exercise) return;
    
    const currentSets = Array.isArray(exercise.sets) ? [...exercise.sets] : [];
    const updatedSets = [...currentSets];
    
    // Ensure numeric fields are parsed properly
    if (field === 'value' || field === 'weight' || field === 'breakTime') {
      value = value === "" ? null : Number(value);
    }
    
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value
    };
    
    onUpdateSets(exercise.id, updatedSets);
  };

  /**
   * Handle notes change
   */
  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    if (exercise) {
      onUpdateNotes(exercise.id, newNotes);
    }
  };

  // If no exercise is selected, show empty state
  if (!exercise) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "rgba(0,0,0,0.02)" }}>
        <Typography color="textSecondary">
          Select an exercise to edit its details
        </Typography>
      </Paper>
    );
  }

  // Parse sets from exercise
  const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

  return (
    <Card>
      <CardHeader 
        title={
          <Typography variant="h6">
            {exercise.exercise?.name || "Exercise Details"}
          </Typography>
        }
      />
      
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Exercise Notes"
            multiline
            rows={2}
            fullWidth
            value={notes}
            onChange={handleNotesChange}
            variant="outlined"
            placeholder="Add specific instructions for this exercise..."
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1">Sets</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddSet}
            variant="outlined"
          >
            Add Set
          </Button>
        </Box>
        
        {sets.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "rgba(0,0,0,0.02)" }}>
            <Typography color="textSecondary">
              No sets defined. Click "Add Set" to create the first set.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="20%">Type</TableCell>
                  <TableCell width="20%">Value</TableCell>
                  <TableCell width="20%">Weight (kg)</TableCell>
                  <TableCell width="25%">Rest (sec)</TableCell>
                  <TableCell width="10%">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sets.map((set, index) => (
                  <TableRow key={set.id || index}>
                    <TableCell>{set.setNumber || index + 1}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={set.type || "REPS"}
                          onChange={(e) => handleSetChange(index, "type", e.target.value)}
                        >
                          <MenuItem value="REPS">Reps</MenuItem>
                          <MenuItem value="DURATION">Duration</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        value={set.value === null ? "" : set.value}
                        onChange={(e) => handleSetChange(index, "value", e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {set.type === "DURATION" ? "sec" : "reps"}
                            </InputAdornment>
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        value={set.weight === null ? "" : set.weight}
                        onChange={(e) => handleSetChange(index, "weight", e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">kg</InputAdornment>
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        value={set.breakTime === null ? "" : set.breakTime}
                        onChange={(e) => handleSetChange(index, "breakTime", e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">sec</InputAdornment>
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Set">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSet(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseSetEditor;
