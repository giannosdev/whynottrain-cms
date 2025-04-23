import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { IClient } from "../../interfaces/client.interface"; 

/**
 * Client creation component with form validation
 */
export const ClientCreate: React.FC<IResourceComponentsProps> = () => {
    const { 
        saveButtonProps,
        refineCore: { formLoading },
        register,
        control, 
        formState: { errors },
        setValue,
    } = useForm<IClient>({ 
        refineCoreProps: {
            resource: "users",
            redirect: "list",
        }
    });

    // Set default role to CLIENT for new users
    React.useEffect(() => {
        setValue("role", "CLIENT");
    }, [setValue]);

    return (
        <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                autoComplete="off"
            >
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
                />
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
                />
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
                />
                
                {/* Password field for new user */}
                <TextField
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        }
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message as string}
                    margin="normal"
                    fullWidth
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                />
                
                <FormControl margin="normal" fullWidth error={!!errors.role}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        label="Role"
                        {...register("role", {
                            required: "Role is required"
                        })}
                        defaultValue="CLIENT"
                    >
                        <MenuItem value="CLIENT">Client</MenuItem>
                        <MenuItem value="COACH">Coach</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role.message as string}</FormHelperText>}
                </FormControl>
            </Box>
        </Create>
    );
};
