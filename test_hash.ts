import * as crypto from 'crypto';

function calculateHash(message: any): string {
    const canonical = JSON.stringify(message, Object.keys(message).sort());
    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    return `sha256:${hash}`;
}

const msg = {
    ref: "123",
    agent: "A",
    data: { a: 1, b: 2 }
};

const hash1 = calculateHash(msg);
console.log("Hash 1:", hash1);

msg.data.a = 999;
const hash2 = calculateHash(msg);
console.log("Hash 2:", hash2);

if (hash1 === hash2) {
    console.error("FAIL: Hashes are equal despite data change!");
} else {
    console.log("SUCCESS: Hashes are different.");
}
