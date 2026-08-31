export type TriageLevel = "LEVEL_1_EMERGENCY" | "LEVEL_2_URGENT" | "LEVEL_3_ROUTINE";

export interface QuestionResponse {
  isLast: false;
  question: string;
  options: string[];
  allowCustomInput: boolean;
  clinicalRationale?: string;
}

export interface PreConsultationDirectives {
  dos: string[]; // 2-3 safe actions to take while waiting
  donts: string[]; // 2-3 actions/medications to avoid while waiting
}

export interface PrintableClinicalSummary {
  chiefComplaintSummary: string;
  hpiTimeline: string; // History of Present Illness timeline
  reportedSymptoms: string[];
  pertinentNegativesOrRiskFactors: string[];
  provisionalTriageCategory: string; // Level 1 / Level 2 / Level 3
  suggestedSpecialty: string;
  clinicalNotesForPhysician: string; // Technical medical summary for attending doctor
  generatedAt: string;
}

export interface TargetSpecialtyInfo {
  specialtyName: string; // Target Medical Clinic / Specialty
  departmentType: string; // ER, Urgent Care PHC, Specialty Clinic
  saudiHealthcareRouting: string; // 997, 937, Sehhaty
  clinicalFocus: string;
}

export interface RegulatoryCompliance {
  sdaiaPdplNotice: string;
  sfdaSamdNotice: string;
  mohFramework: string;
}

export interface FinalRecommendationResponse {
  isLast: true;
  triageLevel: TriageLevel;
  triageLevelLabel: string;
  appointmentTimeline: string; // Component 1: Recommended Appointment Timeline
  targetSpecialty: TargetSpecialtyInfo; // Component 2: Target Medical Clinic/Specialty
  safetyDirectives: PreConsultationDirectives; // Component 3: Pre-Consultation Safety Directives (DO & DON'T)
  clinicalSummary: PrintableClinicalSummary; // Component 4: Printable Clinical Summary
  regulatoryCompliance: RegulatoryCompliance;
}

export type TriageResponse = QuestionResponse | FinalRecommendationResponse;

export interface QAPair {
  question: string;
  selectedOption: string;
  customDetails?: string;
}

export interface TriageSession {
  id: string;
  chiefComplaint: string;
  history: QAPair[];
  recommendation?: FinalRecommendationResponse;
  createdAt: string;
}
