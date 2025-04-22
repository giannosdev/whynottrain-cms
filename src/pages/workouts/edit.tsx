import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Autocomplete,
    Typography,
    Button,
    Paper,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import ColumnListWithActionBtn from "../../components/ColumnListWithActionBtn/ColumnListWithActionBtn";
import { v4 as uuidv4 } from "uuid";
import React, { useState } from "react";
import AddNewExerciseDialog from "./components/dialogs/AddNewExerciseDialog/AddNewExerciseDialog";
import CreateOrEditWorkoutPage from "./components/CreateOrEditWorkoutPage/CreateOrEditWorkoutPage";

/* -------------------------
   Define Your Interfaces
------------------------- */
export interface Exercise {
    id: string;
    name: string;
    description?: string;
    primaryMuscleId?: string;
    videoUrl?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Workout {
    id?: string;
    name: string;
    description: string;
    exercises: Exercise[];
    // Add other fields as needed.
}

/* ----------------------------------
   The WorkoutsEdit Page
---------------------------------- */
export const WorkoutsEdit = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        control,
        setValue,
        formState: { errors },
        watch,
    } = useForm<Workout>({
        defaultValues: {
            name: "",
            description: "",
            exercises: [],
        },
    });

    // Watch the "exercises" field from the form
    const exercises = watch("exercises");

    // State for the selected exercise (to display extra details)
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    // --- Sorting exercises (if needed)
    const handleSortExercises = (newExerciseArray: Exercise[]) => {
        setValue("exercises", newExerciseArray); // update the form state directly
    };

    // --- Add an exercise from the dialog.
    const handleAddExercise = (exercise: Exercise) => {
        // Append the new exercise to the current list of exercises
        const updatedExercises = [...exercises, exercise];
        setValue("exercises", updatedExercises);
    };

    // Dialog state for adding or editing an exercise.
    const [newExerciseDialog, setNewExerciseDialog] = useState<{ mode: "create" | "edit" | null }>({ mode: null });

    return (
        <CreateOrEditWorkoutPage />
    );
};

export default WorkoutsEdit;
