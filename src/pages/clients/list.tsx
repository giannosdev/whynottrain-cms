import React, { ReactNode } from "react";
import {
    IResourceComponentsProps,
    BaseRecord,
    useNavigation,
    useDelete,
    useTranslate,
    CrudFilters,
    getDefaultFilter,
    HttpError,
    CrudSorting,
} from "@refinedev/core";
import {
    List,
    useDataGrid,
    DateField,
    EditButton,
    DeleteButton,
    ShowButton,
    FilterButton,
    CreateButton,
    useAutocomplete,
} from "@refinedev/mui";
import {
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridToolbar,
    GridFilterModel,
} from "@mui/x-data-grid";
import {
    Box,
    Stack,
    Typography,
    Card,
    CardContent,
    TextField,
    Autocomplete,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { IClient } from "../../interfaces/client.interface";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import { format } from "date-fns";

/**
 * ClientList component that displays a list of clients (users with CLIENT role)
 * from the API with filtering, pagination and other data grid features.
 */
export const ClientList: React.FC<IResourceComponentsProps> = () => {
    const { edit, show, create } = useNavigation();
    const { mutate: deleteClient } = useDelete();
    const t = useTranslate();

    // Define filters to only show users with CLIENT role
    const initialFilters: CrudFilters = [
        {
            field: "role",
            operator: "eq",
            value: "CLIENT",
        },
    ];

    // Setup DataGrid with proper resource and filters
    const { dataGridProps } = useDataGrid<IClient>({
        syncWithLocation: true,
        resource: "users",
        onSearch: (params: { q?: string; filters?: CrudFilters; sorters?: CrudSorting }) => {
            const filters: CrudFilters = [];

            // Add role filter to ensure we only get clients
            filters.push({
                field: "role",
                operator: "eq",
                value: "CLIENT",
            });

            // Add search filter if provided
            const { q } = params;
            if (q) {
                filters.push({
                    field: "search",
                    operator: "eq",
                    value: q,
                });
            }

            return filters;
        },
        initialFilter: initialFilters,
        metaData: {
            fields: ["id", "firstName", "lastName", "email", "role", "createdAt", "updatedAt"],
        },
    });

    // Define the columns for the DataGrid
    const columns = React.useMemo<GridColDef<IClient>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            width: 90,
            renderCell: function render({ row }: { row: IClient }): ReactNode {
                return <Typography variant="body2">{row.id.substring(0, 8)}...</Typography>;
            },
        },
        {
            field: "name", // Combined field for display purposes
            headerName: "Client Name",
            flex: 1,
            minWidth: 200,
            sortable: false,
            renderCell: function render({ row }: { row: IClient }): ReactNode {
                const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unnamed';
                return (
                    <Typography variant="body1">{fullName}</Typography>
                );
            },
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "createdAt",
            headerName: "Created At",
            minWidth: 180,
            renderCell: function render({ row }: { row: IClient }): ReactNode {
                return row.createdAt ? (
                    <DateField value={row.createdAt} format="PPP" />
                ) : (
                    <Typography variant="body2">-</Typography>
                );
            },
        },
        {
                field: "actions",
                headerName: "Actions",
                align: "right",
                headerAlign: "right",
                minWidth: 120,
                sortable: false,
                display: "flex",
                renderCell: function render({ row }) {
                  return (
                    <>
                      <EditButton hideText recordItemId={row.id} />
                      <ShowButton hideText recordItemId={row.id} />
                      <DeleteButton hideText recordItemId={row.id} />
                    </>
                  );
                },
              },
    ], [edit, show, deleteClient]);

    return (
        <List
            headerButtons={({ defaultButtons }) => (
                <>
                    <CreateButton
                        resource="clients"
                        startIcon={<PersonAddIcon />}
                    />
                </>
            )}
        >
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={dataGridProps.rows?.data ?? []}
                rowCount={dataGridProps.rows?.total ?? 0}
                autoHeight
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    ...dataGridProps.initialState,
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                    },
                }}
                disableRowSelectionOnClick
            />
        </List>
    );
};
