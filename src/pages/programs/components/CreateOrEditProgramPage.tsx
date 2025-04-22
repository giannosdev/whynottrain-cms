import React, { useEffect, useState } from "react";
import { Create, Edit } from "@refinedev/mui";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { useForm } from "@refinedev/react-hook-form";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Paper,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import ColumnListWithActionBtn from "../../../components/ColumnListWithActionBtn/ColumnListWithActionBtn";
import AddNewWorkoutDialog from "./AddNewWorkoutDialog";
import AddNewExerciseDialog from "../../workouts/components/dialogs/AddNewExerciseDialog/AddNewExerciseDialog";
import AllocatedExerciseEditor from "../../components/AllocatedExerciseEditor/AllocatedExerciseEditor";
import { Workout } from "../../workouts/components/CreateOrEditWorkoutPage/CreateOrEditWorkoutPage";

const exerciseToAllocatedExercise = (exercise: any, order) => {
    return {
        id: uuidv4(),
        exerciseId: exercise.id,
        exercise: exercise,
        sets: exercise.sets,
        order,
        notes: exercise.notes ?? "",
    };
}

// Represents an allocated exercise inside an allocated workout.
export interface AllocatedExercise {
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
    sets: JsonValue[]; // e.g. array of set details
    order: number; // Must be an integer
    exerciseId: string; // This scalar is used for nested writes
    notes?: string;
}

// Represents an allocated workout attached to a program.
export interface AllocatedWorkout {
    id: string;
    workout: Workout;
    order?: number;
    note?: string;
    allocatedExercises: AllocatedExercise[];
}

// Represents the Program itself.
export interface Program {
    name: string;
    description: string;
    allocatedWorkouts: AllocatedWorkout[];
    status?: string;
}

