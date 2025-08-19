import { KeyManager } from "@nuwa-ai/identity-kit";
import {
	PaymentHubClient,
	RoochPaymentChannelContract,
} from "@nuwa-ai/payment-kit";
import {
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { NextResponse } from "next/server";
import { commands } from "./commands";
import { verifyInteractionRequest } from "./verify-discord-request";

const DISCORD_APP_PUBLIC_KEY = process.env.DISCORD_APP_PUBLIC_KEY;
const FAUCET_URL =
	process.env.FAUCET_URL || "https://test-faucet.rooch.network";
const ROOCH_RPC_URL =
	process.env.ROOCH_RPC_URL || "https://test-seed.rooch.network";
const DEFAULT_ASSET_ID = "0x3::gas_coin::RGas";
// Hub account configuration
const HUB_PRIVATE_KEY = process.env.HUB_PRIVATE_KEY;
const HUB_DID = process.env.HUB_DID;

const hubAddress = HUB_DID.split(":")[2];
/**
 * Claim RGAS from Rooch testnet faucet
 * @param agentAddress hex address of agent (without 0x prefix is acceptable)
 * @returns amount claimed (raw unit)
 */
async function claimTestnetGas(agentAddress: string): Promise<number> {
	const resp = await fetch(`${FAUCET_URL}/faucet`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ claimer: agentAddress }),
	});

	if (!resp.ok) {
		const data = await resp.json().catch(() => ({}));
		throw new Error(data.error || `Claim failed with status ${resp.status}`);
	}
	const data = await resp.json();
	return data.gas || 5_000_000_000; // default fallback
}

/**
 * Transfer RGAS from hub account to user's DID using PaymentHubClient
 * @param userDid User's DID
 * @param amount Amount to transfer (in raw units)
 * @returns Transaction hash or null if transfer failed
 */
async function transferFromHub(
	userDid: string,
	amount: number,
): Promise<string | null> {
	try {
		if (!HUB_PRIVATE_KEY) {
			console.log("HUB_PRIVATE_KEY not configured, skipping transfer");
			return null;
		}

		console.log(
			`Transferring ${amount} RGAS from hub ${HUB_DID} to user ${userDid}`,
		);

		const keyManager = new KeyManager({ did: HUB_DID });
		await keyManager.importKeyFromString(HUB_PRIVATE_KEY);

		const hubSigner = keyManager;

		// Create contract and PaymentHubClient
		const contract = new RoochPaymentChannelContract({ rpcUrl: ROOCH_RPC_URL });
		const hubClient = new PaymentHubClient({
			contract,
			signer: hubSigner,
			defaultAssetId: DEFAULT_ASSET_ID,
		});

		const result = await hubClient.deposit(
			DEFAULT_ASSET_ID,
			BigInt(amount),
			userDid,
		);

		console.log("Transfer successful:", result.txHash);
		return result.txHash;
	} catch (error) {
		console.error("Transfer from hub failed:", error);
		return null;
	}
}

/**
 * @see https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
 */
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Handle Discord interactions. Discord will send interactions to this endpoint.
 *
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction
 */
export async function POST(request: Request) {
	console.log("Discord interaction received");
	console.log("Environment check:", {
		hasDiscordKey: !!DISCORD_APP_PUBLIC_KEY,
		hasHubKey: !!HUB_PRIVATE_KEY,
		hasHubDid: !!HUB_DID,
		hubAddress: hubAddress,
		runtime: "nodejs",
		maxDuration: 60
	});
	
	const verifyResult = await verifyInteractionRequest(
		request,
		DISCORD_APP_PUBLIC_KEY,
	);
	if (!verifyResult.isValid || !verifyResult.interaction) {
		return new NextResponse("Invalid request", { status: 401 });
	}
	const { interaction } = verifyResult;

	if (interaction.type === InteractionType.Ping) {
		// The `PING` message is used during the initial webhook handshake, and is
		// required to configure the webhook in the developer portal.
		return NextResponse.json({ type: InteractionResponseType.Pong });
	}

	if (interaction.type === InteractionType.ApplicationCommand) {
		const { name } = interaction.data;

		switch (name) {
			case commands.ping.name:
				return NextResponse.json({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: { content: `Pong` },
				});
			case commands.faucet.name: {
				// Type assertion
				const options = (interaction.data as any).options;
				if (options?.[0]?.value) {
					const did = options[0].value;

					try {
						// Extract address from DID (format: did:rooch:address)
						const userAddress = did.split(":")[2];
						if (!userAddress) {
							return NextResponse.json({
								type: InteractionResponseType.ChannelMessageWithSource,
								data: {
									content:
										"❌ Invalid DID format. Please provide a valid DID in format: did:rooch:address",
								},
							});
						}

						// Start async process (claim + transfer)
						console.log("Starting async process for:", did);
						processInteractionAsync(did, interaction).catch(error => {
							console.error("Async process failed:", error);
						}).then(() => {
							console.log("Async process completed for:", did);
						});

						// Return immediate response
						const responseMessage = `🎉 Processing the request for \`${did}\`...`;

						return NextResponse.json({
							type: InteractionResponseType.ChannelMessageWithSource,
							data: {
								content: responseMessage,
							},
						});
					} catch (error) {
						console.error("Faucet claim failed:", error);
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error occurred";

						return NextResponse.json({
							type: InteractionResponseType.ChannelMessageWithSource,
							data: {
								content: `❌ Failed to claim RGAS: ${errorMessage}\n\nPlease try again later or contact support if the issue persists.`,
							},
						});
					}
				}

				return NextResponse.json({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content:
							"❌ Please provide a DID value to claim RGAS.\n\nUsage: `/faucet did:rooch:your_address_here`",
					},
				});
			}

			default:
			// Pass through, return error at end of function
		}
	}

	return new NextResponse("Unknown command", { status: 400 });
}

