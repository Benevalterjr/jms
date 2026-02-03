import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * JMS Schema Validator
 * Enforces technical and semantic contracts using AJV
 */
export class JMSValidator {
    private static ajv = new Ajv({ allErrors: true });
    static {
        addFormats(this.ajv);
    }

    /**
     * Register a new schema
     */
    static registerSchema(id: string, schema: object) {
        if (!this.ajv.getSchema(id)) {
            this.ajv.addSchema(schema, id);
            console.log(`📜 [Validator] Schema registered: ${id}`);
        }
    }

    /**
     * Validate data against a registered schema
     */
    static validate(schemaId: string, data: any): { valid: boolean; errors?: string[] } {
        const validate = this.ajv.getSchema(schemaId);

        if (!validate) {
            console.warn(`📜 [Validator] Skipping validation: Schema ${schemaId} not registered.`);
            return { valid: true }; // Lenient for now, but logs warning
        }

        const valid = validate(data);

        if (!valid) {
            return {
                valid: false,
                errors: validate.errors?.map((e: any) => `${e.instancePath} ${e.message}`) || ['Unknown error']
            };
        }

        return { valid: true };
    }
}
