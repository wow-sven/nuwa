import { NextRequest, NextResponse } from "next/server";
import urlMetadata from "url-metadata";

// define the request body type
interface UrlMetadataRequest {
	url: string;
}

// define the response body type
interface UrlMetadataResponse {
	url: string;
	title?: string;
	description?: string;
	image?: string;
	author?: string;
	keywords?: string[];
	publishedTime?: string;
	modifiedTime?: string;
	siteName?: string;
	type?: string;
	favicon?: string;
	canonical?: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	ogType?: string;
	ogSiteName?: string;
	twitterCard?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	twitterImage?: string;
	twitterCreator?: string;
	twitterSite?: string;
	[key: string]: any; // allow other metadata fields
}

export async function POST(request: NextRequest) {
	try {
		// parse the request body
		const body: UrlMetadataRequest = await request.json();

		// validate the URL parameter
		if (!body.url || typeof body.url !== "string") {
			return NextResponse.json(
				{ error: "URL parameter is required and must be a string" },
				{ status: 400 },
			);
		}

		// validate the URL format
		try {
			new URL(body.url);
		} catch (error) {
			return NextResponse.json(
				{ error: "Invalid URL format" },
				{ status: 400 },
			);
		}

		// get the metadata
		const metadata = await urlMetadata(body.url);

		// build the response object
		const response: UrlMetadataResponse = {
			url: body.url,
			title: metadata.title,
			description: metadata.description,
			image: metadata.image,
			author: metadata.author,
			keywords: metadata.keywords
				? metadata.keywords.split(",").map((k) => k.trim())
				: undefined,
			publishedTime: metadata.publishedTime,
			modifiedTime: metadata.modifiedTime,
			siteName: metadata.siteName,
			type: metadata.type,
			favicon: metadata.favicon,
			canonical: metadata.canonical,
			ogTitle: metadata["og:title"],
			ogDescription: metadata["og:description"],
			ogImage: metadata["og:image"],
			ogType: metadata["og:type"],
			ogSiteName: metadata["og:site_name"],
			twitterCard: metadata["twitter:card"],
			twitterTitle: metadata["twitter:title"],
			twitterDescription: metadata["twitter:description"],
			twitterImage: metadata["twitter:image"],
			twitterCreator: metadata["twitter:creator"],
			twitterSite: metadata["twitter:site"],
		};

		// add all other metadata fields
		Object.keys(metadata).forEach((key) => {
			if (
				!Object.hasOwn(response, key) &&
				!key.startsWith("og:") &&
				!key.startsWith("twitter:")
			) {
				response[key] = metadata[key];
			}
		});

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error getting URL metadata:", error);

		// return the corresponding error message based on the error type
		if (error instanceof Error) {
			if (
				error.message.includes("ENOTFOUND") ||
				error.message.includes("getaddrinfo")
			) {
				return NextResponse.json(
					{ error: "Cannot resolve domain or network connection failed" },
					{ status: 404 },
				);
			}

			if (
				error.message.includes("ECONNREFUSED") ||
				error.message.includes("ETIMEDOUT")
			) {
				return NextResponse.json(
					{ error: "Connection refused or timed out" },
					{ status: 503 },
				);
			}

			if (error.message.includes("ENOENT") || error.message.includes("404")) {
				return NextResponse.json(
					{ error: "Page not found or cannot be accessed" },
					{ status: 404 },
				);
			}
		}

		return NextResponse.json(
			{ error: "Unknown error occurred while getting URL metadata" },
			{ status: 500 },
		);
	}
}

// add GET method support (optional)
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json(
			{ error: "Please provide the URL query parameter" },
			{ status: 400 },
		);
	}

	// reuse the POST method logic
	const mockRequest = new NextRequest("http://localhost/api/url-metadata", {
		method: "POST",
		body: JSON.stringify({ url }),
	});

	return POST(mockRequest);
}
