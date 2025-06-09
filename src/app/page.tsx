'use client'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Typography } from "@mui/material";
import NavBar from "./components/navBar";
import { useTaskContext } from "@/context/taskContext";
import CategoryTable from "./components/categoryTable";
import { useRef, useState } from "react";
import { Task } from '@/types/task';

export default function Home() {
  const {categories, addCategory, addTask} = useTaskContext();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const addTaskButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleAddTaskClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory('');
    setTaskName('');
    setDueDate(null)
    addTaskButtonRef.current?.focus();
    setNewCategoryMode(false)
    setNewCategoryName('')
  };

  function createNewTaskFromForm():
    Task {
      return {
        name: taskName.trim(),
        startTime: new Date().toISOString(),
        elapsed: 0,
        isPaused: false,
        done: false,
        dueDate: dueDate ? dueDate.toISOString() : "",
        timeElapsed: {},
      };
  }
 

  const handleSubmit = async () => {
    if (newCategoryName.trim()){
      const tasksArray = taskName.trim() ? [createNewTaskFromForm()]: [];  
      const newCategory = {
        name: newCategoryName.trim(),
        tasks: tasksArray,
      };
      await addCategory(newCategory);

    } else if (taskName.trim()) {
      await addTask(selectedCategory, createNewTaskFromForm());
    }
    handleClose();
  };

  return (
    <Box>
      <NavBar/>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5, mb: 5, mr: 10 }}>
        <Button variant="contained" onClick={handleAddTaskClick} ref={addTaskButtonRef}>
          Add Task
        </Button>
      </Box>

      {/* Dialog Popup */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add a Task</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Select
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "_new") {
                setNewCategoryMode(true);
                setSelectedCategory('');
              } else {
                setNewCategoryMode(false);
                setSelectedCategory(val);
              }
            }}
            displayEmpty
          >
            <MenuItem value="" disabled>Select a category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.name} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
            <MenuItem value="_new">➕ Add new category...</MenuItem>
          </Select>
          {newCategoryMode && (
            <TextField
              label="New Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          )}
          <TextField
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <TextField
            label="Due Date"
            type="date"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={dueDate ? dueDate.toISOString().substring(0, 10) : ''}
            onChange={(e) => setDueDate(new Date(e.target.value))}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (newCategoryMode && newCategoryName.trim() === '') ||
              (!newCategoryMode && (selectedCategory === '' || taskName.trim() === ''))
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Table */}
      {categories && categories.map((category, idx) => (
        <Box key={idx}>
          <Typography variant="h6" sx={{ ml: 2, mb: 1 }}>
              {category.name}
            </Typography>
          <Box  sx={{ mb: 4, border: "1px solid #ccc", borderRadius: 2, px:3, py:2, mx:2, backgorundColor: "#fafafa"}}>
            <CategoryTable idx={idx} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
