// ExercisesEdit.tsx
import React, {useEffect, useState} from "react";
import { Edit } from "@refinedev/mui";
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
    FormLabel, Grid2,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import {useSelect} from "@refinedev/core";
import ExerciseSets from "../../../components/ExerciseSets/ExerciseSets";


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
   ExercisesEdit Component
------------------------- */
export const ExercisesEdit: React.FC = () => {
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


    return (
        <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
            >
                {/* 1. Exercise Name */}
                <TextField
                    {...register("name", { required: "This field is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    label="Name"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* 2. Exercise Description */}
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

                {/* 3. Classification Section */}

                <Paper sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Classification
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {/* Category Field */}
                        {/*<Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 calc(50% - 8px)" } }}>*/}
                        {/*    <Controller*/}
                        {/*        control={control}*/}
                        {/*        name="category.id"*/}
                        {/*        rules={{ required: "Category is required" }}*/}
                        {/*        render={({ field }) => (*/}
                        {/*            <Autocomplete*/}
                        {/*                {...field}*/}
                        {/*                options={categoryOptions}*/}
                        {/*                getOptionLabel={(option) => option.name || ""}*/}
                        {/*                onChange={(_, value) => field.onChange(value ? value.id : null)}*/}
                        {/*                renderInput={(params) => (*/}
                        {/*                    <TextField*/}
                        {/*                        {...params}*/}
                        {/*                        label="Category"*/}
                        {/*                        error={!!errors.category?.id}*/}
                        {/*                        helperText={errors.category?.id?.message}*/}
                        {/*                    />*/}
                        {/*                )}*/}
                        {/*            />*/}
                        {/*        )}*/}
                        {/*    />*/}
                        {/*</Box>*/}
                        {/* Equipment Field */}
                        <Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 calc(50% - 8px)" } }}>
                            <Controller
                                control={control}
                                name="equipment"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        multiple
                                        options={equipmentQuery?.data?.data || []}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(_, value) => field.onChange(value)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Equipment" />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                        {/* Primary Muscle Groups Field */}
                        <Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 calc(50% - 8px)" } }}>
                            <Controller
                                control={control}
                                name="primaryMuscles"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        multiple
                                        options={muscleGroupsQuery?.data?.data || []}
                                        getOptionLabel={(option) => option.name || ""}
                                        onChange={(_, value) => field.onChange(value)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Primary Muscle Group(s)" />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                        {/* Secondary Muscle Groups Field */}
                        <Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 calc(50% - 8px)" } }}>
                            <Controller
                                control={control}
                                name="secondaryMuscles"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        multiple
                                        options={muscleGroupsQuery?.data?.data || []}
                                        getOptionLabel={(option) => option.name || ""}
                                        onChange={(_, value) => field.onChange(value)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Secondary Muscle Group(s)" />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                    </Box>
                </Paper>




                {/* 4. Sets Section (Extracted Component) */}
                <ExerciseSets
                    sets={sets}
                    fields={fields}
                    handleUpdateSet={handleUpdateSet}
                    remove={remove}
                    append={append}
                />

                {/* 4. Media Section */}
                <Paper sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1, display: "flex", flexDirection: "column", gap:2 }}>
                    <Typography variant="h6" gutterBottom>
                        Media
                    </Typography>
                    {/* Video URL Field */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "row", gap: 2 }}>
                        {/* Thumbnail Field */}
                        <Box sx={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="thumbnailUrl"
                                render={({ field }) => (
                                    <TextField
                                        type="file"
                                        label="Thumbnail Image"
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setThumbnailPreview(URL.createObjectURL(file));
                                                field.onChange(file.name);
                                            }
                                        }}
                                    />
                                )}
                            />
                            {/* Thumbnail Preview */}
                            {thumbnailPreview && (
                                <Box sx={{ mt: 1 }}>
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail Preview"
                                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                                    />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                {...register("videoUrl")}
                                label="Video URL"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            {/* Video Preview */}
                            {watch("videoUrl") && watch("videoUrl").includes("youtu") && (
                                <Box sx={{ mt: 1 }}>
                                    <iframe
                                        width="50%"
                                        height="315"
                                        src={getYoutubeEmbedUrl(watch("videoUrl"))}
                                        title="YouTube video preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </Box>
                            )}
                        </Box>

                    </Box>
                </Paper>


                {/* 6. Status Field */}
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
        </Edit>
    );
};

export default ExercisesEdit;
