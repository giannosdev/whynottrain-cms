import React, { useState } from "react";
import {
  useShow,
  useOne,
  useNavigation,
  useMany,
  useNotification
} from "@refinedev/core";
import { 
  Show, 
  DateField 
} from "@refinedev/mui";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  LinearProgress,
  Tooltip
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TimerIcon from "@mui/icons-material/Timer";
import BarChartIcon from "@mui/icons-material/BarChart";
import ProgramAssignmentModal from "./components/ProgramAssignment/ProgramAssignmentModal";

/**
 * Interface for TabPanel props
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component for the tabbed interface
 */
const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
      style={{ paddingTop: 20 }}
    >
      {value === index && children}
    </div>
  );
};

/**
 * Client profile page showing details, assigned programs, and progress
 */
export const ClientsShow: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for program assignment modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  
  // Get client data from API
  const { queryResult } = useShow<any>({
    resource: "users",
  });
  const { data, isLoading } = queryResult;
  const client = data?.data;
  
  // Navigation hooks
  const { edit } = useNavigation();
  
  // Notification hooks
  const { open } = useNotification();
  
  // Fetch client's program instances
  const { data: programInstancesData, isLoading: isProgramsLoading } = useMany({
    resource: "program-instances",
    ids: [],
    queryOptions: {
      enabled: !!client?.id,
      queryKey: ["program-instances", { userId: client?.id }],
    },
    meta: {
      filters: [
        {
          field: "userId",
          operator: "eq",
          value: client?.id,
        },
      ],
    },
  });
  
  // Get client's gym if available
  const { data: gymData, isLoading: isGymLoading } = useOne({
    resource: "gyms",
    id: client?.gymId || "",
    queryOptions: {
      enabled: !!client?.gymId,
    },
  });
  
  const gym = gymData?.data;
  
  /**
   * Handle opening the program assignment modal
   */
  const handleOpenAssignmentModal = () => {
    setAssignmentModalOpen(true);
  };
  
  /**
   * Close the program assignment modal
   */
  const handleCloseAssignmentModal = () => {
    setAssignmentModalOpen(false);
  };
  
  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  /**
   * Calculate progress statistics for the client
   */
  const calculateProgressStats = () => {
    // In a real implementation, this would fetch and calculate actual progress
    return {
      workoutsCompleted: 18,
      totalWorkouts: 24,
      completionRate: 75,
      streakDays: 5,
      avgWorkoutTime: 65,
    };
  };
  
  const progressStats = calculateProgressStats();
  
  // Get full name or fallback
  const getFullName = () => {
    const firstName = client?.firstName || "";
    const lastName = client?.lastName || "";
    return [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Client";
  };
  
  // If loading, show progress indicator
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Show
      title={<Typography variant="h5">Client Profile</Typography>}
      headerButtons={[
        <Button
          key="edit"
          startIcon={<EditIcon />}
          onClick={() => edit("users", client?.id)}
        >
          Edit Client
        </Button>,
        <Button
          key="assign-program"
          startIcon={<AssignmentIcon />}
          variant="contained"
          color="primary"
          onClick={handleOpenAssignmentModal}
        >
          Assign Program
        </Button>,
      ]}
    >
      <Grid container spacing={3}>
        {/* Client Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2, fontSize: "2.5rem" }}
                >
                  {client?.firstName?.[0] || client?.lastName?.[0] || "C"}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {getFullName()}
                </Typography>
                <Chip
                  label={client?.role || "CLIENT"}
                  color="primary"
                  size="small"
                />
              </Box>
              
              <Divider />
              
              <Box mt={2}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EmailIcon fontSize="small" /> Email
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {client?.email}
                </Typography>
                
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
                >
                  <CalendarTodayIcon fontSize="small" /> Member Since
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <DateField value={client?.createdAt} format="PPP" />
                </Typography>
                
                {gym && (
                  <>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
                    >
                      <FitnessCenterIcon fontSize="small" /> Gym
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {gym.name}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
          
          {/* Progress Summary Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Training Summary
              </Typography>
              
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Completion Rate
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" component="span">
                        {progressStats.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressStats.completionRate}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Current Streak
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" component="span">
                        {progressStats.streakDays} days
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(progressStats.streakDays / 7) * 100}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      color="secondary"
                    />
                  </Grid>
                </Grid>
                
                <Box mt={3} display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="h5">
                      {progressStats.workoutsCompleted}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Workouts Completed
                    </Typography>
                  </Box>
                  
                  <Divider orientation="vertical" flexItem />
                  
                  <Box textAlign="center">
                    <Typography variant="h5">
                      {progressStats.avgWorkoutTime}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg. Minutes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tabs & Content */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab 
                label="Assigned Programs" 
                icon={<FitnessCenterIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Progress" 
                icon={<BarChartIcon />}
                iconPosition="start" 
              />
              <Tab 
                label="Recent Activity" 
                icon={<TimerIcon />}
                iconPosition="start" 
              />
            </Tabs>
            
            {/* Assigned Programs Tab */}
            <TabPanel value={activeTab} index={0}>
              {isProgramsLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : programInstancesData?.data?.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography color="textSecondary" paragraph>
                    No programs assigned yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={handleOpenAssignmentModal}
                  >
                    Assign First Program
                  </Button>
                </Box>
              ) : (
                <List>
                  {programInstancesData?.data?.map((instance: any) => (
                    <ListItem
                      key={instance.id}
                      divider
                      sx={{ 
                        borderLeft: instance.isActive ? 
                          '4px solid #1976d2' : 
                          '4px solid transparent',
                        pl: instance.isActive ? 2 : 3
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {instance.program?.name || "Unnamed Program"}
                            </Typography>
                            {instance.isActive && (
                              <Chip
                                label="Active"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Start Date: <DateField value={instance.startDate} format="PPP" />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Training Days: {(instance.chosenDays || [])
                                .map((day: number) => 
                                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]
                                )
                                .join(", ")}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1} gap={1}>
                              <Chip
                                size="small"
                                label={`${instance.program?.allocatedWorkouts?.length || 0} Workouts`}
                                icon={<FitnessCenterIcon />}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`${instance.completedWorkouts || 0} Completed`}
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="View Program Details">
                          <IconButton edge="end" aria-label="view">
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
            
            {/* Progress Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  This section will display charts and metrics of the client's progress.
                </Typography>
                
                {/* Placeholder for progress charts */}
                <Box
                  bgcolor="action.hover"
                  height={300}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={1}
                  border="1px dashed"
                  borderColor="divider"
                >
                  <Typography color="textSecondary">
                    Progress charts will be displayed here
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Activity Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>
                  Recent Workout Activity
                </Typography>
                
                {/* Placeholder for recent activity */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Recent workout completion, progress, and client feedback will appear here.
                  </Typography>
                </Paper>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Program Assignment Modal */}
      <ProgramAssignmentModal
        open={assignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        clientId={client?.id}
        clientName={getFullName()}
      />
    </Show>
  );
};
