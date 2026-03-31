// utils/csvExporter.ts
import { format } from 'date-fns';

type LegacyNavigator = Navigator & {
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
};
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert data to CSV
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle commas, quotes, and newlines in values
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Create and download file
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const legacyNavigator = navigator as LegacyNavigator;

  if (legacyNavigator.msSaveBlob) {
    // IE 10+
    legacyNavigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportMessagesCSV(messages: any[]) {
  const simplified = messages.map(msg => ({
    Timestamp: new Date(msg.created_at).toLocaleString(),
    Room: msg.room_id,
    User: msg.user_name,
    Message: msg.message,
    Edited: msg.is_edited ? 'Yes' : 'No',
    Deleted: msg.is_deleted ? 'Yes' : 'No'
  }));
  
  exportToCSV(simplified, `chat-messages-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

export function exportResourcesCSV(resources: any[]) {
  const simplified = resources.map(res => ({
    Title: res.title,
    Author: res.author,
    Institution: res.institution,
    Type: res.file_type,
    Status: res.status,
    Downloads: res.downloads || 0,
    Upvotes: res.upvotes || 0,
    Downvotes: res.downvotes || 0,
    Created: new Date(res.created_at).toLocaleDateString(),
    Tags: Array.isArray(res.tags) ? res.tags.join('; ') : res.tags
  }));
  
  exportToCSV(simplified, `resources-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}
