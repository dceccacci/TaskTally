"use client"
// User login / User Settings
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
    setDoc } from "firebase/firestore"
import {auth} from "../services/firebase"
import {db} from "@/services/firebase"
import { UserProfile } from '@/types/user';

type ProfileContextType = {
    user : User | null;
    profile : UserProfile | null;
    setProfile: (profile: UserProfile | null) => void;
}

const UserContext = createContext<ProfileContextType | undefined>(undefined);

export function UserContextProvider({children}: {children: ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    
    useEffect(()=> {
        const unsubscribe = auth.onAuthStateChanged((user)=> {setUser(user)});
        return unsubscribe
    }, []);

    useEffect(()=>{
        if(user){
            addUserToDB(user).then((profile) => {
                if(profile){
                    setProfile(profile);
                }
            });
        } else {
            setProfile(null);
        }
    }, [user]);

    useEffect(()=>{
        if(profile){
            updateUserProfile(profile)
        }
    }, [profile]);
    
    return(
        <UserContext.Provider value={{user, profile, setProfile}}>{children}</UserContext.Provider>
    )
}

export const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
};

export const logOut = () => {
    signOut(auth);
};

async function updateUserProfile(profile: UserProfile): Promise<void> {
    try {
        await setDoc(doc(db, "profile", profile.uid), profile, { merge: true });
    } catch (e) {
        console.log("Error updating profile: ", e);
    }
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const q = query(collection(db, "profile"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as UserProfile;
        } else {
            return null;
        }
    } catch (e) {
        console.log("Error getting document: ", e);
        return null;
    }
}

async function addUserToDB(user: User): Promise<UserProfile | null> {
    try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
            await setDoc(doc(db, "profile", profile.uid), profile);
            return profile;
        } else {
            const newProfile: UserProfile = {
                uid: user.uid,
                photoURL: user.photoURL || "",
                displayName: user.displayName || "",
                email: user.email || "",
            };
            await setDoc(doc(db, "profile", newProfile.uid), newProfile);
            return newProfile;
        }
    } catch (e) {
        console.log("Error adding document: ", e);
        return null;
    }
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}