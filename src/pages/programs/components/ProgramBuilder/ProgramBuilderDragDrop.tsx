// ProgramBuilderDragDrop.tsx – migrated to dnd-kit
import React, { useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AllocatedWorkout, AllocatedExercise } from "../CreateOrEditProgramPage";

/* -------------------------------------------------------------------------- */
// Component Props
/* -------------------------------------------------------------------------- */
interface ProgramBuilderDragDropProps {
  workouts: AllocatedWorkout[];
  onWorkoutsReorder: (workouts: AllocatedWorkout[]) => void;
  onAddWorkout: () => void;
  onEditWorkout: (workoutId: string) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onAddExercise: (workoutId: string) => void;
  onEditExercise: (workoutId: string, exerciseId: string) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
  selectedWorkoutId: string | null;
  onSelectWorkout: (workoutId: string) => void;
  selectedExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
}

/* -------------------------------------------------------------------------- */
// Sortable Workout Item
/* -------------------------------------------------------------------------- */
interface SortableWorkoutItemProps {
  workout: AllocatedWorkout;
  selectedWorkoutId: string | null;
  onSelectWorkout: (id: string) => void;
  onAddExercise: (id: string) => void;
  onEditWorkout: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  selectedExerciseId: string | null;
  onSelectExercise: (id: string) => void;
  onEditExercise: (wid: string, eid: string) => void;
  onDeleteExercise: (wid: string, eid: string) => void;
}

