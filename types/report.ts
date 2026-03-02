// types/reports.ts
export interface ReportFilters {
  startDate: string;
  endDate: string;
  roomId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  exportFormat?: 'pdf' | 'csv' | 'json';
}

export interface UserReport {
  userId: string;
  username: string;
  joinDate: string;
  lastActive: string;
  totalMessages: number;
  activeRooms: string[];
  resourcesUploaded: number;
  avgSessionDuration: number;
}

export interface ChatRoomReport {
  roomId: string;
  roomName: string;
  totalMessages: number;
  uniqueUsers: number;
  avgMessagesPerUser: number;
  peakHours: string[];
  topContributors: Array<{
    username: string;
    messageCount: number;
  }>;
}

export interface ResourceReport {
  resourceId: string;
  title: string;
  author: string;
  uploadDate: string;
  fileType: string;
  downloads: number;
  upvotes: number;
  downvotes: number;
  status: string;
  tags: string[];
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers24h: number;
  totalMessages: number;
  messages24h: number;
  totalResources: number;
  resources24h: number;
  avgSessionDuration: number;
  peakConcurrentUsers: number;
}

export interface DailyStats {
  date: string;
  newUsers: number;
  activeUsers: number;
  messages: number;
  resources: number;
  downloads: number;
}