import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf' | 'image';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  /**
   * Export data to various formats
   * @param data The data to export
   * @param format The format to export to
   * @param filename The name of the file (without extension)
   * @param options Additional options for export
   */
  exportData(
    data: any,
    format: ExportFormat,
    filename: string,
    options?: {
      sheetName?: string;
      imageQuality?: number;
      imageType?: 'png' | 'jpeg';
      pdfOptions?: any;
    }
  ): void {
    switch (format) {
      case 'csv':
        this.exportToCsv(data, filename);
        break;
      case 'excel':
        this.exportToExcel(data, filename, options?.sheetName || 'Sheet1');
        break;
      case 'json':
        this.exportToJson(data, filename);
        break;
      case 'pdf':
        this.exportToPdf(data, filename, options?.pdfOptions);
        break;
      case 'image':
        this.exportToImage(data, filename, options?.imageType || 'png', options?.imageQuality || 0.9);
        break;
      default:
        console.error('Unsupported export format');
    }
  }

  /**
   * Export chart as image
   * @param chartElement The chart element to export
   * @param filename The name of the file
   */
  exportChart(chartElement: HTMLElement, filename: string, format: 'png' | 'jpeg' = 'png'): void {
    this.exportElementAsImage(chartElement, filename, format);
  }

  /**
   * Export dashboard as PDF
   * @param dashboardElement The dashboard element to export
   * @param filename The name of the file
   */
  exportDashboard(dashboardElement: HTMLElement, filename: string): void {
    this.exportToPdf(dashboardElement, filename);
  }

  /**
   * Export data to CSV
   * @param data The data to export
   * @param filename The name of the file
   */
  private exportToCsv(data: any[], filename: string): void {
    if (!data || !data.length) {
      console.error('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(header => {
        // Handle values with commas by wrapping in quotes
        const value = item[header] !== undefined ? item[header] : '';
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
      csvContent += row + '\n';
    });
    
    // Create blob and save
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
  }

  /**
   * Export data to Excel
   * @param data The data to export
   * @param filename The name of the file
   * @param sheetName The name of the sheet
   */
  private exportToExcel(data: any[], filename: string, sheetName: string): void {
    if (!data || !data.length) {
      console.error('No data to export');
      return;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  }

  /**
   * Export data to JSON
   * @param data The data to export
   * @param filename The name of the file
   */
  private exportToJson(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
  }

  /**
   * Export data or element to PDF
   * @param data The data or element to export
   * @param filename The name of the file
   * @param options Additional PDF options
   */
  private exportToPdf(data: any, filename: string, options?: any): void {
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // For now, we'll just show a message
    console.log('PDF export would be implemented with a library like jsPDF');
    alert('PDF export functionality will be implemented with a proper PDF library');
  }

  /**
   * Export element as image
   * @param element The element to export
   * @param filename The name of the file
   * @param format The image format
   * @param quality The image quality
   */
  private exportToImage(element: HTMLElement, filename: string, format: 'png' | 'jpeg' = 'png', quality: number = 0.9): void {
    this.exportElementAsImage(element, filename, format, quality);
  }

  /**
   * Export HTML element as image using html2canvas
   * @param element The element to export
   * @param filename The name of the file
   * @param format The image format
   * @param quality The image quality
   */
  private exportElementAsImage(element: HTMLElement, filename: string, format: 'png' | 'jpeg' = 'png', quality: number = 0.9): void {
    // In a real implementation, you would use html2canvas
    // For now, we'll just show a message
    console.log('Image export would be implemented with html2canvas');
    alert('Image export functionality will be implemented with html2canvas library');
  }
}