const SortableWorkoutItem: React.FC<SortableWorkoutItemProps> = ({
  workout,
  selectedWorkoutId,
  onSelectWorkout,
  onAddExercise,
  onEditWorkout,
  onDeleteWorkout,
  selectedExerciseId,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.id, data: { type: "workout" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    marginBottom: 16,
  } as React.CSSProperties;

  // Collect exercise IDs for SortableContext
  const exerciseIds = workout.allocatedExercises.map((ex) => `${workout.id}-${ex.id}`);

  return (
    <Paper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Box
        onClick={() => onSelectWorkout(workout.id)}
        sx={{
          borderLeft:
            selectedWorkoutId === workout.id ? "4px solid #1976d2" : "4px solid transparent",
          cursor: "pointer",
        }}
      >
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">
                  {workout.order}. {workout.workout?.name || workout.name || "Untitled Workout"}
                </Typography>
                <Badge
                  badgeContent={workout.allocatedExercises.length}
                  color="primary"
                  sx={{ ml: 2 }}
                >
                  <FitnessCenterIcon />
                </Badge>
              </Box>
            }
            action={
              <Box>
                <Tooltip title="Add Exercise">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddExercise(workout.id);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Workout">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWorkout(workout.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Workout">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWorkout(workout.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          {workout.note && (
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {workout.note}
              </Typography>
            </CardContent>
          )}
          <Divider />
          <CardContent>
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              {workout.allocatedExercises.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", p: 2 }}>
                  No exercises added yet. Click "+" to add exercises.
                </Typography>
              ) : (
                workout.allocatedExercises.map((exercise, exIdx) => (
                  <SortableExerciseItem
                    key={`${workout.id}-${exercise.id}`}
                    exercise={exercise}
                    workoutId={workout.id}
                    index={exIdx}
                    selectedExerciseId={selectedExerciseId}
                    onSelectExercise={onSelectExercise}
                    onEditExercise={onEditExercise}
                    onDeleteExercise={onDeleteExercise}
                  />
                ))
              )}
            </SortableContext>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

/* -------------------------------------------------------------------------- */
// Sortable Exercise Item
/* -------------------------------------------------------------------------- */
interface SortableExerciseItemProps {
  exercise: AllocatedExercise;
  workoutId: string;
  index: number;
  selectedExerciseId: string | null;
  onSelectExercise: (id: string) => void;
  onEditExercise: (wid: string, eid: string) => void;
  onDeleteExercise: (wid: string, eid: string) => void;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
  exercise,
  workoutId,
  index,
  selectedExerciseId,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${workoutId}-${exercise.id}`, data: { type: "exercise", workoutId, exerciseId: exercise.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    marginBottom: 8,
  } as React.CSSProperties;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor:
          selectedExerciseId === exercise.id ? "rgba(25,118,210,0.08)" : "rgba(0,0,0,0.02)",
        border:
          selectedExerciseId === exercise.id
            ? "1px solid rgba(25,118,210,0.5)"
            : "1px solid rgba(0,0,0,0.08)",
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectExercise(exercise.id);
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
          {index + 1}.
        </Typography>
        <Typography variant="body2">
          {exercise.exercise?.name || "Unknown Exercise"}
        </Typography>
        {exercise.sets && Array.isArray(exercise.sets) && (
          <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
            ({exercise.sets.length} sets)
          </Typography>
        )}
      </Box>
      <Box>
        <Tooltip title="Edit Exercise">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEditExercise(workoutId, exercise.id);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove Exercise">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteExercise(workoutId, exercise.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

/* -------------------------------------------------------------------------- */
// Main Component
/* -------------------------------------------------------------------------- */
const ProgramBuilderDragDrop: React.FC<ProgramBuilderDragDropProps> = ({
  workouts,
  onWorkoutsReorder,
  onAddWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  selectedWorkoutId,
  onSelectWorkout,
  selectedExerciseId,
  onSelectExercise,
}) => {
  /* ------------------------------ Sensors ------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* --------------------------- Drag End Logic -------------------------- */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeType = active.data.current?.type as string;
      const overType = over.data.current?.type as string;

      // Reorder workouts
      if (activeType === "workout" && overType === "workout") {
        const oldIndex = workouts.findIndex((w) => w.id === active.id);
        const newIndex = workouts.findIndex((w) => w.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove([...workouts], oldIndex, newIndex).map((w, idx) => ({
          ...w,
          order: idx + 1,
        }));
        onWorkoutsReorder(reordered);
        return;
      }

      // Reorder / move exercises
      if (activeType === "exercise") {
        const sourceWorkoutId = active.data.current?.workoutId as string;
        const exerciseId = active.data.current?.exerciseId as string;
        const destWorkoutId = overType === "exercise" ? (over.data.current?.workoutId as string) : (over.id as string);

        const newWorkouts = [...workouts];
        const sourceWorkoutIndex = newWorkouts.findIndex((w) => w.id === sourceWorkoutId);
        const destWorkoutIndex = newWorkouts.findIndex((w) => w.id === destWorkoutId);
        if (sourceWorkoutIndex === -1 || destWorkoutIndex === -1) return;

        // Remove from source
        const sourceExercises = [...newWorkouts[sourceWorkoutIndex].allocatedExercises];
        const exIndex = sourceExercises.findIndex((ex) => ex.id === exerciseId);
        if (exIndex === -1) return;
        const [moved] = sourceExercises.splice(exIndex, 1);

        // Insert into destination at correct position
        const destExercises = [...newWorkouts[destWorkoutIndex].allocatedExercises];
        const destIndex = overType === "exercise" ? destExercises.findIndex((ex) => ex.id === (over.data.current?.exerciseId as string)) : destExercises.length;
        destExercises.splice(destIndex, 0, sourceWorkoutId === destWorkoutId ? moved : { ...moved, id: `moved-${moved.id}` });

        // Update orders
        const updateOrder = (exArr: AllocatedExercise[]) =>
          exArr.map((ex, idx) => ({ ...ex, order: idx + 1 }));

        newWorkouts[sourceWorkoutIndex] = {
          ...newWorkouts[sourceWorkoutIndex],
          allocatedExercises: updateOrder(sourceExercises),
        };
        newWorkouts[destWorkoutIndex] = {
          ...newWorkouts[destWorkoutIndex],
          allocatedExercises: updateOrder(destExercises),
        };

        onWorkoutsReorder(newWorkouts);
      }
    },
    [workouts, onWorkoutsReorder]
  );

  /* ------------------------------ Render ------------------------------ */
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Program Builder</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddWorkout}>
            Add Workout
          </Button>
        </Box>

        <SortableContext items={workouts.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          {workouts.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "rgba(0,0,0,0.02)" }}>
              <Typography color="text.secondary">
                No workouts added yet. Click "Add Workout" to start building your program.
              </Typography>
            </Paper>
          ) : (
            workouts.map((workout) => (
              <SortableWorkoutItem
                key={workout.id}
                workout={workout}
                selectedWorkoutId={selectedWorkoutId}
                onSelectWorkout={onSelectWorkout}
                onAddExercise={onAddExercise}
                onEditWorkout={onEditWorkout}
                onDeleteWorkout={onDeleteWorkout}
                selectedExerciseId={selectedExerciseId}
                onSelectExercise={onSelectExercise}
                onEditExercise={onEditExercise}
                onDeleteExercise={onDeleteExercise}
              />
            ))
          )}
        </SortableContext>
      </Box>
    </DndContext>
  );
};

export default ProgramBuilderDragDrop;
