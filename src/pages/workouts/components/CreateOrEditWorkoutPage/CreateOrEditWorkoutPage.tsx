import React, { useState, useEffect } from "react";
import { Edit, Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
    Box,
    TextField,
    Typography,
    Paper,
} from "@mui/material";
import ColumnListWithActionBtn from "../../../../components/ColumnListWithActionBtn/ColumnListWithActionBtn";
import AddNewExerciseDialog from "../dialogs/AddNewExerciseDialog/AddNewExerciseDialog";
import { v4 as uuidv4 } from "uuid";
import AllocatedExerciseEditor from "../../../components/AllocatedExerciseEditor/AllocatedExerciseEditor";

/* ------------------------- Define Your Interfaces ------------------------- */

/** A base exercise in the workout. (Previously "AllocatedExercise") */
export interface WorkoutExercise {
    id: string;
    exercise: {
        id: string;
        name: string;
        description?: string;
        primaryMuscleId?: string;
        videoUrl?: string;
        type?: string;
        createdAt?: string;
        updatedAt?: string;
    };
    sets: JsonValue[];       // e.g., array of set details
    order: number;     // Must be an integer
    exerciseId: string; // Copied from exercise.id
    notes?: string;     // Optional notes
}

export interface Workout {
    id?: string;
    name: string;
    description: string;
    workoutExercises: WorkoutExercise[]; // The base exercises
}

