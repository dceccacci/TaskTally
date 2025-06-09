"use client"
import {
    createContext, 
    useContext, 
    useState,
    useEffect, 
    ReactNode } from 'react';
import {
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    User } from "firebase/auth"
import {
    collection, 
    doc, 
    query, 
    where, 
    getDocs, 
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove } from "firebase/firestore"

import {auth} from "../services/firebase"
import {db} from "@/services/firebase"
import { Category } from '@/types/category';
import { Task } from '@/types/task';

type TaskContextType = {
    user : User | null;
    categories: Category[];
    updateTaskPause: (categoryName: string, taskName: string, elapsed: number, isPaused: boolean, timeElapsed: { [date: string]: number }) => Promise<void>;
    updateTaskDone: (categoryName: string, taskName: string, done: boolean) => Promise<void>;
    setUser: (user: User | null) => void;
    addCategory: (newCategory: Category) => Promise<void>;
    addTask: (categoryName: string, newTask: Task) => Promise<void>;

}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskContextProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [categories, setCategories] = useState<Category[]>([])
    
    useEffect(()=> {
        const unsubscribe = auth.onAuthStateChanged((user)=> {setUser(user)});
        return unsubscribe
    }, []);

    useEffect(() => {
        if (user) {
            getUserData(user.uid).then(data => {
                if (data && data.categories) {
                    setCategories(data.categories);
                } else {
                    setCategories([]);
                }
            });
        } else {
            setCategories([]);
        }
    }, [user]);

    async function addCategory(newCategory: Category): Promise<void> {
        if (!user) return;
            const updated = await addCategoryToDB(user, newCategory);
        if (updated) setCategories(updated);
    }

    async function addTask(categoryName: string, newTask: Task): Promise<void> {
        if (!user) return;
            const updated = await addTaskToCategoryDB(user, categoryName, newTask);
        if (updated) setCategories(updated);
    }

    async function updateTaskPause(categoryName: string, taskName: string, elapsed: number, isPaused: boolean, timeElapsed: {[date: string]: number}) {
        console.log(isPaused)
        setCategories(prev =>
            prev.map(cat =>
                cat.name === categoryName
                    ? {
                        ...cat,
                        tasks: cat.tasks.map(task =>
                            task.name === taskName
                                ? { ...task, elapsed, isPaused, timeElapsed }
                                : task
                        ),
                    }
                    : cat
            )
        );
        if (user) {
            const updated = categories.map(cat =>
                cat.name === categoryName
                ? {
                    ...cat,
                    tasks: cat.tasks.map(task =>
                        task.name === taskName
                        ? { ...task, elapsed, isPaused, timeElapsed }
                        : task
                    ),
                    }
                : cat
            );
            await updateCategoriesInDB(user, updated);
        }
    }

    async function updateTaskDone(categoryName: string, taskName: string, done: boolean) {
        setCategories(prev =>
            prev.map(cat =>
                cat.name === categoryName
                    ? {
                        ...cat,
                        tasks: cat.tasks.map(task =>
                            task.name === taskName
                                ? { ...task, done }
                                : task
                        ),
                    }
                    : cat
    ));}
    
    return(
        <TaskContext.Provider value={{user, categories, updateTaskPause, updateTaskDone, setUser, addCategory, addTask}}>{children}</TaskContext.Provider>
    )
}

export const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
};

export const logOut = (setUser: (user: User | null) => void) => {
    signOut(auth).then(() => setUser(null));
};


async function getUserData(uid: string): Promise<{ userUid: string; categories: Category[] } | null> {
    try {
        const q = query(collection(db, "users"), where("userUid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as { userUid: string; categories: Category[] };
        } else {
            return null;
        }
    } catch (e) {
        console.log("Error getting document: ", e);
        return null;
    }
}

export async function updateCategoriesInDB(user: User, updatedCategories: Category[]): Promise<Category[] | null> {
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            userUid: user.uid,
            categories: updatedCategories
        }, { merge: true });
        return updatedCategories;
    } catch (e) {
        console.log("Error updating categories: ", e);
        return null;
    }
}

export async function addCategoryToDB(user: User, newCategory: Category): Promise<Category[] | null> {
    const data = await getUserData(user.uid);
    let updatedCategories: Category[] = [];
    if (data && data.categories) {
        updatedCategories = [...data.categories, newCategory];
    } else {
        updatedCategories = [newCategory];
    }
    return updateCategoriesInDB(user, updatedCategories);
}

export async function addTaskToCategoryDB(user: User, categoryName: string, newTask: Task): Promise<Category[] | null> {
    const data = await getUserData(user.uid);
    if (!data || !data.categories) return null;

    const updatedCategories = data.categories.map(cat =>
        cat.name === categoryName
            ? { ...cat, tasks: [...cat.tasks, newTask] }
            : cat
    );
    return updateCategoriesInDB(user, updatedCategories);
}

export function useTaskContext() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error("useTaskContext must be used within a TaskContextProvider");
    }
    return context;
}