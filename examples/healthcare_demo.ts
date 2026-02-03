import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport,
    JMSMessageBuilder,
    ConsensusResult
} from '../jms-sdk/typescript/index';
import { MedicalDiagnosisTask } from './domain_types';

/**
 * Healthcare/Diagnosis Demo
 * Proves JMS universality with medical data.
 */

class DiagnosticAgent extends BaseAgentB<MedicalDiagnosisTask> {
    protected agentId: string;
    protected lambda: number;
    private specialty: string;

    constructor(transport: any, id: string, specialty: string, lambda: number) {
        super(transport);
        this.agentId = id;
        this.specialty = specialty;
        this.lambda = lambda;
    }

    protected async analyze(task: MedicalDiagnosisTask) {
        let score = 0.5;
        let rationale = '';

        if (this.specialty === 'Cardiology') {
            const highBP = parseInt(task.vital_signs.bp.split('/')[0]) > 140;
            score = highBP ? 0.9 : 0.3;
            rationale = `Cardiology view: BP is ${task.vital_signs.bp}. Risky? ${highBP}`;
        } else if (this.specialty === 'GeneralPractice') {
            score = task.vital_signs.temp > 38 ? 0.8 : 0.2;
            rationale = `GP view: Temp is ${task.vital_signs.temp}. Fever? ${task.vital_signs.temp > 38}`;
        }

        return {
            result: { score, rationale, metrics: { specialty: this.specialty } },
            evolution: [
                { timestamp: Date.now(), score, λ: 1.0, rationale: 'Clinical observation' }
            ]
        };
    }
}

async function runHealthcareDemo() {
    console.log("==============================================================");
    console.log("🏥 JMS HEALTHCARE DIAGNOSIS DEMO");
    console.log("==============================================================");

    const transport = new MockTransport();

    // Config C with medical weights
    const agentC = new AgentC(transport, {
        weights: { 'analysis': 1.0 },
        threshold: 0.75 // Safer for medical
    });

    const agentA = new AgentA(transport);
    const cardio = new DiagnosticAgent(transport, 'Dr_Cardio', 'Cardiology', 1.2);
    const gp = new DiagnosticAgent(transport, 'Dr_GP', 'GeneralPractice', 0.9);

    cardio.listen();
    gp.listen();
    agentC.listen();

    const patientData: MedicalDiagnosisTask = {
        patient_id: "PAT-777",
        symptoms: ["Chest pain", "Shortness of breath"],
        vital_signs: { bp: "150/95", temp: 37.2, heart_rate: 88 },
        imaging_available: true
    };

    console.log("🚀 Consulting specialists for Patient PAT-777...");

    await agentA.runProcess(
        patientData,
        ['Dr_Cardio', 'Dr_GP'],
        'AgentC',
        'Healthcare::Diagnosis',
        'jms.health.diagnosis.v1'
    );

    await new Promise(resolve => setTimeout(resolve, 2000));
}

runHealthcareDemo().catch(console.error);
