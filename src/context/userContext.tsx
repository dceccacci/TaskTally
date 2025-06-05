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

type ProfileContextType = {
    user : User | null;
    categories: Category[];
    updateTaskPause: (categoryName: string, taskName: string, isPaused: boolean) => Promise<void>;
    updateTaskDone: (categoryName: string, taskName: string, done: boolean) => Promise<void>;

}

const UserContext = createContext<ProfileContextType | undefined>(undefined);


export function UserContextProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [categories, setCategories] = useState<Category[]>([])
    
    useEffect(()=> {
        const unsubscribe = auth.onAuthStateChanged((user)=> {setUser(user)});
        return unsubscribe
    }, []);

    async function updateTaskPause(categoryName: string, taskName: string, isPaused: boolean) {
        setCategories(prev =>
            prev.map(cat =>
                cat.name === categoryName
                    ? {
                        ...cat,
                        tasks: cat.tasks.map(task =>
                            task.name === taskName
                                ? { ...task, isPaused }
                                : task
                        ),
                    }
                    : cat
    ));}

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

    // --------MOCK DATA--------
    useEffect(()=>{
        setCategories([mockCategory, mockCategory2]);
    }, []);

    const mockCategory: Category = {
        name: "School",
        tasks: [
            {
            name: "Math Homework",
            dueDate: "2025-06-10",
            startTime: "2025-06-05T14:00:00Z",
            elapsed: 3600000, // 1 hour in ms
            isPaused: false,
            },
            {
            name: "Science Project",
            dueDate: "2025-06-12",
            startTime: "2025-06-05T15:30:00Z",
            elapsed: 1800000, // 30 minutes in ms
            isPaused: true,
            pauseTime: "2025-06-05T16:00:00Z",
            },
            {
            name: "History Essay",
            dueDate: "2025-06-15",
            startTime: "2025-06-05T13:00:00Z",
            elapsed: 5400000, // 1.5 hours in ms
            isPaused: false,
            },
        ],
    };
    const mockCategory2 = {
        name: "Personal",
        tasks: [
            {
            name: "Grocery Shopping",
            dueDate: "2025-06-08",
            startTime: "2025-06-05T10:00:00Z",
            elapsed: 2700000, // 45 minutes in ms
            isPaused: false,
            },
            {
            name: "Call Mom",
            dueDate: "2025-06-07",
            startTime: "2025-06-05T11:00:00Z",
            elapsed: 600000, // 10 minutes in ms
            isPaused: true,
            pauseTime: "2025-06-05T11:10:00Z",
            },
            {
            name: "Read Book",
            dueDate: "2025-06-15",
            startTime: "2025-06-05T20:00:00Z",
            elapsed: 1200000, // 20 minutes in ms
            isPaused: false,
            },
        ],
    };
    // --------MOCK DATA--------
    
    return(
        <UserContext.Provider value={{user, categories, updateTaskPause, updateTaskDone}}>{children}</UserContext.Provider>
    )
}

export const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
};

export const logOut = () => {
    signOut(auth);
};


// async function getUserProfile(uid: string): Promise<UserProfile | null> {
//     try {
//         const q = query(collection(db, "profile"), where("uid", "==", uid));
//         const querySnapshot = await getDocs(q);
//         if (!querySnapshot.empty) {
//             return querySnapshot.docs[0].data() as UserProfile;
//         } else {
//             return null;
//         }
//     } catch (e) {
//         console.log("Error getting document: ", e);
//         return null;
//     }
// }

// async function addUserToDB(user: User): Promise<UserProfile | null> {
//     try {
//         const profile = await getUserProfile(user.uid);
//         if (profile) {
//             await setDoc(doc(db, "profile", profile.uid), profile);
//             return profile;
//         } else {
//             const newProfile: UserProfile = {
//                 uid: user.uid,
//                 photoURL: user.photoURL || "",
//                 displayName: user.displayName || "",
//                 email: user.email || "",
//             };
//             await setDoc(doc(db, "profile", newProfile.uid), newProfile);
//             return newProfile;
//         }
//     } catch (e) {
//         console.log("Error adding document: ", e);
//         return null;
//     }
// }

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}