import { Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMany } from "@refinedev/core";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";

export const ProgramsList = () => {
  const { dataGridProps } = useDataGrid({});

  // const { data: categoryData, isLoading: categoryIsLoading } = useMany({
  //   resource: "categories",
  //   ids:
  //     dataGridProps?.rows
  //       ?.map((item: any) => item?.category?.id)
  //       .filter(Boolean) ?? [],
  //   queryOptions: {
  //     enabled: !!dataGridProps?.rows,
  //   },
  // });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      // {
      //   field: "id",
      //   headerName: "ID",
      //   type: "number",
      //   minWidth: 50,
      //   display: "flex",
      //   align: "left",
      //   headerAlign: "left",
      // },
      {
        field: "name",
        headerName: "Name",
        minWidth: 300,
        display: "flex",
      },
      {
        field: "description",
        flex: 1,
        headerName: "Description",
        minWidth: 150,
        display: "flex",
        renderCell: function render({ value }) {
          if (!value) return "-";
          return (
            <Typography
              component="p"
              whiteSpace="pre"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {value}
            </Typography>
          );
        },
      },
      {
        field: "allocatedWorkouts",
        headerName: "Workouts",
        minWidth: 400,
        display: "flex",
        renderCell: function render({value}) {
          // value is an array of 'workouts'
          return (
            <Typography component="p">
              {value.map((workout: any) => workout.name).join(", ")}
            </Typography>
          );

        },
      },
      {
        field: "rotationDays",
        headerName: "Rotation Days",
        minWidth: 130,
        display: "flex",
      },
      {
        field: "durationDays",
        headerName: "Duration Days",
        minWidth: 130,
        display: "flex",
      },
      {
        field: "updatedAt",
        headerName: "Updated at",
        minWidth: 120,
        display: "flex",
        renderCell: function render({ value }) {
          return <DateField value={value} />;
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
    ],
    []
  );

  console.log('dataGridProps', dataGridProps)

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} />
    </List>
  );
};
