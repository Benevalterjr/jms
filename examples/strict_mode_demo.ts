import {
    AgentC,
    BaseAgentB,
    MockTransport,
    JMSMessageBuilder,
} from '../jms-sdk/typescript/index';

/**
 * Strict Mode Demo
 * Tests explicit failure when a schema is not registered.
 */

class StrictAnalyst extends BaseAgentB {
    protected agentId: string = 'StrictAnalyst';
    protected lambda: number = 1.0;
    protected isStrict: boolean = true; // ENFORCE STRICT MODE

    protected async analyze(data: any) {
        return {
            result: { score: 1.0, rationale: 'Should not reach here if schema missing' },
            evolution: []
        };
    }
}

async function runStrictModeDemo() {
    console.log("==============================================================");
    console.log("🛡️ JMS STRICT MODE DEMO");
    console.log("==============================================================");

    const transport = new MockTransport();
    const analyst = new StrictAnalyst(transport);
    analyst.listen();

    console.log("\n--- TEST: Unregistered Schema in Strict Mode ---");
    const msg = JMSMessageBuilder.createRequest(
        'External_Source',
        'UnknownDomain',
        'analysis',
        { some: "data" },
        'jms.unknown.schema.v1'
    );

    console.log("🚀 Sending request with unregistered schema...");
    await transport.send('StrictAnalyst', msg);

    // Give it a moment to process
    await new Promise(resolve => setTimeout(resolve, 500));
}

runStrictModeDemo().catch(console.error);
