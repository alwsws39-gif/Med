export interface QuestionResponse {
  isLast: false;
  question: string;
  options: string[];
  allowCustomInput: boolean;
}

export interface ClinicInfo {
  clinicName: string;
  doctorName: string;
  clinicFeatures: string[];
  clinicPath: string;
}

export interface PatientGuidance {
  whileWaiting: string[];
  thingsToAvoid: string[];
}

export interface FinalRecommendationResponse {
  isLast: true;
  recommendedTiming: string;
  clinicInfo: ClinicInfo;
  patientGuidance: PatientGuidance;
  disclaimer: string;
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
  createdAt: string;
}
