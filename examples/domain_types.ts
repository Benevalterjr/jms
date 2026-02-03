/**
 * Domain-specific types for JMS Demos
 */

export interface CreditApplication {
    applicant_id: string;
    credit_score: number;
    annual_income: number;
    loan_amount: number;
    monthly_debt: number;
    monthly_income: number;
}

export interface MedicalDiagnosisTask {
    patient_id: string;
    symptoms: string[];
    vital_signs: {
        bp: string;
        temp: number;
        heart_rate: number;
    };
    imaging_available: boolean;
}

export interface PrimeTask {
    number: number;
}
