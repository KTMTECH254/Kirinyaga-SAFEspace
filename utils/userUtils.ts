// utils/userUtils.ts

export interface AnonymousUser {
  id: string;
  name: string;
  avatar?: string | null;
  color?: string;
  created?: string;
}

export function getUserFromLocalStorage(): AnonymousUser {
  try {
    const userData = localStorage.getItem('anonymousUser');
    
    if (!userData) {
      // Create new anonymous user
      return createNewAnonymousUser();
    }
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(userData);
      
      // If it's a string (old format), migrate it
      if (typeof parsed === 'string') {
        console.log('Migrating string user data to object format');
        return migrateStringUser(parsed);
      }
      
      // If it's an object but missing required fields, fix it
      if (typeof parsed === 'object' && parsed !== null) {
        return fixUserObject(parsed);
      }
      
      // If we get here, it's some other type
      return createNewAnonymousUser();
      
    } catch (parseError) {
      // Data is not valid JSON - it's a plain string
      console.log('User data is not JSON, migrating:', userData);
      return migrateStringUser(userData);
    }
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    // Fallback to creating a new user
    return createNewAnonymousUser();
  }
}

export function saveUserToLocalStorage(user: AnonymousUser): void {
  try {
    localStorage.setItem('anonymousUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
}

export function createNewAnonymousUser(): AnonymousUser {
  const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userName = `Anonymous_${Math.random().toString(36).substr(2, 6)}`;
  
  const newUser: AnonymousUser = {
    id: userId,
    name: userName,
    avatar: null,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: new Date().toISOString()
  };
  
  saveUserToLocalStorage(newUser);
  return newUser;
}

function migrateStringUser(userString: string): AnonymousUser {
  const migratedUser: AnonymousUser = {
    id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: userString.substring(0, 30), // Limit name length
    avatar: null,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: new Date().toISOString()
  };
  
  saveUserToLocalStorage(migratedUser);
  return migratedUser;
}

function fixUserObject(userObj: any): AnonymousUser {
  const fixedUser: AnonymousUser = {
    id: userObj.id || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: userObj.name || userObj.user_name || `Anonymous_${Math.random().toString(36).substr(2, 6)}`,
    avatar: userObj.avatar || null,
    color: userObj.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: userObj.created || new Date().toISOString()
  };
  
  // Only save if we had to fix something
  if (!userObj.id || !userObj.name) {
    saveUserToLocalStorage(fixedUser);
  }
  
  return fixedUser;
}

export function ensureUserHasId(user: any): AnonymousUser {
  if (!user.id) {
    return {
      ...user,
      id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  return user;
}

export function getUserForChat(): { id: string; name: string } {
  const user = getUserFromLocalStorage();
  return {
    id: user.id,
    name: user.name
  };
}