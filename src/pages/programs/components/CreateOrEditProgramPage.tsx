import React, { useEffect, useState } from "react";
import { Create, Edit } from "@refinedev/mui";
import { Controller, useFieldArray } from "react-hook-form";
import { useForm } from "@refinedev/react-hook-form";
import { useNotification } from "@refinedev/core";
import {
    Box,
    TextField,
    Grid,
    Paper,
    Typography,
    Divider,
    Card,
    CardContent,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { ProgramBuilder } from "./ProgramBuilder";
import { Workout } from "../../workouts/components/CreateOrEditWorkoutPage/CreateOrEditWorkoutPage";

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
    sets: any[]; // e.g. array of set details
    order: number; // Must be an integer
    exerciseId: string; // This scalar is used for nested writes
    notes?: string;
}

// Represents an allocated workout attached to a program.
export interface AllocatedWorkout {
    id: string;
    workout: Workout;
    workoutId?: string;
    order?: number;
    name?: string; 
    note?: string;
    allocatedExercises: AllocatedExercise[];
}

// Represents the Program itself.
export interface Program {
    name: string;
    description: string;
    durationDays?: number;
    rotationDays?: number;
    allocatedWorkouts: AllocatedWorkout[];
    status?: string;
}

/**
 * Component for creating or editing a fitness program
 * Includes program details and a drag-and-drop builder for workouts and exercises
 */
export const CreateOrEditProgramPage: React.FC = () => {
    // Setup form with react-hook-form via refine
    const {
        saveButtonProps,
        refineCore: { queryResult, formLoading, onFinish },
        register,
        control,
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<Program>({
        refineCoreProps: {
            redirect: false,
        },
        defaultValues: {
            name: "",
            description: "",
            durationDays: 28,
            rotationDays: 7,
            allocatedWorkouts: [],
            status: "draft",
        },
    });

    const { open } = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    
    // Determine if we're in edit mode based on query data
    const isEdit = Boolean(queryResult?.data);
    const FormWrapper = isEdit ? Edit : Create;

    // Handle form data initialization when editing
    useEffect(() => {
        if (queryResult?.data?.data) {
            const programData = queryResult.data.data;
            
            // Format the data to match our interface
            const formattedData = {
                ...programData,
                allocatedWorkouts: programData.allocatedWorkouts?.map((aw: any) => ({
                    ...aw,
                    id: aw.id || `new-${uuidv4()}`,
                    allocatedExercises: aw.allocatedExercises?.map((ae: any) => ({
                        ...ae,
                        id: ae.id || uuidv4(),
                    })) || [],
                })) || [],
            };
            
            reset(formattedData);
        }
    }, [queryResult?.data?.data, reset]);

    // Program data from the form
    const formData = watch();

    /**
     * Handle program data updates from the builder
     */
    const handleProgramUpdate = (updatedProgram: Program) => {
        // Update the form values with the new program data
        reset(updatedProgram);
    };

    /**
     * Handle form submission
     */
    const handleSaveProgram = async () => {
        setIsSaving(true);
        try {
            // Format the data for API submission
            const formData = watch();
            
            // Prepare data for submission to the API
            const dataToSubmit = {
                name: formData.name,
                description: formData.description,
                durationDays: formData.durationDays,
                rotationDays: formData.rotationDays,
                allocatedWorkouts: formData.allocatedWorkouts?.map((aw: any) => ({
                    workoutId: aw.workoutId || aw.workout?.id || null,
                    name: aw.name || aw.workout?.name || "Untitled Workout",
                    note: aw.note || "",
                    order: aw.order || 1,
                    allocatedExercises: aw.allocatedExercises?.map((ae: any) => ({
                        exerciseId: ae.exerciseId || ae.exercise?.id || null,
                        sets: ae.sets || [],
                        order: ae.order || 1,
                        notes: ae.notes || "",
                    })) || [],
                })) || [],
            };
            
            // Submit data using refine's onFinish
            await onFinish(dataToSubmit);
            
            if (open) {
                open({
                    type: "success",
                    message: isEdit ? "Program updated successfully" : "Program created successfully",
                    description: "The program has been saved to the database",
                });
            }
        } catch (error) {
            console.error("Error saving program:", error);
            if (open) {
                open({
                    type: "error",
                    message: "Error saving program",
                    description: "An error occurred while saving the program",
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormWrapper
            saveButtonProps={{
                ...saveButtonProps,
                onClick: handleSubmit(handleSaveProgram),
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Program Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    {...register("name", { required: "Program name is required" })}
                                    label="Program Name"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message as string}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    {...register("description")}
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    {...register("durationDays", { 
                                        valueAsNumber: true,
                                        validate: (value) => 
                                            (value === undefined || value > 0) || 
                                            "Duration must be a positive number" 
                                    })}
                                    label="Program Duration (days)"
                                    type="number"
                                    fullWidth
                                    error={!!errors.durationDays}
                                    helperText={errors.durationDays?.message as string}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    {...register("rotationDays", { 
                                        valueAsNumber: true,
                                        validate: (value) => 
                                            (value === undefined || value > 0) || 
                                            "Rotation days must be a positive number" 
                                    })}
                                    label="Rotation Days"
                                    type="number"
                                    fullWidth
                                    error={!!errors.rotationDays}
                                    helperText={errors.rotationDays?.message as string}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                
                <Divider />
                
                {/* Program Builder Component */}
                <Box>
                    <ProgramBuilder 
                        program={formData as Program}
                        onProgramUpdate={handleProgramUpdate}
                        onSave={handleSubmit(handleSaveProgram)}
                        isSaving={isSaving}
                    />
                </Box>
            </Box>
        </FormWrapper>
    );
};

export default CreateOrEditProgramPage;
