// utils/userHelper.ts

/**
 * Get user display name from database or generate anonymous name
 */
export const getUserDisplayName = async (userId: string, supabase: any): Promise<string> => {
  if (!userId || userId === 'guest') {
    return 'Anonymous';
  }

  try {
    // First, check if this is a database user
    const { data: userData, error } = await supabase
      .from('users')  // or 'profiles' - use your actual table name
      .select('name, username, email')
      .eq('id', userId)
      .single();

    if (!error && userData) {
      // User exists in database
      return userData.name || userData.username || `User_${userId.substring(0, 6)}`;
    }

    // Check if this is an old anonymous user ID pattern
    if (userId.startsWith('user_') || userId.startsWith('anonymous_')) {
      return `Anonymous_${userId.substring(0, 6)}`;
    }

    // For any other user ID format, create a generic display name
    return `User_${userId.substring(0, 6)}`;
    
  } catch (error) {
    console.error('Error fetching user display name:', error);
    // Fallback to generic anonymous name
    return `Anonymous_${userId.substring(0, 6)}`;
  }
};

/**
 * Get user name for chat messages (synchronous version for immediate use)
 */
export const getChatUserName = (): string => {
  if (typeof window === 'undefined') return 'Anonymous';
  
  const userId = localStorage.getItem('anonymousUser');
  
  if (!userId) return 'Anonymous';
  
  // Check if it's an old anonymous ID pattern
  if (userId.startsWith('user_') || userId.startsWith('anonymous_')) {
    return `Anonymous_${userId.substring(0, 6)}`;
  }
  
  // For database user IDs, we'll need to fetch async
  // Return temporary name that will be updated when async fetch completes
  return `User_${userId.substring(0, 6)}`;
};

/**
 * Enhanced message sending with proper user name handling
 */
export const sendMessageWithUser = async (
  supabase: any,
  content: string,
  roomId: string,
  userId?: string
) => {
  const user = userId || localStorage.getItem('anonymousUser') || 'guest';
  
  // Get user display name
  let userName = 'Anonymous';
  
  if (user && user !== 'guest') {
    try {
      userName = await getUserDisplayName(user, supabase);
    } catch (error) {
      console.error('Error getting user name, using fallback:', error);
      userName = user.startsWith('user_') || user.startsWith('anonymous_')
        ? `Anonymous_${user.substring(0, 6)}`
        : `User_${user.substring(0, 6)}`;
    }
  }
  
  // Insert message with guaranteed user_name
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      content: content.trim(),
      room_id: roomId,
      user_id: user,
      user_name: userName, // Always populated
      created_at: new Date().toISOString(),
    });
  
  return { data, error };
};