import { useEffect, useState } from 'react';
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
import { useUserContext } from '@/context/userContext';

interface CategoryTableProps {
  category: Category
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function CategoryTable({ category }: CategoryTableProps) {
  const { updateTaskPause, updateTaskDone } = useUserContext();
  const [done, setDone] = useState<boolean[]>(
    category.tasks.map(() => false)
  );

  const [paused, setPaused] = useState<boolean[]>(
    category.tasks.map(task => task.isPaused)
  );
  const [elapsedTimes, setElapsedTimes] = useState<number[]>(
    category.tasks.map(task => task.elapsed)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes(prev =>
        prev.map((time, idx) =>
          paused[idx] ? time : time + 1000
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const handlePause = (idx: number) => {
    setPaused(prev =>
      prev.map((val, i) => (i === idx ? !val : val))
    );
    updateTaskPause(category.name, category.tasks[idx].name, !paused[idx]);
  };

  const handleDone = (idx: number) => {
    setDone(prev =>
      prev.map((val, i) => (i === idx ? !val : val))
    );
    updateTaskDone(category.name, category.tasks[idx].name, !done[idx]);
  };

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
            {category.tasks.map((task, idx) => (
              <TableRow key={idx}>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>{formatElapsed(elapsedTimes[idx])}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color={paused[idx] ? "secondary" : "primary"}
                    onClick={() => handlePause(idx)}
                  >
                    {paused[idx] ? "Resume" : "Pause"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={done[idx]}
                    onChange={() => handleDone(idx)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}