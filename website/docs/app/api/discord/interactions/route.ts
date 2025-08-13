import {
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { NextResponse } from "next/server";
import { commands } from "./commands";
import { verifyInteractionRequest } from "./verify-discord-request";

const DISCORD_APP_PUBLIC_KEY = process.env.DISCORD_APP_PUBLIC_KEY;

/**
 * Use edge runtime which is faster, cheaper, and has no cold-boot.
 * If you want to use node runtime, you can change this to `node`, but you'll also have to polyfill fetch (and maybe other things).
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
 */
export const runtime = "edge";

/**
 * Handle Discord interactions. Discord will send interactions to this endpoint.
 *
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction
 */
export async function POST(request: Request) {
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
					return NextResponse.json({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `Your did is ${options[0].value}`,
						},
					});
				}
				return NextResponse.json({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: "Please provide a DID value",
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
