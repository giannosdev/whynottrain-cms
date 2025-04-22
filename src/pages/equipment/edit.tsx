// EquipmentEdit.tsx
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
export interface Equipment {
    id: number;
    name: string;
}

export interface Muscle {
    id: number;
    name: string;
}

export interface EquipmentSet {
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
    equipment: any[]; // not used in this edit screen
}

export interface Equipment {
    id?: string;
    name: string;
    description: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    workouts: Workout[]; // may be unused in this edit screen
    category?: { id: number | null };
    status?: string;
    equipment: Equipment[];
    primaryMuscles: Muscle[];
    secondaryMuscles: Muscle[];
    sets: EquipmentSet[];
}

/* -------------------------
   EquipmentEdit Component
------------------------- */
export const EquipmentEdit: React.FC = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Equipment>({
        defaultValues: {
            name: "",
            description: "",
            videoUrl: "",
            thumbnailUrl: "",
            workouts: [],
            category: { id: null },
            status: "draft",
            equipment: [],
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
                {/* 1. Equipment Name */}
                <TextField
                    {...register("name", { required: "This field is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    label="Name"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* 2. Equipment Description */}
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

export default EquipmentEdit;
