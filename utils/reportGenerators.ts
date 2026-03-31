// utils/reportGenerators.ts
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  roomId?: string;
  userId?: string;
  status?: string;
}

export async function generateUserReport(filters: ReportFilters) {
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .gte('created_at', filters.startDate.toISOString())
    .lte('created_at', filters.endDate.toISOString());

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('user_id, created_at')
    .gte('created_at', filters.startDate.toISOString())
    .lte('created_at', filters.endDate.toISOString());

  const usersList = users ?? [];
  const messagesList = messages ?? [];

  // Calculate user activity
  const userActivity = usersList.map(user => {
    const userMessages = messagesList.filter(m => m.user_id === user.id);
    return {
      ...user,
      messageCount: userMessages.length,
      lastActive: userMessages.length > 0 
        ? Math.max(...userMessages.map(m => new Date(m.created_at).getTime()))
        : null
    };
  });

  return {
    summary: {
      totalUsers: usersList.length,
      activeUsers: new Set(messagesList.map(m => m.user_id)).size,
      avgMessagesPerUser: messagesList.length / (usersList.length || 1),
      newUsersToday: usersList.filter(u => 
        new Date(u.created_at) > subDays(new Date(), 1)
      ).length
    },
    detailed: userActivity,
    generatedAt: new Date().toISOString()
  };
}

export async function generateChatReport(filters: ReportFilters) {
  let query = supabase
    .from('chat_messages')
    .select('*')
    .gte('created_at', filters.startDate.toISOString())
    .lte('created_at', filters.endDate.toISOString());

  if (filters.roomId) {
    query = query.eq('room_id', filters.roomId);
  }

  const { data: messages } = await query;
  const messagesList = messages ?? [];

  // Group by hour
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: messagesList.filter(m => 
      new Date(m.created_at).getHours() === hour
    ).length
  }));

  // Group by day
  const dailyData = messagesList.reduce((acc, message) => {
    const date = format(new Date(message.created_at), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most active users
  const userActivity = messagesList.reduce((acc, message) => {
    acc[message.user_name] = (acc[message.user_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topUsers = Object.entries(userActivity as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    summary: {
      totalMessages: messagesList.length,
      uniqueUsers: new Set(messagesList.map(m => m.user_name)).size,
      avgMessagesPerDay: messagesList.length / 
        Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      peakHour: hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyData[0])
    },
    hourlyData,
    dailyData,
    topUsers,
    messages: messagesList.slice(0, 100) // Last 100 messages
  };
}

export async function generateResourceReport(filters: ReportFilters) {
  let query = supabase
    .from('resources')
    .select('*')
    .gte('created_at', filters.startDate.toISOString())
    .lte('created_at', filters.endDate.toISOString());

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data: resources } = await query;
  const resourcesList = resources ?? [];

  // Calculate statistics
  const stats = {
    totalResources: resourcesList.length,
    approved: resourcesList.filter(r => r.status === 'approved').length,
    pending: resourcesList.filter(r => r.status === 'pending').length,
    rejected: resourcesList.filter(r => r.status === 'rejected').length,
    totalDownloads: resourcesList.reduce((sum, r) => sum + (r.downloads || 0), 0),
    totalUpvotes: resourcesList.reduce((sum, r) => sum + (r.upvotes || 0), 0),
    totalDownvotes: resourcesList.reduce((sum, r) => sum + (r.downvotes || 0), 0)
  };

  // Top resources by downloads
  const topDownloads = [...resourcesList]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10);

  // Top resources by votes
  const topVotes = [...resourcesList]
    .sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)))
    .slice(0, 10);

  // Resource types distribution
  const typeDistribution = resourcesList.reduce((acc, resource) => {
    const type = resource.file_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: stats,
    topDownloads,
    topVotes,
    typeDistribution,
    resources: resourcesList.slice(0, 50) // Last 50 resources
  };
}
