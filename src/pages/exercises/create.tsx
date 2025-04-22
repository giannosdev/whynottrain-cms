// ExercisesCreate.tsx
import React, { useEffect, useState } from "react";
import { Edit, Create } from "@refinedev/mui"; // <-- Added Create import
import { useForm } from "@refinedev/react-hook-form";
import { Controller, useFieldArray } from "react-hook-form";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Autocomplete,
    Typography,
    Paper,
    Button,
    FormControl,
    FormLabel,
    Grid2,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelect } from "@refinedev/core";
import CreateOrEditPage from "./components/CreateOrEditExercisePage/CreateOrEditPage";
import CreateOrEditExercisePage from "./components/CreateOrEditExercisePage/CreateOrEditExercisePage";

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

export interface ExerciseSet {
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
    exercises: any[]; // not used in this edit screen
}

export interface Exercise {
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
    sets: ExerciseSet[];
    totalSetsDuration: number;  // <-- new field
}

/* -------------------------
   Sample Options
------------------------- */
// const categoryOptions = [
//     { id: 1, name: "Category 1" },
//     { id: 2, name: "Category 2" },
// ];

const muscleOptions = [
    { id: 1, name: "Chest" },
    { id: 2, name: "Back" },
    { id: 3, name: "Legs" },
    { id: 4, name: "Shoulders" },
    { id: 5, name: "Arms" },
];

/* -------------------------
   Helper: Convert YouTube URL to embed URL
------------------------- */
const getYoutubeEmbedUrl = (url: string): string => {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

/* -------------------------
   ExercisesCreate Component
------------------------- */
export const ExercisesCreate: React.FC = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Exercise>({
        defaultValues: {
            name: "",
            description: "",
            videoUrl: "",
            thumbnailUrl: "",
            workouts: [],
            // category: { id: null },
            status: "draft",
            equipment: [],
            primaryMuscles: [],
            secondaryMuscles: [],
            sets: [],
            totalSetsDuration: 0, // <-- initialize here
        },
    });

    console.log("Refine Query Data:", query.data);

    // Local state for thumbnail preview
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

    // UseFieldArray for managing sets
    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "sets",
    });

    // --- Handler to update an existing set ---
    const handleUpdateSet = (
        index: number,
        field: "type" | "value" | "breakTime",
        value: any
    ) => {
        const updatedSet = { ...fields[index], setNumber: index, [field]: value };
        update(index, updatedSet);
    };

    const sets = watch("sets") || [];

    useEffect(() => {
        // For each set, add the set value plus breakTime (defaulting breakTime to 0 if undefined)
        const total = sets.reduce(
            (acc: number, set: ExerciseSet) => acc + (set.value * 2 + (set.breakTime || 0)),
            0
        );
        setValue("totalSetsDuration", total);
    }, [sets, setValue]);

    // --- Handler to remove a set ---
    const handleRemoveSet = (index: number) => {
        remove(index);
    };

    // Handler for thumbnail file input
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
            // For simplicity, we just store the file name; in a real app you’d upload the file and store the URL.
            setValue("thumbnailUrl", file.name);
        }
    };

    const { query: equipmentQuery } = useSelect<Equipment>({
        resource: "equipment",
    });

    const { query: muscleGroupsQuery } = useSelect<Equipment>({
        resource: "muscle-groups",
    });

    // Determine whether we're editing or creating:
    const isEditMode = Boolean(query.data);
    const PageWrapper = isEditMode ? Edit : Create; // Use Create for new exercise

    return (
        <CreateOrEditExercisePage />
    );
};

export default ExercisesCreate;
