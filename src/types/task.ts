type TimeElapsed = {
  [date: string]: number; // e.g., "2025-06-08": 1800000
};

export type Task = {
    name: string,
    dueDate: string,
    startTime: string,
    elapsed: number,
    isPaused: boolean,
    pauseTime?: string,
    done?: boolean,
    timeElapsed?: TimeElapsed
}