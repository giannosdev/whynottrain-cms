import React, { useEffect, useState, useMemo } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
} from "@mui/material";
import { useDataProvider, useSelect } from "@refinedev/core";
import { useDebounce } from "use-debounce";

// Define the props for the dialog
interface AddNewExerciseDialogProps {
    isOpen: boolean;
    dialogTitle: string;
    onClose: () => void;
    onAdd: (exercise: any) => void;
}

export default function AddNewExerciseDialog({
                                                 isOpen,
                                                 dialogTitle,
                                                 onClose,
                                                 onAdd,
                                             }: AddNewExerciseDialogProps) {
    // Filter state
    const [searchText, setSearchText] = useState("");
    const [selectedPrimaryMuscles, setSelectedPrimaryMuscles] = useState<number[]>([]);
    const [selectedSecondaryMuscles, setSelectedSecondaryMuscles] = useState<number[]>([]);
    const [selectedExerciseType, setSelectedExerciseType] = useState<number | "">("");
    const [selectedEquipment, setSelectedEquipment] = useState<number | "">("");
    const [exercises, setExercises] = useState<any[]>([]);

    // Debounce the search text
    const [debouncedSearchText] = useDebounce(searchText, 300);

    // Use refine's useSelect to load filter options
    const { options: primaryMuscleOptions } = useSelect({
        resource: "muscle-groups",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: [],
    });

    const { options: secondaryMuscleOptions } = useSelect({
        resource: "muscle-groups",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: [],
    });

    const { options: exerciseTypeOptions } = useSelect({
        resource: "exercise-types",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: [],
    });

    const { options: equipmentOptions } = useSelect({
        resource: "equipment",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: [],
    });

    // Get dataProvider and memoize the default instance.
    const dataProvider = useDataProvider();
    const dp = useMemo(() => dataProvider("default"), [dataProvider]);

    useEffect(() => {
        // Build filters based on current state.
        const filters: Record<string, any> = {};
        if (debouncedSearchText) {
            filters.search = debouncedSearchText;
        }
        if (selectedPrimaryMuscles.length) {
            filters.primaryMuscles = selectedPrimaryMuscles;
        }
        if (selectedSecondaryMuscles.length) {
            filters.secondaryMuscles = selectedSecondaryMuscles;
        }
        if (selectedExerciseType) {
            filters.exerciseType = selectedExerciseType;
        }
        if (selectedEquipment) {
            filters.equipment = selectedEquipment;
        }

        // Build an array of filter objects.
        const filterObjects = Object.entries(filters).map(([key, value]) => ({
            field: key,
            operator: Array.isArray(value) ? "in" : "eq",
            value: value,
        }));

        // Fetch exercises using the data provider.
        dp.getList({
            resource: "exercises",
            pagination: { current: 1, pageSize: 20 },
            filters: filterObjects,
        })
            .then((response) => {
                setExercises(response.data);
            })
            .catch((error) => {
                console.error("Error fetching exercises:", error);
            });
    }, [
        debouncedSearchText,
        selectedPrimaryMuscles,
        selectedSecondaryMuscles,
        selectedExerciseType,
        selectedEquipment,
        dp,
    ]);

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    {/* Search Bar */}
                    <TextField
                        label="Search Exercises"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        fullWidth
                    />

                    {/* Filters Row 1: Primary & Secondary Muscles */}
                    <Box display="flex" gap={2}>
                        <FormControl fullWidth>
                            <InputLabel id="primary-muscles-label">Primary Muscles</InputLabel>
                            <Select
                                labelId="primary-muscles-label"
                                multiple
                                value={selectedPrimaryMuscles}
                                label="Primary Muscles"
                                onChange={(e) =>
                                    setSelectedPrimaryMuscles(e.target.value as number[])
                                }
                            >
                                {primaryMuscleOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="secondary-muscles-label">Secondary Muscles</InputLabel>
                            <Select
                                labelId="secondary-muscles-label"
                                multiple
                                value={selectedSecondaryMuscles}
                                label="Secondary Muscles"
                                onChange={(e) =>
                                    setSelectedSecondaryMuscles(e.target.value as number[])
                                }
                            >
                                {secondaryMuscleOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Filters Row 2: Exercise Type & Equipment */}
                    <Box display="flex" gap={2}>
                        <FormControl fullWidth>
                            <InputLabel id="exerciseType-label">Exercise Type</InputLabel>
                            <Select
                                labelId="exerciseType-label"
                                value={selectedExerciseType}
                                label="Exercise Type"
                                onChange={(e) =>
                                    setSelectedExerciseType(e.target.value as number | "")
                                }
                            >
                                <MenuItem value="">All</MenuItem>
                                {exerciseTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="equipment-label">Equipment</InputLabel>
                            <Select
                                labelId="equipment-label"
                                value={selectedEquipment}
                                label="Equipment"
                                onChange={(e) =>
                                    setSelectedEquipment(e.target.value as number | "")
                                }
                            >
                                <MenuItem value="">All</MenuItem>
                                {equipmentOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* List of Filtered Exercises */}
                    <Box>
                        <Typography variant="subtitle1">Results:</Typography>
                        <Box maxHeight={300} overflow="auto" mt={1}>
                            {exercises && exercises.length > 0 ? (
                                exercises.map((exercise) => (
                                    <Box
                                        key={exercise.id}
                                        sx={{
                                            padding: 1,
                                            borderBottom: "1px solid #ccc",
                                            cursor: "pointer",
                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}
                                        onClick={() => {
                                            onAdd(exercise);
                                            onClose();
                                        }}
                                    >
                                        <Typography variant="body1">{exercise.name}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No exercises found.</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
