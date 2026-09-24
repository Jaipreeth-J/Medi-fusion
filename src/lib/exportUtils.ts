/**
 * HEALTH DATA EXPORT UTILITIES
 * Functions for exporting health records to CSV and PDF formats
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { MEDICAL_DISCLAIMER, SHORT_DISCLAIMER } from './constants';

type Vital = Tables<'vitals'>;
type Symptom = Tables<'symptoms'>;
type MoodEntry = Tables<'mood_entries'>;
type Profile = Tables<'profiles'>;

// CSV Export Utilities
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle arrays, nulls, and special characters
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return `"${value.join('; ')}"`;
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportVitalsToCSV(vitals: Vital[]): void {
  const data = vitals.map(v => ({
    Date: format(new Date(v.recorded_at), 'yyyy-MM-dd HH:mm'),
    'Heart Rate (bpm)': v.heart_rate ?? '',
    'Systolic BP (mmHg)': v.blood_pressure_systolic ?? '',
    'Diastolic BP (mmHg)': v.blood_pressure_diastolic ?? '',
    'Blood Sugar (mg/dL)': v.blood_sugar ?? '',
    'SpO2 (%)': v.spo2 ?? '',
    'Weight (kg)': v.weight_kg ?? '',
    'Temperature (°C)': v.temperature_celsius ?? '',
    'Sleep (hours)': v.sleep_hours ?? '',
    'Activity (min)': v.activity_minutes ?? '',
    Notes: v.notes ?? '',
    'Device Name': v.device_name ?? '',
    'Device Type': v.device_type ?? '',
    'Source App': v.source_app ?? '',
    'Health Platform': v.health_platform ?? '',
  }));
  exportToCSV(data, `vitals-export-${format(new Date(), 'yyyy-MM-dd')}`);
}

export function exportSymptomsToCSV(symptoms: Symptom[]): void {
  const data = symptoms.map(s => ({
    'Symptom Name': s.symptom_name,
    Severity: s.severity,
    'Body Location': s.body_location ?? '',
    Frequency: s.frequency ?? '',
    'Duration (hours)': s.duration_hours ?? '',
    Description: s.description ?? '',
    'Started At': format(new Date(s.started_at), 'yyyy-MM-dd HH:mm'),
    'Resolved At': s.resolved_at ? format(new Date(s.resolved_at), 'yyyy-MM-dd HH:mm') : 'Active'
  }));
  exportToCSV(data, `symptoms-export-${format(new Date(), 'yyyy-MM-dd')}`);
}

export function exportMoodToCSV(entries: MoodEntry[]): void {
  const data = entries.map(m => ({
    Date: format(new Date(m.recorded_at), 'yyyy-MM-dd HH:mm'),
    'Mood Score (1-10)': m.mood_score,
    'Stress Level': m.stress_level ?? '',
    'Anxiety Level': m.anxiety_level ?? '',
    'Energy Level': m.energy_level ?? '',
    'Sleep Quality': m.sleep_quality ?? '',
    Activities: m.activities?.join('; ') ?? '',
    Triggers: m.triggers?.join('; ') ?? '',
    'Journal Entry': m.journal_entry ?? '',
    'Gratitude Notes': m.gratitude_notes?.join('; ') ?? ''
  }));
  exportToCSV(data, `mood-export-${format(new Date(), 'yyyy-MM-dd')}`);
}

// PDF Export Utilities
interface HealthReportData {
  profile?: Profile | null;
  vitals?: Vital[];
  symptoms?: Symptom[];
  moodEntries?: MoodEntry[];
}

export function exportHealthReportPDF(data: HealthReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper function to add page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtitle with date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Profile Section
  if (data.profile) {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const profileInfo = [
      ['Name', data.profile.full_name || 'Not provided'],
      ['Date of Birth', data.profile.date_of_birth || 'Not provided'],
      ['Gender', data.profile.gender || 'Not provided'],
      ['Blood Type', data.profile.blood_type || 'Not provided'],
      ['Height', data.profile.height_cm ? `${data.profile.height_cm} cm` : 'Not provided'],
      ['Weight', data.profile.weight_kg ? `${data.profile.weight_kg} kg` : 'Not provided'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: profileInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
    });
    
    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

    // Medical History
    if (data.profile.medical_conditions?.length || data.profile.allergies?.length || data.profile.medications?.length) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical History', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (data.profile.medical_conditions?.length) {
        doc.text(`Conditions: ${data.profile.medical_conditions.join(', ')}`, 14, yPos);
        yPos += 5;
      }
      if (data.profile.allergies?.length) {
        doc.text(`Allergies: ${data.profile.allergies.join(', ')}`, 14, yPos);
        yPos += 5;
      }
      if (data.profile.medications?.length) {
        doc.text(`Medications: ${data.profile.medications.join(', ')}`, 14, yPos);
        yPos += 5;
      }
      yPos += 5;
    }

    // Emergency Contact
    if (data.profile.emergency_contact_name || data.profile.emergency_contact_phone) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Emergency Contact', 14, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.profile.emergency_contact_name || 'N/A'} - ${data.profile.emergency_contact_phone || 'N/A'}`, 14, yPos);
      yPos += 10;
    }
  }

  // Vitals Section
  if (data.vitals?.length) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vital Signs History', 14, yPos);
    yPos += 8;

    const vitalsData = data.vitals.slice(0, 20).map(v => [
      format(new Date(v.recorded_at), 'MM/dd/yy'),
      v.heart_rate?.toString() ?? '-',
      v.blood_pressure_systolic && v.blood_pressure_diastolic 
        ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` 
        : '-',
      v.spo2?.toString() ?? '-',
      v.blood_sugar?.toString() ?? '-',
      v.temperature_celsius?.toString() ?? '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'HR (bpm)', 'BP (mmHg)', 'SpO2 (%)', 'Sugar (mg/dL)', 'Temp (°C)']],
      body: vitalsData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Symptoms Section
  if (data.symptoms?.length) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms History', 14, yPos);
    yPos += 8;

    const symptomsData = data.symptoms.slice(0, 15).map(s => [
      s.symptom_name,
      s.severity.toString(),
      s.body_location ?? '-',
      format(new Date(s.started_at), 'MM/dd/yy'),
      s.resolved_at ? format(new Date(s.resolved_at), 'MM/dd/yy') : 'Active'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Symptom', 'Severity', 'Location', 'Started', 'Resolved']],
      body: symptomsData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11] },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Mood Section
  if (data.moodEntries?.length) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mental Health Log', 14, yPos);
    yPos += 8;

    const moodData = data.moodEntries.slice(0, 15).map(m => [
      format(new Date(m.recorded_at), 'MM/dd/yy'),
      m.mood_score.toString(),
      m.stress_level?.toString() ?? '-',
      m.anxiety_level?.toString() ?? '-',
      m.energy_level?.toString() ?? '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Mood', 'Stress', 'Anxiety', 'Energy']],
      body: moodData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Disclaimer
  checkPageBreak(30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  
  const disclaimerLines = doc.splitTextToSize(SHORT_DISCLAIMER, pageWidth - 28);
  doc.text(disclaimerLines, 14, yPos);

  // Save
  doc.save(`health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Helper function
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