export const CreateOrEditProgramPage = () => {
    const {
        saveButtonProps,
        refineCore: { query, formLoading },
        register,
        control,
        setValue,
        formState: { errors },
        watch,
    } = useForm<Program>({
        defaultValues: {
            name: "",
            description: "",
            allocatedWorkouts: [],
            status: "draft",
        },
    });

    console.log("Refine Query Data:", query.data);
    const isEdit = Boolean(query?.data);
    const FormWrapper = isEdit ? Edit : Create;

    // If editing, set form values once query data arrives
    // useEffect(() => {
    //     if (query?.data?.data) {
    //         reset({
    //             ...(query?.data.data || {}),
    //         });
    //     }
    // }, [query?.data?.data, reset]);

    // This watchers returns the entire array of allocatedWorkouts from the form
    const allocatedWorkouts = watch("allocatedWorkouts");

    // We track the indices for the currently selected allocated workout and allocated exercise.
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

    /** ---------------------------
     *   Field Array for workouts
     * ----------------------------*/
    const { fields: workoutFields, append: appendWorkout, move: moveWorkout, update: updateWorkout } = useFieldArray({
        control,
        name: "allocatedWorkouts",
    });


    /** Reorders workouts */
    const handleSortWorkouts = (newWorkouts: AllocatedWorkout[]) => {
        setValue("allocatedWorkouts", newWorkouts);

        // Ensure selection persists after sorting
        if (selectedWorkoutId) {
            const newIndex = newWorkouts.findIndex(w => w.id === selectedWorkoutId);
            if (newIndex === -1) {
                setSelectedWorkoutId(null); // Workout was removed
            }
        }
    };


    /** Add new allocated workout (the user picks a workout template in the dialog) */
    const handleAddWorkout = (newWorkout: Workout) => {
        const newAllocatedWorkout: AllocatedWorkout = {
            id: `new-${uuidv4()}`,
            workoutId: newWorkout.id,
            workout: { ...newWorkout },
            order: allocatedWorkouts.length + 1,
            name: newWorkout.name,
            note: "",
            allocatedExercises: newWorkout.workoutExercises?.map((ae) => ({
                id: uuidv4(),
                exerciseId: (ae.exercise || JSON.parse(ae.exerciseData)!).id,
                exercise: { ...(ae.exercise || JSON.parse(ae.exerciseData)!) },
                sets: ae.sets || [],
                order: ae.order,
                notes: "",
            })) || [],
        };

        // Manually update workouts in state
        const updatedWorkouts = [...allocatedWorkouts, newAllocatedWorkout];

        // Immediately update the workouts in the form state
        setValue("allocatedWorkouts", updatedWorkouts);

        // **Preserve existing selection**
        setTimeout(() => {
            if (!selectedWorkoutId) {
                // If no workout was selected, select the new one
                setSelectedWorkoutId(newAllocatedWorkout.id);

                // Auto-select first exercise (if exists)
                if (newAllocatedWorkout.allocatedExercises.length > 0) {
                    setSelectedExerciseId(newAllocatedWorkout.allocatedExercises[0].id);
                } else {
                    setSelectedExerciseId(null);
                }
            }
        }, 0);
    };







    const handleSelectWorkout = (aw: AllocatedWorkout) => {
        setSelectedWorkoutId(aw.id);

        // Auto-select first exercise if exists
        if (aw.allocatedExercises.length > 0) {
            setSelectedExerciseId(aw.allocatedExercises[0].id);
        } else {
            setSelectedExerciseId(null);
        }
    };


    /** ---------------------------
     *   Handling allocatedExercises
     * ----------------------------*/
    const handleSortExercises = (newExercises: AllocatedExercise[]) => {
        if (!selectedWorkoutId) return;

        const updatedWorkouts = allocatedWorkouts.map(workout =>
            workout.id === selectedWorkoutId
                ? { ...workout, allocatedExercises: newExercises }
                : workout
        );

        setValue("allocatedWorkouts", updatedWorkouts);

        // Ensure selection persists after sorting
        if (selectedExerciseId) {
            const stillExists = newExercises.some(ex => ex.id === selectedExerciseId);
            if (!stillExists) {
                setSelectedExerciseId(null); // Exercise was removed
            }
        }
    };


    const handleAddExercise = (newAllocatedExercise: AllocatedExercise) => {
        if (!selectedWorkoutId) return;

        const updatedWorkouts = allocatedWorkouts.map(workout =>
            workout.id === selectedWorkoutId
                ? {
                    ...workout,
                    allocatedExercises: [
                        ...workout.allocatedExercises,
                        {
                            ...exerciseToAllocatedExercise(
                                newAllocatedExercise,
                                workout.allocatedExercises.length + 1
                            ),
                            id: uuidv4(),
                            exerciseId: newAllocatedExercise.id,
                        },
                    ],
                }
                : workout
        );

        setValue("allocatedWorkouts", updatedWorkouts);

        // Auto-select the newly added exercise
        const newExerciseId = updatedWorkouts.find(w => w.id === selectedWorkoutId)?.allocatedExercises.slice(-1)[0].id;
        setSelectedExerciseId(newExerciseId);
    };


    const handleSelectExercise = (ae: AllocatedExercise) => {
        setSelectedExerciseId(ae.id);
    };

    const handleUpdateSet = (setIndex: number, fieldName: "type" | "value" | "breakTime", value: any) => {
        if (!selectedWorkoutId || !selectedExerciseId) return;

        const updatedWorkouts = allocatedWorkouts.map(workout =>
            workout.id === selectedWorkoutId
                ? {
                    ...workout,
                    allocatedExercises: workout.allocatedExercises.map(exercise =>
                        exercise.id === selectedExerciseId
                            ? {
                                ...exercise,
                                sets: exercise.sets.map((set, sIdx) =>
                                    sIdx === setIndex ? { ...set, [fieldName]: value } : set
                                ),
                            }
                            : exercise
                    ),
                }
                : workout
        );

        setValue("allocatedWorkouts", updatedWorkouts);
    };


    const handleRemoveSet = (setIndex: number) => {
        if (!selectedWorkoutId || !selectedExerciseId) return;

        const updatedWorkouts = allocatedWorkouts.map(workout =>
            workout.id === selectedWorkoutId
                ? {
                    ...workout,
                    allocatedExercises: workout.allocatedExercises.map(exercise =>
                        exercise.id === selectedExerciseId
                            ? { ...exercise, sets: exercise.sets.filter((_, sIdx) => sIdx !== setIndex) }
                            : exercise
                    ),
                }
                : workout
        );

        setValue("allocatedWorkouts", updatedWorkouts);
    };



    const handleAppendSet = () => {
        if (!selectedWorkoutId || !selectedExerciseId) return;

        const newSet = {
            id: uuidv4(),
            type: "REPS",
            value: 0,
            breakTime: 0,
        };

        const updatedWorkouts = allocatedWorkouts.map(workout =>
            workout.id === selectedWorkoutId
                ? {
                    ...workout,
                    allocatedExercises: workout.allocatedExercises.map(exercise =>
                        exercise.id === selectedExerciseId
                            ? { ...exercise, sets: [...exercise.sets, newSet] }
                            : exercise
                    ),
                }
                : workout
        );

        setValue("allocatedWorkouts", updatedWorkouts);
    };

    const handleDeleteWorkout = (workoutId: string) => {
        const updated = allocatedWorkouts.filter(w => w.id !== workoutId);
        setValue("allocatedWorkouts", updated);

        if (selectedWorkoutId === workoutId) {
            setSelectedWorkoutId(null);
            setSelectedExerciseId(null); // Clear exercises too
        }
    };




    /** Dialog states */
    const [isWorkoutDialogOpen, setWorkoutDialogOpen] = useState<boolean>(false);
    const [isExerciseDialogOpen, setExerciseDialogOpen] = useState<boolean>(false);

    const selectedWorkout = allocatedWorkouts.find(w => w.id === selectedWorkoutId);
    const selectedExercise = selectedWorkout?.allocatedExercises.find(e => e.id === selectedExerciseId);



    return (
        <FormWrapper isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
            >
                {/* Program Name */}
                <TextField
                    {...register("name", { required: "This field is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    label="Program Name"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* Program Description */}
                <TextField
                    {...register("description", { required: "This field is required" })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    label="Program Description"
                    fullWidth
                    multiline
                    rows={4}
                    InputLabelProps={{ shrink: true }}
                />

                {/* Allocated Workouts & Nested Allocated Exercises */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Left Column: Allocated Workouts */}
                    <ColumnListWithActionBtn<AllocatedWorkout>
                        selectFirstItem
                        sortable
                        title="Workouts"
                        actionBtnText="Add"
                        selectedItemId={selectedWorkoutId}
                        items={allocatedWorkouts}
                        onDelete={(item => handleDeleteWorkout(item.id))}
                        actionBtnOnClick={() => setWorkoutDialogOpen(true)}
                        onSort={handleSortWorkouts}
                        onSelect={(item, index) => handleSelectWorkout(item, index)}
                        renderItemContent={(aw, idx) => {
                            return `Day ${idx + 1}: ${aw.name || "Untitled"}`
                        }}
                    />

                    {/* Right Column: Allocated Exercises for the selected workout */}
                    {selectedWorkout && (
                        <ColumnListWithActionBtn<AllocatedExercise>
                            selectFirstItem
                            sortable
                            title="Exercises"
                            actionBtnText="Add"
                            selectedItemId={selectedExerciseId}
                            items={selectedWorkout.allocatedExercises}
                            actionBtnOnClick={() => setExerciseDialogOpen(true)}
                            onSort={handleSortExercises}
                            onSelect={(item) => handleSelectExercise(item)}
                            renderItemContent={(ae, idx) => {
                                return `Exercise ${idx + 1}: ${(ae.exercise || JSON.parse(ae.exerciseData)).name}`
                            }}
                        />
                    )}

                    {/* Editor for the selected allocated exercise */}
                    {selectedExercise && (
                        <AllocatedExerciseEditor
                            exercise={selectedExercise}
                            onUpdateSet={handleUpdateSet}
                            onRemoveSet={handleRemoveSet}
                            onAppendSet={handleAppendSet}
                        />
                    )}
                </Box>

                {/* Status Field */}
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Status" value={field.value || "draft"}>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    )}
                />
            </Box>

            {/* Dialogs */}
            <AddNewWorkoutDialog
                isOpen={isWorkoutDialogOpen}
                dialogTitle="Add New Allocated Workout"
                onClose={() => setWorkoutDialogOpen(false)}
                onAdd={(newWorkout) => {
                    handleAddWorkout(newWorkout);
                    setWorkoutDialogOpen(false);
                }}
            />

            <AddNewExerciseDialog
                isOpen={isExerciseDialogOpen}
                dialogTitle="Add New Allocated Exercise"
                onClose={() => setExerciseDialogOpen(false)}
                onAdd={(newAllocatedExercise) => {
                    handleAddExercise(newAllocatedExercise);
                    setExerciseDialogOpen(false);
                }}
            />
        </FormWrapper>
    );
};

export default CreateOrEditProgramPage;
