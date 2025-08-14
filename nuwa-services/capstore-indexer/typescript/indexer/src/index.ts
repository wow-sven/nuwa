import { Readable } from 'node:stream';

import { config } from 'dotenv';
import { FastMCP } from "fastmcp";
import { create } from 'ipfs-http-client';
import { CID } from 'multiformats/cid';
import { z } from "zod";

import { DIDAuth, VDRRegistry, initRoochVDR } from "@nuwa-ai/identity-kit";

import {IPFS_NODE, IPFS_NODE_PORT, IPFS_NODE_URL, TARGET} from "./constant.js";
import {setupRoochEventListener, syncCap} from './event-handle.js';
import { queryFromSupabase } from "./supabase.js";
import type { Result } from "./type.js";

// Load environment variables
config();

// -----------------------------------------------------------------------------
// IPFS Client Initialization
// -----------------------------------------------------------------------------
let ipfsClient: any;

(async () => {
  try {

    if (IPFS_NODE_URL) {
      ipfsClient = create({
        url: IPFS_NODE_URL
      });
    } else {
      // Create IPFS HTTP client
      ipfsClient = await create({
        host: IPFS_NODE,
        port: parseInt(IPFS_NODE_PORT),
        protocol: 'http'
      });

      // Verify connection
      const nodeId = await ipfsClient.id();
      console.log('✅ IPFS client initialized');
      console.log(`🌐 Connected to go-ipfs node: ${nodeId.id}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize IPFS client:', error);
    process.exit(1);
  }
})();

// -----------------------------------------------------------------------------
// Initialize VDRRegistry (Identity Verification)
// -----------------------------------------------------------------------------
const registry = VDRRegistry.getInstance();
initRoochVDR(TARGET, undefined, registry);

// -----------------------------------------------------------------------------
// Event Listener Initialization
// -----------------------------------------------------------------------------
setupRoochEventListener();

// -----------------------------------------------------------------------------
// Unified Authentication Function
// -----------------------------------------------------------------------------
const authenticateRequest = async (request: any) => {
  // Extract authorization header
  const header =
    typeof request.headers?.get === "function"
      ? request.headers.get("authorization")
      : request.headers["authorization"] ?? request.headers["Authorization"];

  const prefix = "DIDAuthV1 ";
  if (!header || !header.startsWith(prefix)) {
    throw new Response(undefined, { status: 401, statusText: "Missing DIDAuthV1 header" });
  }

  // Verify DID authentication
  const verify = await DIDAuth.v1.verifyAuthHeader(header, registry);
  if (!verify.ok) {
    const msg = (verify as { error: string }).error;
    throw new Response(`Invalid DIDAuth: ${msg}`, { status: 403 });
  }

  // Return signer DID
  const signerDid = verify.signedObject.signature.signer_did;
  return { did: signerDid };
};

// -----------------------------------------------------------------------------
// Create Unified FastMCP Service
// -----------------------------------------------------------------------------
const ipfsService = new FastMCP({
  name: "nuwa-ipfs-service",
  version: "1.0.0",
  authenticate: authenticateRequest
});

ipfsService.addTool({
  name: "queryWithCID",
  description: "Query CID",
  parameters: z.object({
    cid: z.string().describe("Resource identifier"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true
  },
  async execute(args) {
    try {
      const { cid } = args;
      const result = await queryFromSupabase(null, cid);

      if (!result.success || !result.items || result.items.length === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 404,
              error: result.error || 'No matching records found',
            } as Result)
          }]
        };
      }

      if (!result.items || result.items.length === 0) {
        await syncCap(cid)

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 404,
              error: 'No matching records found',
            } as Result)
          }]
        };
      }

      const item = result.items[0]
      // MCP standard response with pagination info
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 200,
            data: item
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 500,
            error: (error as Error).message || 'Unknown error occurred'
          } as Result)
        }]
      };
    }
  }
});

// -----------------------------------------------------------------------------
// CID Query Tool with Pagination Support
// -----------------------------------------------------------------------------
ipfsService.addTool({
  name: "queryWithName",
  description: "Query with name",
  parameters: z.object({
    name: z.string().optional().describe("cap name or display name (optional)"),
    tags: z.array(z.string()).optional().describe("cap tags (optional)"),
    page: z.number().optional().default(0).describe("Page number starting from 0"),
    pageSize: z.number().optional().default(50).describe("Number of records per page")
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true
  },
  async execute(args) {
    try {
      const { name, tags, page, pageSize } = args;
      const result = await queryFromSupabase(name, null, tags, page, pageSize);

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 404,
              error: result.error || 'No matching records found',
            } as Result)
          }]
        };
      }

      // MCP standard response with pagination info
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 200,
            data: {
              totalItems: result.totalItems,
              page,
              pageSize,
              totalPages: Math.ceil(result.totalItems / pageSize),
              items: result.items
            }
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 500,
            error: (error as Error).message || 'Unknown error occurred'
          } as Result)
        }]
      };
    }
  }
});

// -----------------------------------------------------------------------------
// File Upload Tool
// -----------------------------------------------------------------------------
ipfsService.addTool({
  name: "uploadFile",
  description: "Upload a file to IPFS",
  parameters: z.object({
    fileName: z.string().describe("Name of the file"),
    fileData: z.string().describe("Base64 encoded file data"),
    pin: z.boolean().optional().default(true).describe("Pin the file on IPFS")
  }),
  async execute({ fileName, fileData, pin }, context) {
    try {
      // Authentication check
      if (!context.session?.did) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 401,
              error: "Authentication required"
            })
          }]
        };
      }

      const uploaderDid = context.session.did;
      console.log(`📤 Upload request from DID: ${uploaderDid}, File: ${fileName}`);

      // Convert Base64 to Uint8Array
      const buffer = Buffer.from(fileData, 'base64');
      const data = new Uint8Array(buffer);

      // Upload to IPFS
      const ipfsResult = await ipfsClient.add({
        path: fileName,
        content: Readable.from([data])
      });

      const ipfsCid = CID.parse(ipfsResult.cid.toString());
      console.log(`🌐 File uploaded to IPFS: CID ${ipfsCid.toString()}`);

      // Pin file if requested
      if (pin) {
        await ipfsClient.pin.add(ipfsCid);
        console.log(`📌 Pinned file: ${ipfsCid.toString()}`);
      }

      // MCP standard response format
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 200,
            data: {
              fileName,
              ipfsCid: ipfsCid.toString(),
              uploaderDid,
              timestamp: new Date().toISOString(),
              ipfsUrl: `ipfs://${ipfsCid.toString()}`,
              gatewayUrl: `https://ipfs.io/ipfs/${ipfsCid.toString()}`
            }
          } as Result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 500,
            error: error instanceof Error ? error.message : String(error)
          } as Result)
        }]
      };
    }
  },
});

