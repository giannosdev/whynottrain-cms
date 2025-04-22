import React from "react";
import { Paper, Typography } from "@mui/material";
import { AllocatedExercise } from "../../pages/programs/CreateOrEditProgramPage/CreateOrEditProgramPage";
import ExerciseSets from "../ExerciseSets/ExerciseSets";

interface AllocatedExerciseEditorProps {
    exercise: AllocatedExercise;
    onUpdateSet: (setIndex: number, field: "type" | "value" | "breakTime", value: any) => void;
    onRemoveSet: (setIndex: number) => void;
    onAppendSet: () => void;
}

const AllocatedExerciseEditor: React.FC<AllocatedExerciseEditorProps> = ({
                                                                             exercise,
                                                                             onUpdateSet,
                                                                             onRemoveSet,
                                                                             onAppendSet,
                                                                         }) => {
    return (
        <Paper elevation={3} sx={{ width: "100%", padding: 2 }}>
            <Typography variant="h6" gutterBottom>
                Sets
            </Typography>
            {/* We pass exercise.sets plus the callbacks */}
            <ExerciseSets
                sets={exercise.sets ?? []}
                onUpdateSet={onUpdateSet}
                onRemoveSet={onRemoveSet}
                onAppendSet={onAppendSet}
            />
        </Paper>
    );
};

export default AllocatedExerciseEditor;
