import { useEffect, useRef, useState } from 'react';
import { Category } from '@/types/category';

import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
} from '@mui/material';
import { useTaskContext } from '@/context/taskContext';
import { Task } from '@/types/task';


function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dayStr = days > 0 ? `${days}d ` : "";
  const hourStr = hours.toString().padStart(2, '0');
  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  return `${dayStr}${hourStr}:${minStr}:${secStr}`;
}

export default function CategoryTable({ idx }: { idx: number }) {
  const { categories, updateTaskPause, updateTaskDone } = useTaskContext();
  const [category, setCategory] = useState<Category | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [done, setDone] = useState<boolean[] | null>(null)
  const [paused, setPaused] = useState<boolean[] | null>(null)
  const [elapsedTimes, setElapsedTimes] = useState<number[] | null>(null)
  const lastUpdateRef = useRef<number>(Date.now());
  
  useEffect(()=>{
    if(categories[idx]){
      setCategory(categories[idx]);
      setTasks(categories[idx].tasks);
    }
  }, [categories[idx]]);
  
  useEffect(() => {
    if (tasks) {
      setDone(tasks.map(() => false));
      setPaused(tasks.map(task => task.isPaused));
      setElapsedTimes(prev => {
        if (prev && prev.length === tasks.length) return prev;
        return tasks.map(task => {
          const now = Date.now();
          const timeMap = task.timeElapsed || {};
          const entries = Object.values(timeMap);
          if (entries.length === 0) {
            return now - new Date(task.startTime).getTime();
          } else {
            return entries
            .filter(val => val > 0)
            .reduce((sum, val) => sum + val, 0);
          }
          // return entries
          //   .filter(val => val > 0)
          //   .reduce((sum, val) => sum + val, 0);
        });
      });
    }
  }, [tasks]);
  

  useEffect(() => {
    if (!paused || !elapsedTimes) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setElapsedTimes(prev =>
        prev!.map((time, idx) =>
          paused[idx] ? time : time + delta 
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [paused]);

  const handlePause = async ( idx: number) => {
    const now = Date.now();
    const task = tasks![idx];
    const timeElapsed = { ...(task.timeElapsed || {}) };
    const isPaused = !paused![idx];


    const timeKeys = Object.keys(timeElapsed);
    let lastKey = null;
    // let lastValue = null;
    if (timeKeys.length > 0) {
      lastKey = timeKeys[timeKeys.length - 1];
      // lastValue = timeElapsed[lastKey];
    }

    let newValue = 0;
    if (!lastKey) {
      newValue = (now - new Date(task.startTime).getTime());
    } else {
      if (isPaused) {
        newValue = now - Number(lastKey);
      } else {
        newValue = -(now - Number(lastKey));
      }
    }
    
    timeElapsed[now] = newValue;

    setPaused(prev =>
      prev!.map((val, i) => (i === idx ? !val : val))
    );

    await updateTaskPause(
      category!.name,
      task.name,
      elapsedTimes![idx],
      isPaused,
      timeElapsed
    );
  };

  const handleDone = (idx: number) => {
    setDone(prev =>
      prev!.map((val, i) => (i === idx ? !val : val))
    );
    updateTaskDone(category!.name, tasks![idx].name, !done![idx]);
  };
  
  if(!tasks){
    return (<Box>Loading Data</Box>)
  }
  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 400, fontWeight: 'bold'  }}>Task Name</TableCell>
              <TableCell sx={{ width: 200, fontWeight: 'bold'  }}>Due Date</TableCell>
              <TableCell sx={{ width: 200, fontWeight: 'bold'  }}>Time Elapsed</TableCell>
              <TableCell sx={{ width: 200, fontWeight: 'bold'  }}>Pause</TableCell>
              <TableCell sx={{ width: 200, fontWeight: 'bold'  }}>Done</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks!
              .map((task, idx) => ({ task, idx }))
              .filter(({ task }) => !task.done)
              .map(({ task, idx }) => (
                <TableRow key={idx} sx={{ backgroundColor: new Date(task.dueDate) < new Date() ? "#ffe6e6" : "inherit", }}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                  </TableCell>
                  {elapsedTimes ? <TableCell>{formatElapsed(elapsedTimes[idx])}</TableCell> : <TableCell></TableCell>}
                  {paused ? 
                    <TableCell>
                      <Button
                        variant="outlined"
                        color={paused![idx] ? "secondary" : "primary"}
                        onClick={() => handlePause(idx)}
                      >
                        {paused?.[idx] ? "Resume" : "Pause"}
                      </Button>
                    </TableCell> : <TableCell></TableCell>}
                  {done ? 
                    <TableCell>
                      <Checkbox
                        checked={Boolean(done?.[idx])}
                        onChange={() => handleDone(idx)}
                      />
                    </TableCell> : <TableCell></TableCell>
                    }
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}