// -----------------------------------------------------------------------------
// File Download Tool
// -----------------------------------------------------------------------------
ipfsService.addTool({
  name: "downloadFile",
  description: "Download a file from IPFS using its CID",
  parameters: z.object({
    cid: z.string().describe("Content Identifier (CID) of the file"),
    dataFormat: z.enum(['base64', 'utf8']).optional().default('utf8')
      .describe("Output format for file data")
  }),
  async execute({ cid, dataFormat }, context) {
    try {
      if (!context.session?.did) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 401,
              error: "Authentication required"
            } as Result)
          }]
        };
      }

      const downloaderDid = context.session.did;
      console.log(`📥 Download request from DID: ${downloaderDid}, CID: ${cid}`);

      // CID format validation
      if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^b[A-Za-z0-9]{58}$/.test(cid)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              code: 500,
              error: "The CID format does not meet the requirements",
            })
          }]
        };
      }

      // Download file directly - IPFS will throw an error if CID doesn't exist
      const chunks = [];
      let totalSize = 0;

      try {
        for await (const chunk of ipfsClient.cat(cid, {
          timeout: 15 * 1000
        })) {
          chunks.push(chunk);
          totalSize += chunk.length;
        }
      } catch (catError) {
        // Handle IPFS-specific errors
        const errorMessage = catError instanceof Error ? catError.message : String(catError);
        if (errorMessage.includes('not found') || errorMessage.includes('no link named') || errorMessage.includes('deadline')) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                code: 404,
                error: `File not found in IPFS: ${cid}`
              } as Result)
            }]
          };
        }
        // Re-throw other errors to be caught by outer catch
        throw catError;
      }

      const fileBuffer = Buffer.concat(chunks, totalSize);

      // Format data
      let formattedData : string;
      if (dataFormat === 'base64') {
        formattedData = fileBuffer.toString('base64');
      } else {
        formattedData = fileBuffer.toString('utf8');
      }

      // MCP standard response format
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 200,
            data: {
              cid,
              size: totalSize,
              fileData: formattedData,  // 重命名字段
              dataFormat,
              gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
              timestamp: new Date().toISOString()
            }
          } as Result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            code: 500,
            error: error instanceof Error ? error.message : 'Download failed'
          })
        }]
      };
    }
  },
});


// -----------------------------------------------------------------------------
// Start Service
// -----------------------------------------------------------------------------
ipfsService.start({
  transportType: "httpStream",
  httpStream: {
    port: 3000,
    endpoint: "/mcp"
  }
}).then(() => {
  console.log('✅ Nuwa IPFS Service running on port 3000');
  console.log('🔍 Use "queryCID" to find content');
  console.log('📤 Use "uploadFile" to upload content');
  console.log('📥 Use "downloadFile" to retrieve content');
  console.log('🌐 Access IPFS content at: ipfs://{cid}');
});