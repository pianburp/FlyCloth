/**
 * Utility functions for exporting data to CSV
 */

export interface CSVColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
}

/**
 * Generate CSV content from an array of data
 */
export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  // Header row
  const headers = columns.map(col => escapeCSVValue(col.header)).join(',');
  
  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = typeof col.accessor === 'function' 
        ? col.accessor(item) 
        : item[col.accessor];
      return escapeCSVValue(String(value ?? ''));
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger browser download of a CSV file
 */
export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
