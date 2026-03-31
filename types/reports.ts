export * from './report';

export interface ReportData {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
  chatStats: {
    rooms?: Array<{
      name: string;
      messageCount: number;
      activeUsers: number;
    }>;
  };
  resourceStats: {
    topResources?: Array<{
      title: string;
      downloads: number;
      upvotes: number;
      downvotes: number;
    }>;
  };
  detailedData?: Array<{
    timestamp: string;
    user: string;
    action: string;
    details: string;
  }>;
}
