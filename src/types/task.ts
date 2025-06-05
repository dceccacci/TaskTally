export type Task = {
    name: string,
    dueDate: string,
    startTime: string,
    elapsed: number,
    isPaused: boolean,
    pauseTime?: string,
    done?: boolean
}