/**
 * MEDIFUSION CONSTANTS
 * Central configuration for the health assistant
 */

// Medical Safety Disclaimer - REQUIRED for all AI responses
export const MEDICAL_DISCLAIMER = `I am an AI health assistant, not a medical professional. 
The information I provide is for educational purposes only and should not be considered medical advice, diagnosis, or treatment. 
Always consult with qualified healthcare providers for medical concerns.`;

export const SHORT_DISCLAIMER = "I am not a medical professional. Always consult a doctor for medical advice.";

// Emergency Detection Keywords
export const EMERGENCY_KEYWORDS = [
  // Physical emergencies
  "chest pain",
  "heart attack",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "stroke",
  "severe bleeding",
  "unconscious",
  "seizure",
  "choking",
  "anaphylaxis",
  "allergic reaction",
  "overdose",
  "poisoning",
  "severe burn",
  "broken bone",
  "head injury",
  // Mental health emergencies
  "suicidal",
  "suicide",
  "want to die",
  "kill myself",
  "end my life",
  "self harm",
  "self-harm",
  "cutting myself",
  "hurting myself",
  // Child emergencies
  "baby not breathing",
  "child choking",
  "infant emergency",
];

// Emergency Response Template
export const EMERGENCY_RESPONSE = `🚨 **EMERGENCY DETECTED**

**I'm concerned about what you've shared. Your safety is the priority.**

**If you are in immediate danger, please:**
1. **Call emergency services immediately**: 911 (US) or your local emergency number
2. **Go to your nearest emergency room**
3. **Contact a trusted person** who can be with you

**Crisis Resources:**
- 🆘 **Emergency**: 911
- 💙 **National Suicide Prevention Lifeline**: 988 (US)
- 💚 **Crisis Text Line**: Text HOME to 741741
- 🌍 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

**I am an AI and cannot provide emergency medical care.** Please reach out to real humans who can help you right now.

**You matter, and help is available.**`;

// Symptom Categories
export const SYMPTOM_CATEGORIES = [
  { id: "head", label: "Head & Face", icon: "Brain" },
  { id: "chest", label: "Chest & Heart", icon: "Heart" },
  { id: "abdomen", label: "Abdomen & Digestive", icon: "Utensils" },
  { id: "respiratory", label: "Respiratory", icon: "Wind" },
  { id: "musculoskeletal", label: "Muscles & Joints", icon: "Bone" },
  { id: "skin", label: "Skin & Hair", icon: "Sparkles" },
  { id: "neurological", label: "Neurological", icon: "Zap" },
  { id: "mental", label: "Mental & Emotional", icon: "HeartPulse" },
  { id: "other", label: "Other", icon: "MoreHorizontal" },
];

// Common Symptoms List
export const COMMON_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Fever",
  "Cough",
  "Sore throat",
  "Runny nose",
  "Nausea",
  "Stomach pain",
  "Back pain",
  "Joint pain",
  "Muscle ache",
  "Dizziness",
  "Shortness of breath",
  "Chest discomfort",
  "Skin rash",
  "Insomnia",
  "Anxiety",
  "Low mood",
];

// Mood Options for Mental Health Tracking
export const MOOD_OPTIONS = [
  { value: 1, label: "Very Low", emoji: "😢", color: "destructive" },
  { value: 2, label: "Low", emoji: "😔", color: "destructive" },
  { value: 3, label: "Somewhat Low", emoji: "😕", color: "warning" },
  { value: 4, label: "Slightly Low", emoji: "😐", color: "warning" },
  { value: 5, label: "Neutral", emoji: "😑", color: "muted" },
  { value: 6, label: "Slightly Good", emoji: "🙂", color: "info" },
  { value: 7, label: "Good", emoji: "😊", color: "info" },
  { value: 8, label: "Very Good", emoji: "😄", color: "success" },
  { value: 9, label: "Great", emoji: "😁", color: "success" },
  { value: 10, label: "Excellent", emoji: "🤩", color: "success" },
];

// Vital Signs Reference Ranges (for educational display only)
export const VITAL_RANGES = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
    normal: { min: 60, max: 100 },
    warning: { min: 50, max: 110 },
  },
  bloodPressureSystolic: {
    label: "Systolic BP",
    unit: "mmHg",
    normal: { min: 90, max: 120 },
    warning: { min: 80, max: 140 },
  },
  bloodPressureDiastolic: {
    label: "Diastolic BP",
    unit: "mmHg",
    normal: { min: 60, max: 80 },
    warning: { min: 50, max: 90 },
  },
  bloodSugar: {
    label: "Blood Sugar (Fasting)",
    unit: "mg/dL",
    normal: { min: 70, max: 100 },
    warning: { min: 60, max: 125 },
  },
  spo2: {
    label: "Oxygen Saturation",
    unit: "%",
    normal: { min: 95, max: 100 },
    warning: { min: 90, max: 100 },
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    normal: { min: 36.1, max: 37.2 },
    warning: { min: 35.5, max: 38.0 },
  },
};

// Navigation Items
export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/chat", label: "Chat", icon: "MessageCircle" },
  { path: "/vitals", label: "Vitals", icon: "Activity" },
  { path: "/symptoms", label: "Symptoms", icon: "Stethoscope" },
  { path: "/mental-health", label: "Mental Health", icon: "Brain" },
  { path: "/medications", label: "Medications", icon: "Pill" },
  { path: "/images", label: "Medical Images", icon: "Image" },
  { path: "/history", label: "Assessment History", icon: "History" },
  { path: "/profile", label: "Profile", icon: "User" },
];

// Image Types for Medical Image Upload
export const IMAGE_TYPES = [
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI Scan" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "lab_report", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "skin_condition", label: "Skin Condition / Rash" },
  { value: "injury", label: "Injury / Wound" },
  { value: "dental", label: "Dental Image" },
  { value: "eye", label: "Eye / Ophthalmology" },
  { value: "pathology", label: "Pathology Slide" },
  { value: "other", label: "Other" },
];

// Body Parts for Image Categorization
export const BODY_PARTS = [
  "Head",
  "Neck",
  "Chest",
  "Abdomen",
  "Back",
  "Arm",
  "Hand",
  "Leg",
  "Foot",
  "Spine",
  "Hip",
  "Knee",
  "Shoulder",
  "Full Body",
  "Other",
];
