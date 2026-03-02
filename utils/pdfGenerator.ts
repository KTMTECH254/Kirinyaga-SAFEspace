// utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ReportData } from '@/types/reports';

export async function generatePDFReport(data: ReportData, title: string = 'Platform Report') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text(title, margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 40);
  
  let yPos = 50;
  
  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Platform Summary', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  
  // User Stats Table
  (doc as any).autoTable({
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Users', data.userStats.totalUsers.toString()],
      ['Active Users', data.userStats.activeUsers.toString()],
      ['New Users', data.userStats.newUsers.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Chat Stats
  doc.setFontSize(16);
  doc.text('Chat Activity', margin, yPos);
  yPos += 10;
  
  (doc as any).autoTable({
    startY: yPos,
    head: [['Chat Room', 'Messages', 'Active Users']],
    body: data.chatStats.rooms?.map(room => [
      room.name,
      room.messageCount.toString(),
      room.activeUsers.toString()
    ]) || [],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: margin, right: margin }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Resource Stats
  doc.setFontSize(16);
  doc.text('Resource Usage', margin, yPos);
  yPos += 10;
  
  (doc as any).autoTable({
    startY: yPos,
    head: [['Resource', 'Downloads', 'Votes']],
    body: data.resourceStats.topResources?.map(resource => [
      resource.title.substring(0, 40) + (resource.title.length > 40 ? '...' : ''),
      resource.downloads.toString(),
      (resource.upvotes - resource.downvotes).toString()
    ]) || [],
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11] },
    margin: { left: margin, right: margin }
  });
  
  // Add page for detailed data if needed
  if (data.detailedData) {
    doc.addPage();
    yPos = margin;
    
    doc.setFontSize(16);
    doc.text('Detailed Activity Log', margin, yPos);
    yPos += 10;
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['Timestamp', 'User', 'Action', 'Details']],
      body: data.detailedData.slice(0, 50).map(activity => [
        new Date(activity.timestamp).toLocaleString(),
        activity.user.substring(0, 20),
        activity.action,
        activity.details.substring(0, 40) + '...'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: margin, right: margin },
      pageBreak: 'auto'
    });
  }
  
  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 30,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      'Kirinyaga Safespace - Confidential',
      margin,
      doc.internal.pageSize.height - 10
    );
  }
  
  return doc;
}