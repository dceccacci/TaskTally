"use client";

import { Box, Grid, Typography, Card, CardContent, Divider } from "@mui/material";
import { useTaskContext } from "@/context/taskContext";
import { useMemo } from "react";
import NavBar from "../components/navBar";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function StatsPage() {
  const { categories } = useTaskContext();

  const stats = useMemo(() => {
    const allTasks = categories.flatMap((cat) => cat.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.done).length;
    const incompleteTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalElapsed = allTasks.reduce((sum, task) => {
      return sum + (task.elapsed || 0);
    }, 0);;

    const averageElapsed = totalTasks > 0 ? totalElapsed / totalTasks : 0;

    const mostTimeTask = allTasks.reduce(
      (max, task) => (task.elapsed > max.time ? { name: task.name, time: task.elapsed } : max),
      { name: "N/A", time: 0 }
    );

    const overdue = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.done).length;
    const nextDue = allTasks.filter(t => t.dueDate && !t.done)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

    return {
      totalCategories: categories.length,
      totalTasks,
      completedTasks,
      incompleteTasks,
      completionRate,
      totalElapsed,
      averageElapsed,
      mostTimeTask,
      overdue,
      nextDue,
    };
  }, [categories]);

  return (
    <Box>
      <NavBar/>
      <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Productivity Stats
      </Typography>
      <Grid>
        <Grid>
          <StatCard title="Total Categories" value={stats.totalCategories} />
        </Grid>
        <Grid>
          <StatCard title="Total Tasks" value={stats.totalTasks} />
        </Grid>
        <Grid>
          <StatCard title="Completed Tasks" value={stats.completedTasks} />
        </Grid>
        <Grid>
          <StatCard title="Incomplete Tasks" value={stats.incompleteTasks} />
        </Grid>
        <Grid>
          <StatCard title="Completion Rate" value={`${stats.completionRate}%`} />
        </Grid>

        <Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" gutterBottom>
            Time Tracked
          </Typography>
        </Grid>

        <Grid>
          <StatCard title="Total Time Tracked" value={formatTime(stats.totalElapsed)} />
        </Grid>
        <Grid>
          <StatCard title="Average Time per Task" value={formatTime(stats.averageElapsed)} />
        </Grid>
        <Grid>
          <StatCard title="Most Time-Consuming Task" value={`${stats.mostTimeTask.name} (${formatTime(stats.mostTimeTask.time)})`} />
        </Grid>

        <Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" gutterBottom>
            Deadlines
          </Typography>
        </Grid>

        <Grid>
          <StatCard title="Overdue Tasks" value={stats.overdue} />
        </Grid>
        <Grid>
          <StatCard title="Next Due Task" value={stats.nextDue ? `${stats.nextDue.name} (${new Date(stats.nextDue.dueDate!).toLocaleDateString()})` : 'None'} />
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card elevation={3} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </CardContent>
    </Card>
  );
}
