//src/service/authService.js
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    getDocs 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const userRoles = {
    ADMIN: 'admin',
    USER: 'user'
  };
  
  export const defaultPermissions = {
    pepper: false,
    spider: false,
    dog: false,
    teledriving: false,
    robotArm: false
  };
  
  // Crear un nuevo usuario en Firestore
  export const createUserRecord = async (user, role = userRoles.USER) => {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      email: user.email,
      displayName: user.displayName || '',
      role: role,
      permissions: defaultPermissions,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
  
    await setDoc(userRef, userData);
    return userData;
  };
  
  // Obtener los datos de un usuario
  export const getUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  };
  
  // Actualizar permisos de usuario
  export const updateUserPermissions = async (uid, permissions) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { permissions });
  };
  
  // Actualizar rol de usuario
  export const updateUserRole = async (uid, role) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  };
  
  // Obtener todos los usuarios
  export const getAllUsers = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // Registrar actividad del usuario
  export const logUserActivity = async (uid, activity) => {
    const logsRef = collection(db, 'logs');
    const logData = {
      userId: uid,
      activity,
      timestamp: new Date().toISOString()
    };
    
    await setDoc(doc(logsRef), logData);
  };
  
  // Verificar permisos de usuario
  export const checkUserPermission = async (uid, robotType) => {
    const userData = await getUserData(uid);
    return userData?.permissions?.[robotType] || false;
  };