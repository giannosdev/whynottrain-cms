import React from "react";
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";

export interface ExerciseSet {
    id: string;
    type: "DURATION" | "REPS";
    value: number; // seconds for time or reps for reps
    breakTime?: number;
}

interface ExerciseSetsProps {
    /** The array of sets from the parent. */
    sets: ExerciseSet[];

    /** Callback to update a single field in a set. */
    onUpdateSet: (setIndex: number, field: "type" | "value" | "breakTime", value: any) => void;

    /** Callback to remove a set at index. */
    onRemoveSet: (setIndex: number) => void;

    /** Callback to add/append a new set. */
    onAppendSet: () => void;
}

const ExerciseSets: React.FC<ExerciseSetsProps> = ({
                                                       sets,
                                                       onUpdateSet,
                                                       onRemoveSet,
                                                       onAppendSet,
                                                   }) => {
    // Calculate total duration based on the sets array.
    const totalDuration = sets.reduce(
        (acc, set) => acc + (set.value * 2 + (set.breakTime || 0)),
        0
    );

    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 1,
                gap: 2,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="subtitle1" gutterBottom>
                Total Duration:{" "}
                {totalDuration < 60
                    ? `${totalDuration} seconds`
                    : `${Math.floor(totalDuration / 60)} min ${totalDuration % 60} sec`}
            </Typography>

            {sets.length > 0 ? (
                sets.map((set, index) => (
                    <Box
                        key={set.id}
                        sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}
                    >
                        <TextField
                            select
                            label="Type"
                            value={set.type}
                            onChange={(e) => onUpdateSet(index, "type", e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="DURATION">Time</MenuItem>
                            <MenuItem value="REPS">Reps</MenuItem>
                        </TextField>
                        <TextField
                            label={set.type === "DURATION" ? "Duration (sec)" : "Reps"}
                            value={set.value}
                            onChange={(e) => onUpdateSet(index, "value", Number(e.target.value))}
                        />
                        <TextField
                            label="Break Time (sec)"
                            value={set.breakTime || 0}
                            onChange={(e) => onUpdateSet(index, "breakTime", Number(e.target.value))}
                        />
                        <IconButton
                            aria-label="delete"
                            size="medium"
                            onClick={() => onRemoveSet(index)}
                            color="error"
                        >
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                ))
            ) : (
                <Typography>No sets added.</Typography>
            )}

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                <Button variant="contained" onClick={onAppendSet}>
                    Add Set
                </Button>
            </Box>
        </Paper>
    );
};

export default ExerciseSets;
