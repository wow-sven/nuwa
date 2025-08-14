import { DIDAuth, initRoochVDR, VDRRegistry } from "@nuwa-ai/identity-kit";
import type { NextRequest } from "next/server";

export interface AuthResult {
	did: string;
	keyId: string;
}

const registry = VDRRegistry.getInstance();
// Ensure rooch VDR is registered (idempotent)
initRoochVDR("test", undefined, registry);

export async function authenticate(request: NextRequest): Promise<AuthResult> {
	try {
		const header = request.headers.get("authorization");

		const prefix = "DIDAuthV1 ";
		if (!header || !header.startsWith(prefix)) {
			throw new Response(undefined, {
				status: 401,
				statusText: "Missing DIDAuthV1 header",
			});
		}

		try {
			// verify the DIDAuth header
			// according to NIP-2 document, we need to provide a VDRRegistry instance
			const verify = await DIDAuth.v1.verifyAuthHeader(
				header,
				VDRRegistry.getInstance(),
			);

			if (!verify.ok) {
				const msg = (verify as { error: string }).error;
				console.error("authenticate error", msg);
				throw new Response(`Invalid DIDAuth: ${msg}`, { status: 403 });
			}

			const signerDid = verify.signedObject.signature.signer_did;
			const keyId = verify.signedObject.signature.key_id;

			return { did: signerDid, keyId };
		} catch (verifyError) {
			console.error("DID verification failed:", verifyError);
			throw new Response("Invalid DIDAuth signature", { status: 403 });
		}
	} catch (error) {
		console.error("authenticate error", error);
		if (error instanceof Response) {
			throw error;
		}
		throw new Response(undefined, {
			status: 401,
			statusText: "Unauthorized",
		});
	}
}
