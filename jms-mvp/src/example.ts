import { CreditApplication } from './types/jms';
import { AgentA } from './agents/AgentA';
import { AgentB1 } from './agents/AgentB1';
import { AgentB2 } from './agents/AgentB2';
import { AgentB3 } from './agents/AgentB3';
import { AgentC } from './agents/AgentC';

/**
 * JMS MVP - Credit Approval System
 * Demonstrates JMS v1.0 protocol in action
 */

async function runCreditApproval(application: CreditApplication) {
    console.log(`\n${'█'.repeat(60)}`);
    console.log(`  JMS v1.0 MVP - Credit Approval System`);
    console.log(`${'█'.repeat(60)}`);

    // Initialize agents
    const agentA = new AgentA();
    const agentB1 = new AgentB1();
    const agentB2 = new AgentB2();
    const agentB3 = new AgentB3();
    const agentC = new AgentC();

    // Step 1: AgentA initiates the process
    const { ref } = await agentA.initiate(application);

    // Step 2: AgentB instances analyze independently
    const analysisB1 = await agentB1.analyze(ref, application);
    const analysisB2 = await agentB2.analyze(ref, application);
    const analysisB3 = await agentB3.analyze(ref, application);

    // Step 3: AgentA collects responses
    const analyses = await agentA.collect([analysisB1, analysisB2, analysisB3]);

    // Step 4: AgentC generates consensus
    const consensus = await agentC.generateConsensus(ref, analyses);

    return consensus;
}

/**
 * Test Scenarios
 */

async function main() {
    // Scenario 1: Strong Applicant (Expected: APPROVE)
    console.log('\n\n' + '▼'.repeat(60));
    console.log('SCENARIO 1: Strong Applicant');
    console.log('▼'.repeat(60));

    await runCreditApproval({
        applicant_id: 'APP-001',
        credit_score: 780,
        annual_income: 120000,
        loan_amount: 30000,
        monthly_debt: 2000,
        monthly_income: 10000
    });

    // Scenario 2: Weak Applicant (Expected: DENY)
    console.log('\n\n' + '▼'.repeat(60));
    console.log('SCENARIO 2: Weak Applicant');
    console.log('▼'.repeat(60));

    await runCreditApproval({
        applicant_id: 'APP-002',
        credit_score: 520,
        annual_income: 35000,
        loan_amount: 40000,
        monthly_debt: 2500,
        monthly_income: 2900
    });

    // Scenario 3: Borderline Applicant (Expected: MANUAL_REVIEW)
    console.log('\n\n' + '▼'.repeat(60));
    console.log('SCENARIO 3: Borderline Applicant');
    console.log('▼'.repeat(60));

    await runCreditApproval({
        applicant_id: 'APP-003',
        credit_score: 680,
        annual_income: 65000,
        loan_amount: 35000,
        monthly_debt: 1800,
        monthly_income: 5400
    });

    // Scenario 4: Mixed Signals (Expected: MANUAL_REVIEW)
    console.log('\n\n' + '▼'.repeat(60));
    console.log('SCENARIO 4: Mixed Signals');
    console.log('▼'.repeat(60));

    await runCreditApproval({
        applicant_id: 'APP-004',
        credit_score: 800,  // Excellent
        annual_income: 50000,
        loan_amount: 45000,  // Low income ratio
        monthly_debt: 2800,  // High DTI
        monthly_income: 4200
    });

    console.log('\n\n' + '█'.repeat(60));
    console.log('  All scenarios completed!');
    console.log('█'.repeat(60) + '\n');
}

// Run the examples
main().catch(console.error);
