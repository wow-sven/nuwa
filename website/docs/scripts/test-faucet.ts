#!/usr/bin/env tsx

const FAUCET_URL = "https://test-faucet.rooch.network";

/**
 * Test faucet functionality
 */
async function testFaucet() {
	console.log("🧪 Testing faucet functionality...");

	// Test address (this is just for testing, not a real claim)
	const testAddress = "rooch1nadavhgvuakjm3ekv8m6t69k494w7q4pkvpdq4szu20xtaphu20q5jr3k5";

	try {
		console.log(`📡 Sending request to ${FAUCET_URL}/faucet`);
		console.log(`📍 Test address: ${testAddress}`);

		const response = await fetch(`${FAUCET_URL}/faucet`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ claimer: testAddress }),
		});

		console.log(`📊 Response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.log(`❌ Error response: ${errorText}`);
			throw new Error(`Faucet request failed with status ${response.status}`);
		}

		const data = await response.json();
		console.log(`✅ Faucet response:`, data);

		if (data.gas) {
			const rgasAmount = Math.floor(data.gas / 100000000);
			console.log(`💰 Claimed amount: ${rgasAmount} RGAS`);
		}

		console.log("🎉 Faucet test completed successfully!");
	} catch (error) {
		console.error("❌ Faucet test failed:", error);
		process.exit(1);
	}
}

// Run the test
testFaucet(); 