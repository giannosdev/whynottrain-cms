import React, { useState } from "react";
import { IResourceComponentsProps, useOne, useResourceParams, useUpdate } from "@refinedev/core";
import { Edit, SaveButton } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";

import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Button,
    Grid,
    Typography,
    Divider
} from "@mui/material";
import { IClient } from "../../interfaces/client.interface";
import ProgramAssignmentModal from "./components/ProgramAssignment/ProgramAssignmentModal";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

/**
 * Client edit component for updating user details.
 * Uses the 'users' API resource while maintaining 'clients' naming in the UI.
 */
export const ClientEdit: React.FC<IResourceComponentsProps> = () => {
    // Get the ID from the URL
    const { id } = useResourceParams();

    // State for program assignment modal
    const [programModalOpen, setProgramModalOpen] = useState(false);

    // Fetch the user data directly with useOne
    const { data, isLoading } = useOne<IClient>({
        resource: "users",
        id: id,
    });

    const userData = data?.data;

    // Setup the update mutation
    const { mutate: updateUser } = useUpdate();

    const {
        saveButtonProps,
        refineCore: { formLoading, onFinish },
        register,
        formState: { errors },
        setValue,
        reset,
        control,
        handleSubmit,
    } = useForm<IClient>({
        refineCoreProps: {
            resource: "users",
            id: id,
            action: "edit",
            onMutationSuccess: (data) => {
                // Handle success if needed
            },
        },
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            role: "CLIENT",
        }
    });

    // Reset form with user data when it's loaded
    React.useEffect(() => {
        if (userData) {
            reset(userData);
        }
    }, [userData, reset]);

    // Custom submit handler to use PUT instead of PATCH
    const handleFormSubmit = async (data: IClient) => {
        updateUser({
            resource: "users",
            id: id,
            values: data,
            // Use PUT instead of PATCH
            method: "put",
        });
    };

    return (
        <Edit
            isLoading={formLoading || isLoading}
            saveButtonProps={{
                ...saveButtonProps,
                onClick: handleSubmit(handleFormSubmit)
            }}
            headerButtons={[
                <Button
                    key="assign-program"
                    startIcon={<FitnessCenterIcon />}
                    onClick={() => setProgramModalOpen(true)}
                    color="primary"
                    variant="outlined"
                    sx={{ marginRight: 1 }}
                >
                    Assign Program
                </Button>
            ]}
        >
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Client Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            {...register("firstName", {
                                required: "First name is required",
                            })}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message as string}
                            margin="normal"
                            fullWidth
                            id="firstName"
                            label="First Name"
                            name="firstName"
                            autoFocus
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            {...register("lastName", {
                                required: "Last name is required",
                            })}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message as string}
                            margin="normal"
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message as string}
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            type="email"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl margin="normal" fullWidth error={!!errors.role}>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Controller
                                control={control}
                                name="role"
                                rules={{ required: "Role is required" }}
                                render={({ field }) => (
                                    <Select
                                        labelId="role-label"
                                        label="Role"
                                        {...field}
                                        defaultValue={userData?.role || "CLIENT"}
                                    >
                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                        <MenuItem value="COACH">Coach</MenuItem>
                                        <MenuItem value="CLIENT">Client</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.role && (
                                <FormHelperText>{errors.role.message as string}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Program Assignment Modal */}
            <ProgramAssignmentModal
                open={programModalOpen}
                onClose={() => setProgramModalOpen(false)}
                clientId={id}
                clientName={`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Client'}
            />
        </Edit>
    );
};
