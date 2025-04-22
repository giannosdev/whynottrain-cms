import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import {
  ErrorComponent,
  RefineSnackbarProvider,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  ProgramsCreate,
  ProgramsEdit,
  ProgramsList,
  ProgramsShow,
} from "./pages/programs";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import {ExercisesCreate, ExercisesEdit, ExercisesList, ExercisesShow} from "./pages/exercises";
import {Layers, LibraryBooks, Timer} from "@mui/icons-material";
import {EquipmentCreate, EquipmentEdit, EquipmentList, EquipmentShow} from "./pages/equipment";
import {MuscleGroupCreate, MuscleGroupEdit, MuscleGroupList, MuscleGroupShow} from "./pages/muscle-groups";
import {WorkoutsCreate, WorkoutsEdit, WorkoutsList, WorkoutsShow} from "./pages/workouts";
import {ExerciseTypeCreate, ExerciseTypeEdit, ExerciseTypeList, ExerciseTypeShow} from "./pages/exercise-types";

function App() {
  return (
    <BrowserRouter>
      {/*<GitHubBanner />*/}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider("http://localhost:3000")}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "properties",
                    meta: {
                      label: "Properties",
                      // icon: <YourIcon />, // optional icon
                    },
                  },
                  {
                    name: "exercise-types",
                    list: ExerciseTypeList,
                    edit: ExerciseTypeEdit,
                    create: ExerciseTypeCreate,
                    meta: { label: "Exercise Types", parent: "properties", icon: <></> },
                  },
                  {
                    name: "equipment",
                    list: EquipmentList,
                    edit: EquipmentEdit,
                    create: EquipmentCreate,
                    meta: { label: "Equipment", parent: "properties", icon: <></> },
                  },
                  {
                    name: "muscle-groups",
                    list: MuscleGroupList,
                    edit: MuscleGroupEdit,
                    create: MuscleGroupCreate,
                    meta: { label: "Muscle Groups", parent: "properties", icon: <></> },
                  },
                  {
                    name: "training-library",
                    meta: {
                      label: "Training Library",
                      icon: <LibraryBooks />,
                    },
                  },
                  {
                    name: "exercises",
                    list: "/exercises",
                    create: "/exercises/create",
                    edit: "/exercises/edit/:id",
                    show: "/exercises/show/:id",

                    meta: {
                      canDelete: true,
                      icon: <FitnessCenterIcon/>,
                      parent: "training-library",
                    },
                  },
                  {
                    name: "workouts",
                    list: "/workouts",
                    create: "/workouts/create",
                    edit: "/workouts/edit/:id",
                    show: "/workouts/show/:id",

                    meta: {
                      canDelete: true,
                      icon: <Timer/>,
                      parent: "training-library",
                    },
                  },
                  {
                    name: "programs",
                    list: "/programs",
                    create: "/programs/create",
                    edit: "/programs/edit/:id",
                    show: "/programs/show/:id",

                    meta: {
                      canDelete: true,
                      icon: <Layers />,
                      parent: "training-library",

                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "CMH5MH-8usFaB-101BdX",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2 Header={Header}>
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="programs" />}
                    />
                    <Route path="/exercise-types">
                      <Route index element={<ExerciseTypeList />} />
                      <Route path="create" element={<ExerciseTypeCreate />} />
                      <Route path="edit/:id" element={<ExerciseTypeEdit />} />
                      <Route path="show/:id" element={<ExerciseTypeShow />} />
                    </Route>
                    <Route path="/equipment">
                      <Route index element={<EquipmentList />} />
                      <Route path="create" element={<EquipmentCreate />} />
                      <Route path="edit/:id" element={<EquipmentEdit />} />
                      <Route path="show/:id" element={<EquipmentShow />} />
                    </Route>
                    <Route path="/muscle-groups">
                      <Route index element={<MuscleGroupList />} />
                      <Route path="create" element={<MuscleGroupCreate />} />
                      <Route path="edit/:id" element={<MuscleGroupEdit />} />
                      <Route path="show/:id" element={<MuscleGroupShow />} />
                    </Route>
                    <Route path="/programs">
                      <Route index element={<ProgramsList />} />
                      <Route path="create" element={<ProgramsCreate />} />
                      <Route path="edit/:id" element={<ProgramsEdit />} />
                      <Route path="show/:id" element={<ProgramsShow />} />
                    </Route>
                    <Route path="/workouts">
                      <Route index element={<WorkoutsList />} />
                      <Route path="create" element={<WorkoutsCreate />} />
                      <Route path="edit/:id" element={<WorkoutsEdit />} />
                      <Route path="show/:id" element={<WorkoutsShow />} />
                    </Route>
                    <Route path="/exercises">
                      <Route index element={<ExercisesList />} />
                      <Route path="create" element={<ExercisesCreate />} />
                      <Route path="edit/:id" element={<ExercisesEdit />} />
                      <Route path="show/:id" element={<ExercisesShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
