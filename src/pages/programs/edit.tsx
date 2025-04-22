import React from "react";
import {CreateOrEditProgramPage} from "./components/CreateOrEditProgramPage";

/* -------------------------
   Define Your Interfaces
------------------------- */
export interface Exercise {
    id: string;
    name: string;
    description?: string;
    primaryMuscleId?: string;
    videoUrl?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Workout {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    exercises: Exercise[];
}

export interface Program {
    name: string;
    description: string;
    workouts: Workout[];
    category?: { id: number | null };
    status?: string;
}

/* ----------------------------------
   The ProgramsEdit Page
---------------------------------- */
export const ProgramsEdit = () => {

    return (
        <CreateOrEditProgramPage />

    );
};
