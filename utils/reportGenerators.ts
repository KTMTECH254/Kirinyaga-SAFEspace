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

  // Calculate user activity
  const userActivity = users?.map(user => {
    const userMessages = messages?.filter(m => m.user_id === user.id) || [];
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
      totalUsers: users?.length || 0,
      activeUsers: new Set(messages?.map(m => m.user_id)).size,
      avgMessagesPerUser: messages?.length / (users?.length || 1),
      newUsersToday: users?.filter(u => 
        new Date(u.created_at) > subDays(new Date(), 1)
      ).length || 0
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

  // Group by hour
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: messages?.filter(m => 
      new Date(m.created_at).getHours() === hour
    ).length || 0
  }));

  // Group by day
  const dailyData = messages?.reduce((acc, message) => {
    const date = format(new Date(message.created_at), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most active users
  const userActivity = messages?.reduce((acc, message) => {
    acc[message.user_name] = (acc[message.user_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topUsers = Object.entries(userActivity || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    summary: {
      totalMessages: messages?.length || 0,
      uniqueUsers: new Set(messages?.map(m => m.user_name)).size,
      avgMessagesPerDay: (messages?.length || 0) / 
        Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      peakHour: hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyData[0])
    },
    hourlyData,
    dailyData,
    topUsers,
    messages: messages?.slice(0, 100) // Last 100 messages
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

  // Calculate statistics
  const stats = {
    totalResources: resources?.length || 0,
    approved: resources?.filter(r => r.status === 'approved').length || 0,
    pending: resources?.filter(r => r.status === 'pending').length || 0,
    rejected: resources?.filter(r => r.status === 'rejected').length || 0,
    totalDownloads: resources?.reduce((sum, r) => sum + (r.downloads || 0), 0) || 0,
    totalUpvotes: resources?.reduce((sum, r) => sum + (r.upvotes || 0), 0) || 0,
    totalDownvotes: resources?.reduce((sum, r) => sum + (r.downvotes || 0), 0) || 0
  };

  // Top resources by downloads
  const topDownloads = [...(resources || [])]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10);

  // Top resources by votes
  const topVotes = [...(resources || [])]
    .sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)))
    .slice(0, 10);

  // Resource types distribution
  const typeDistribution = resources?.reduce((acc, resource) => {
    const type = resource.file_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: stats,
    topDownloads,
    topVotes,
    typeDistribution,
    resources: resources?.slice(0, 50) // Last 50 resources
  };
}