// MuscleGroupEdit.tsx
import React, { useState } from "react";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
    Box,
    TextField,
} from "@mui/material";

/* -------------------------
   Define Your Interfaces
------------------------- */
export interface MuscleGroup {
    id: number;
    name: string;
}

export interface Muscle {
    id: number;
    name: string;
}

export interface MuscleGroupSet {
    id: string;
    type: "time" | "reps";
    value: number; // seconds for time or reps for reps
}

export interface Workout {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    muscleGroup: any[]; // not used in this edit screen
}

export interface MuscleGroup {
    id?: string;
    name: string;
    description: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    workouts: Workout[]; // may be unused in this edit screen
    category?: { id: number | null };
    status?: string;
    muscleGroup: MuscleGroup[];
    primaryMuscles: Muscle[];
    secondaryMuscles: Muscle[];
    sets: MuscleGroupSet[];
}

/* -------------------------
   MuscleGroupEdit Component
------------------------- */
export const MuscleGroupEdit: React.FC = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MuscleGroup>({
        defaultValues: {
            name: "",
            description: "",
            videoUrl: "",
            thumbnailUrl: "",
            workouts: [],
            category: { id: null },
            status: "draft",
            muscleGroup: [],
            primaryMuscles: [],
            secondaryMuscles: [],
            sets: [],
        },
    });

    console.log("Refine Query Data:", query.data);

    return (
        <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
            >
                {/* 1. MuscleGroup Name */}
                <TextField
                    {...register("name", { required: "This field is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    label="Name"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* 2. MuscleGroup Description */}
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
            </Box>
        </Edit>
    );
};

export default MuscleGroupEdit;