/* ---------------------------------- The Workout Form Page (Edit/Create) ---------------------------------- */
export const CreateOrEditWorkoutPage = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        control,
        setValue,
        formState: { errors },
        getValues,
        watch,
    } = useForm<Workout>({
        defaultValues: {
            name: "",
            description: "",
            workoutExercises: [],
        },
    });

    // Determine if we're in edit mode based on query data.
    const isEditMode = Boolean(query.data);
    const PageWrapper = isEditMode ? Edit : Create;

    // On mount (or whenever query.data changes), initialize the form with existing data
    useEffect(() => {
        if (query.data?.workoutExercises) {
            const normalizedExercises = query.data.workoutExercises.map(
                (we: any, index: number) => {
                    // Derive a guaranteed string
                    let finalId = "";
                    if (typeof we.exerciseId === "string" && we.exerciseId.trim() !== "") {
                        finalId = we.exerciseId;
                    } else if ((we.exercise || we.exerciseData) && typeof (we.exercise.id || JSON.parse(we.exerciseData)) === "string") {
                        finalId = we.exercise.id;
                    }

                    return {
                        exercise: we.exercise || JSON.parse(we.exerciseData) || {},
                        exerciseId: finalId,
                        order: typeof we.order === "number" ? we.order : index + 1,
                        sets: we.sets || [], // default to empty array if sets is undefined
                    };
                }
            );
            setValue("workoutExercises", normalizedExercises);
            if (query.data?.name) setValue("name", query.data.name);
            if (query.data?.description) setValue("description", query.data.description);
        }
    }, [query.data, setValue]);

    // Watch the array of workoutExercises
    const workoutExercises = watch("workoutExercises");
    console.log('workoutExercises', workoutExercises);

    // Local state for selected exercise index
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

    const [newExerciseDialog, setNewExerciseDialog] = useState<boolean>(false);

    /* ------------- SETS CRUD ------------- */
    const handleUpdateSet = (setIndex: number, fieldName: "type" | "value" | "breakTime", value: any) => {
        const selectedExercise = workoutExercises.find(ex => ex.id === selectedExerciseId);
        if (!selectedExercise) return;

        const updatedExercises = workoutExercises.map(ex =>
            ex.id === selectedExerciseId
                ? { ...ex, sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, [fieldName]: value } : set)) }
                : ex
        );

        setValue("workoutExercises", updatedExercises);
    };


    const handleRemoveSet = (setIndex: number) => {
        const selectedExercise = workoutExercises.find(ex => ex.id === selectedExerciseId);
        if (!selectedExercise) return;

        const updatedExercises = workoutExercises.map(ex =>
            ex.id === selectedExerciseId
                ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
                : ex
        );

        setValue("workoutExercises", updatedExercises);
    };


    const handleAppendSet = () => {
        const selectedExercise = workoutExercises.find(ex => ex.id === selectedExerciseId);
        if (!selectedExercise) return;

        const newSet = { id: uuidv4(), type: "REPS", value: 0, breakTime: 0 };

        const updatedExercises = workoutExercises.map(ex =>
            ex.id === selectedExerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
        );

        setValue("workoutExercises", updatedExercises);
    };

    /* ------------- EXERCISE CRUD ------------- */
    const handleAddExercise = (exercise: any) => {
        const newWorkoutExercise: WorkoutExercise = {
            id: uuidv4(),
            exercise,
            exerciseId: exercise.id,
            sets: [],
            order: workoutExercises.length + 1,
            notes: "",
        };
        setValue("workoutExercises", [...workoutExercises, newWorkoutExercise]);
        setSelectedExerciseId(newWorkoutExercise.id);
    };

    const handleDeleteExercise = (item: WorkoutExercise) => {
        const exerciseToDelete = workoutExercises.find(ex => ex.id === item.id)!;

        const updated = workoutExercises.filter(ex => ex.id !== exerciseToDelete.id);
        setValue("workoutExercises", updated);

        // Clear selection if deleted exercise was selected
        if (selectedExerciseId === exerciseToDelete.id) {
            setSelectedExerciseId(null);
        }
    };

    const selectedExercise = workoutExercises.find(ex => ex.id === selectedExerciseId);


    /* ------------- RENDER ------------- */
    return (
        <PageWrapper isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
            >
                {/* Workout Name */}
                <TextField
                    {...register("name", { required: "This field is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    label="Name"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* Workout Description */}
                <TextField
                    {...register("description", { required: "This field is required" })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    InputLabelProps={{ shrink: true }}
                />

                {/* Exercises Column */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <ColumnListWithActionBtn<WorkoutExercise>
                        selectFirstItem
                        sortable
                        title="Exercises"
                        actionBtnText="Add"
                        items={workoutExercises}
                        selectedItemId={selectedExerciseId}
                        actionBtnOnClick={() => setNewExerciseDialog(true)}
                        onDelete={(index) => handleDeleteExercise(index)}
                        onSort={(newExercises) => {
                            setValue("workoutExercises", newExercises);

                            // Ensure the selection persists after sorting
                            if (selectedExerciseId) {
                                const newIndex = newExercises.findIndex(ex => ex.id === selectedExerciseId);
                                if (newIndex !== -1) {
                                    setSelectedExerciseId(newExercises[newIndex].id);
                                } else {
                                    setSelectedExerciseId(null); // Clear selection if the item is no longer present
                                }
                            }
                        }}                        onSelect={(item) => setSelectedExerciseId(item.id)}
                        renderItemContent={(ex, idx) => {
                            return `Exercise #${idx + 1}: ${(ex.exercise ?? JSON.parse(ex.exerciseData))?.name}`
                        }}
                    />

                    <AddNewExerciseDialog
                        isOpen={newExerciseDialog}
                        dialogTitle="Add New Exercise"
                        onClose={() => setNewExerciseDialog(false)}
                        onAdd={(exercise) => {
                            handleAddExercise(exercise);
                            setNewExerciseDialog(false);
                        }}
                    />

                    {/* Display Sets for the selected exercise */}
                    {selectedExercise && (
                            <AllocatedExerciseEditor
                                exercise={selectedExercise}
                                onUpdateSet={handleUpdateSet}
                                onRemoveSet={handleRemoveSet}
                                onAppendSet={handleAppendSet}
                            />
                    )}
                </Box>
            </Box>
        </PageWrapper>
    );
};

export default CreateOrEditWorkoutPage;