/**
 * Handle GET requests (e.g., for webhook verification or health checks)
 */
export async function GET() {
	return NextResponse.json({ status: "Discord bot API is running" });
}

/**
 * Handle other HTTP methods gracefully
 */
export async function PUT() {
	return new NextResponse("Method not allowed", { status: 405 });
}

export async function DELETE() {
	return new NextResponse("Method not allowed", { status: 405 });
}

export async function PATCH() {
	return new NextResponse("Method not allowed", { status: 405 });
}

async function processInteractionAsync(userDid: string, interaction: any) {
	console.log("processInteractionAsync started for:", userDid);
	
	// 构建 webhook URL
	const applicationId = interaction.application_id;
	const interactionToken = interaction.token;
	const webhookUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
	
	console.log("Webhook URL constructed:", webhookUrl);

	try {
		console.log("Starting claim process...");
		// 1. Claim gas from faucet to hub address
		const claimedAmount = await claimTestnetGas(hubAddress);
		console.log("Claim successful, amount:", claimedAmount);
		const rgasAmount = Math.floor(claimedAmount / 100000000);

		// 2. Calculate transfer amount (50% of claimed)
		const transferAmount = Math.floor((claimedAmount * 50) / 100);
		const transferRgasAmount = Math.floor(transferAmount / 100000000);
		const transferUsdAmount = transferRgasAmount / 100;

		console.log("Starting transfer process...");
		// 3. Transfer from hub account to user
		const result = await transferFromHub(userDid, transferAmount);
		console.log("Transfer result:", result);

		if (result) {
			console.log("Sending success webhook...");
			// 发送成功响应，@用户
			const userId = interaction.member?.user?.id || interaction.user?.id;
			const mention = userId ? `<@${userId}>` : userDid;

			const webhookResponse = await fetch(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: `${mention}`,
					embeds: [
						{
							title: `Claim Successful 🎉`,
							description: `**$${transferUsdAmount}** USD test balance has been sent to your account.\n\n**Check your balance on [Nuwa AI Beta](https://test-app.nuwa.dev)**`,
							color: 0x00ff00,
						},
					],
				}),
			});
			console.log("Success webhook sent, status:", webhookResponse.status);
		} else {
			console.log("Sending failure webhook...");
			const userId = interaction.member?.user?.id || interaction.user?.id;
			const mention = userId ? `<@${userId}>` : userDid;

			const webhookResponse = await fetch(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: `${mention} ❌ Successfully claimed **${rgasAmount} RGAS** to hub account, but failed to transfer to your wallet. Please try again later.`,
					embeds: [
						{
							title: "Claim Success, Transfer Failed",
							description: `✅ Claimed ${rgasAmount} RGAS to hub\n❌ Failed to transfer to user wallet`,
							color: 0xffaa00,
						},
					],
				}),
			});
			console.log("Failure webhook sent, status:", webhookResponse.status);
		}
	} catch (error) {
		console.error("Process interaction error:", error);
		console.log("Sending error webhook...");
		const userId = interaction.member?.user?.id || interaction.user?.id;
		const mention = userId ? `<@${userId}>` : userDid;

		const webhookResponse = await fetch(webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: `${mention} ❌ Error occurred while processing claim and transfer: ${error instanceof Error ? error.message : "Unknown error"}`,
				embeds: [
					{
						title: "Error",
						description:
							"An error occurred during the claim and transfer process",
						color: 0xff0000,
					},
				],
							}),
			});
			console.log("Error webhook sent, status:", webhookResponse.status);
		}
}
