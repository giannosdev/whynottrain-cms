import React, { useEffect, useState, useMemo } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Box,
} from "@mui/material";
import { useDataProvider } from "@refinedev/core";
import { useDebounce } from "use-debounce";

interface AddNewWorkoutDialogProps {
    isOpen: boolean;
    dialogTitle: string;
    onClose: () => void;
    onAdd: (workout: any) => void;
}

export default function AddNewWorkoutDialog({
                                                isOpen,
                                                dialogTitle,
                                                onClose,
                                                onAdd,
                                            }: AddNewWorkoutDialogProps) {
    const [searchText, setSearchText] = useState("");
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [debouncedSearchText] = useDebounce(searchText, 300);

    const dataProvider = useDataProvider();
    const dp = useMemo(() => dataProvider("default"), [dataProvider]);

    useEffect(() => {
        const filters = debouncedSearchText
            ? [{ field: "search", operator: "contains", value: debouncedSearchText }]
            : [];

        dp.getList({
            resource: "workouts",
            pagination: { current: 1, pageSize: 20 },
            filters,
        })
            .then((response) => {
                console.log('response', response.data);
                setWorkouts(response.data);
            })
            .catch((error) => {
                console.error("Error fetching workouts:", error);
            });
    }, [debouncedSearchText, dp]);

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    {/* Search Bar */}
                    <TextField
                        label="Search Workouts"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        fullWidth
                    />

                    {/* List of Filtered Workouts */}
                    <Box>
                        <Typography variant="subtitle1">Results:</Typography>
                        <Box maxHeight={300} overflow="auto" mt={1}>
                            {workouts && workouts.length > 0 ? (
                                workouts.map((workout) => (
                                    <Box
                                        key={workout.id}
                                        sx={{
                                            padding: 1,
                                            borderBottom: "1px solid #ccc",
                                            cursor: "pointer",
                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}
                                        onClick={() => {
                                            console.log('dialog workout', workout);
                                            onAdd(workout);
                                            onClose();

                                        }}
                                    >
                                        <Typography variant="body1">{workout.name}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No workouts found.</Typography>
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
