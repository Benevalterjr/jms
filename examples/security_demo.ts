import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport,
    JMSMessageBuilder,
    JMSValidator,
    SecurityUtils
} from '../jms-sdk/typescript/index';
import { CreditApplication } from './domain_types';

/**
 * Security & Hardening Demo
 * Tests hash integrity and schema validation.
 */

// 1. Define and Register a Schema
const CREDIT_SCHEMA = {
    type: "object",
    properties: {
        applicant_id: { type: "string" },
        credit_score: { type: "number", minimum: 300, maximum: 850 },
        annual_income: { type: "number", minimum: 0 }
    },
    required: ["applicant_id", "credit_score", "annual_income"]
};

JMSValidator.registerSchema('jms.finance.credit.v1', CREDIT_SCHEMA);

class SimpleAnalyst extends BaseAgentB<CreditApplication> {
    protected agentId: string;
    protected lambda: number = 1.0;
    constructor(transport: any, id: string) {
        super(transport);
        this.agentId = id;
    }
    protected async analyze(data: any) {
        return {
            result: { score: 0.8, rationale: 'Looks good' },
            evolution: []
        };
    }
}

async function runSecurityDemo() {
    console.log("==============================================================");
    console.log("🔒 JMS SECURITY & HARDENING DEMO");
    console.log("==============================================================");

    const transport = new MockTransport();
    const analyst = new SimpleAnalyst(transport, 'Analyst_Alpha');
    analyst.listen();

    const validData: CreditApplication = {
        applicant_id: "VALID-001",
        credit_score: 750,
        annual_income: 100000,
        loan_amount: 10000,
        monthly_debt: 1000,
        monthly_income: 8000
    };

    console.log("\n--- TEST 1: Hash Tampering ---");
    const msg1 = JMSMessageBuilder.createRequest('External_Source', 'Finance', 'analysis', validData, 'jms.finance.credit.v1');

    // Maliciously tamper with the data WITHOUT updating the hash
    msg1.data.annual_income = 999999999;
    console.log("🚀 Sending message with tampered data (Hash is now invalid)...");
    await transport.send('Analyst_Alpha', msg1);

    console.log("\n--- TEST 2: Schema Violation ---");
    const invalidData = {
        applicant_id: "INVALID-850",
        credit_score: 1200, // ILLEGAL: Max is 850
        annual_income: "MILLIONAIRE" // ILLEGAL: Type should be number
    };
    const msg2 = JMSMessageBuilder.createRequest('External_Source', 'Finance', 'analysis', invalidData, 'jms.finance.credit.v1');
    console.log("🚀 Sending message with invalid schema data...");
    await transport.send('Analyst_Alpha', msg2);

    console.log("\n--- TEST 3: Valid Request ---");
    const msg3 = JMSMessageBuilder.createRequest('External_Source', 'Finance', 'analysis', validData, 'jms.finance.credit.v1');
    console.log("🚀 Sending valid message...");
    await transport.send('Analyst_Alpha', msg3);

    // Give it a moment to process and show logs
    await new Promise(resolve => setTimeout(resolve, 1000));
}

runSecurityDemo().catch(console.error);
