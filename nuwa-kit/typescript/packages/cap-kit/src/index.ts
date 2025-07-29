import { RoochClient, Transaction, Args } from "@roochnetwork/rooch-sdk";
import { type SignerInterface, DIDAuth, DidAccountSigner } from "@nuwa-ai/identity-kit";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import * as yaml from 'js-yaml';

// Polyfill for Buffer in browser environments
const Buffer = typeof window !== 'undefined' && window.Buffer ? window.Buffer : require('buffer').Buffer;

export class CapKit {
  protected roochClient: RoochClient;
  protected contractAddress: string;
  protected mcpUrl: string;

  constructor(option: {
    mcpUrl: string,
    roochUrl: string,
    contractAddress: string,
  }) {
    this.roochClient = new RoochClient({url: option.roochUrl});
    this.contractAddress = option.contractAddress;
    this.mcpUrl = option.mcpUrl;
  }

  async getCap(signer: SignerInterface) {
    const keyId = (await signer.listKeyIds())[0];

    // Create authorization header
    const payload = {
      operation: "mcp-json-rpc",
      params: { body: {} },
    } as const;

    const signedObject = await DIDAuth.v1.createSignature(payload, signer, keyId);
    const authHeader = DIDAuth.v1.toAuthorizationHeader(signedObject);

    // Create MCP client
    const transport = new StreamableHTTPClientTransport(
      new URL(this.mcpUrl),
      {
        requestInit: {
          headers: {
            Authorization: authHeader,
          },
        }
      } as any
    );

    const client = await createMCPClient({ transport });

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const uploadTool = tools.queryCID;

      if (!uploadTool) {
        throw new Error("uploadFile tool not available on MCP server");
      }

      // Upload file to IPFS
      const result = await uploadTool.execute({}, {
        toolCallId: "upload-cap",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const uploadResult = JSON.parse((result.content as any)[0].text);
      
      if (!uploadResult.success || !uploadResult.ipfsCid) {
        throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`);
      }

      return uploadResult.ipfsCid;
    } finally {
      await client.close();
    }
  }

  async queryCap(signer: SignerInterface, option?: {
    id?: string;
    name?: string;
    page?: number;
    size?: number;
  }) {
    const keyId = (await signer.listKeyIds())[0];

    // Create authorization header
    const payload = {
      operation: "mcp-json-rpc",
      params: { body: {} },
    } as const;

    const signedObject = await DIDAuth.v1.createSignature(payload, signer, keyId);
    const authHeader = DIDAuth.v1.toAuthorizationHeader(signedObject);

    // Create MCP client
    const transport = new StreamableHTTPClientTransport(
      new URL(this.mcpUrl),
      {
        requestInit: {
          headers: {
            Authorization: authHeader,
          },
        }
      } as any
    );

    const client = await createMCPClient({ transport });

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const queryCID = tools.queryCID;

      if (!queryCID) {
        throw new Error("query tool not available on MCP server");
      }

      // Upload file to IPFS
      const result = await queryCID.execute({
        id: option?.id,
        name: option?.name,
        page: option?.page,
        pageSize: option?.size
      }, {
        toolCallId: "query-cap",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const queryResult = JSON.parse((result.content as any)[0].text);
      
      if (queryResult.code !== 200) {
        throw new Error(`query failed: ${queryResult.error || 'Unknown error'}`);
      }

      return queryResult;
    } finally {
      await client.close();
    }
  }

  async downloadCap(signer: SignerInterface, option: {
    id?: string;
    format?: 'base64' | 'utf8';
  }) {
    const keyId = (await signer.listKeyIds())[0];

    // Create authorization header
    const payload = {
      operation: "mcp-json-rpc",
      params: { body: {} },
    } as const;

    const signedObject = await DIDAuth.v1.createSignature(payload, signer, keyId);
    const authHeader = DIDAuth.v1.toAuthorizationHeader(signedObject);

    // Create MCP client
    const transport = new StreamableHTTPClientTransport(
      new URL(this.mcpUrl),
      {
        requestInit: {
          headers: {
            Authorization: authHeader,
          },
        }
      } as any
    );

    const client = await createMCPClient({ transport });

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const downloadFile = tools.downloadFile;

      if (!downloadFile) {
        throw new Error("downloadFile tool not available on MCP server");
      }

      // Download file from IPFS
      const result = await downloadFile.execute({
        cid: option.id,
        dataFormat: option.format,
      }, {
        toolCallId: "download-cap",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const downloadResult = JSON.parse((result.content as any)[0].text);

      if (!downloadResult.success) {
        throw new Error(`Download failed: ${downloadResult.error || 'Unknown error'}`);
      }

      return downloadResult;
    } finally {
      await client.close();
    }
  }

  async downloadAndParseYaml(signer: SignerInterface, cid: string) {
    try {
      // Try downloading as utf8 first
      const result = await this.downloadCap(signer, { id: cid, format: 'utf8' });
      let content = result.content || result.data;

      console.log('Download result structure:', Object.keys(result));
      console.log('Raw content type:', typeof content);
      console.log('Raw content preview:', JSON.stringify(content?.toString().substring(0, 100)));

      if (!content) {
        // If utf8 doesn't work, try base64
        const base64Result = await this.downloadCap(signer, { id: cid, format: 'base64' });
        const base64Content = base64Result.content || base64Result.data;
        
        if (base64Content) {
          // Decode base64 to utf8
          content = Buffer.from(base64Content, 'base64').toString('utf8');
          console.log('Using base64 decoded content');
        } else {
          throw new Error('No content returned from download');
        }
      }

      // Clean up the content
      const cleanedContent = this.cleanYamlContent(content);
      console.log('Cleaned content for YAML parsing:', JSON.stringify(cleanedContent.substring(0, 200)));

      // Parse YAML
      const parsedData = yaml.load(cleanedContent);
      return parsedData;
    } catch (error) {
      console.error('Download and parse error:', error);
      throw new Error(`Failed to download and parse YAML: ${(error as Error).message}`);
    }
  }

  private cleanYamlContent(content: string): string {
    // Handle different data types
    if (typeof content !== 'string') {
      content = String(content);
    }

    // Remove BOM (Byte Order Mark) if present
    content = content.replace(/^\uFEFF/, '');
    
    // Filter out control characters that can cause YAML parsing problems
    content = content.split('').filter(char => {
      const code = char.charCodeAt(0);
      // Keep printable characters, newlines, carriage returns, and tabs
      return (code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9;
    }).join('');
    
    // Trim whitespace
    content = content.trim();

    return content;
  }

  async registerCap(option: {
    name: string;
    description: string;
    options: any;
    signer: SignerInterface;
  }) {

    // len > 6 && len < 20, only contain a-z, A-Z, 0-9, _
    if (!/^[a-zA-Z0-9_]{6,20}$/.test(option.name)) {
      throw new Error("Name must be between 6 and 20 characters and only contain a-z, A-Z, 0-9, _");
    }

    // 1. Create ACP (Agent Capability Package) file
    const acpContent = await this.createACPFile(option);
    
    // 2. Upload ACP file to IPFS using nuwa-cap-store MCP
    const cid = await this.uploadToIPFS(acpContent, option.signer);
    
    // 3. Call Move contract to register the capability
    const result = await this.registerOnChain(option.name, cid, option.signer);

    if (result.execution_info.status.type !== 'executed') {
      throw new Error("unknown error");
    }

    return cid;
    
    // 4. fetch with the index service
    // const response = await fetch(`${this.mcpUrl}/cap`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     ...option,
    //     cid: cid,
    //   }),
    // });
    //
    // return response.json();
  }

  private async createACPFile(option: {
    name: string;
    description: string;
    options: any;
    signer: SignerInterface;
  }): Promise<string> {
    const did = (await option.signer.listKeyIds())[0];
    const acp = {
      id: `${did}:${option.name}`,
      name: option.name,
      description: option.description,
      ...option.options,
    };

    return yaml.dump(acp);
  }

  private async uploadToIPFS(content: string, signer: SignerInterface): Promise<string> {

    const keyId = (await signer.listKeyIds())[0];

    // Create authorization header
    const payload = {
      operation: "mcp-json-rpc",
      params: { body: {} },
    } as const;

    const signedObject = await DIDAuth.v1.createSignature(payload, signer, keyId);
    const authHeader = DIDAuth.v1.toAuthorizationHeader(signedObject);

    // Create MCP client
    const transport = new StreamableHTTPClientTransport(
      new URL(this.mcpUrl),
      {
        requestInit: {
          headers: {
            Authorization: authHeader,
          },
        }
      } as any
    );

    const client = await createMCPClient({ transport });

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const uploadTool = tools.uploadFile;

      if (!uploadTool) {
        throw new Error("uploadFile tool not available on MCP server");
      }

      // Convert content to base64
      const fileData = Buffer.from(content, 'utf8').toString('base64');
      const fileName = `cap-${Date.now()}.acp.yaml`;

      // Upload file to IPFS
      const result = await uploadTool.execute({ 
        fileName, 
        fileData, 
      }, {
        toolCallId: "upload-cap",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const uploadResult = JSON.parse((result.content as any)[0].text);
      const uploadData = uploadResult.data;

      if (uploadResult.code !== 200 || !uploadData.ipfsCid) {
        throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`);
      }

      return uploadData.ipfsCid;
    } finally {
      await client.close();
    }
  }

  private async registerOnChain(name: string, cid: string, signer: SignerInterface) {

    const chainSigner = await DidAccountSigner.create(signer);
    const transaction = new Transaction();
    transaction.callFunction({
      target: `${this.contractAddress}::acp_registry::register`,
      typeArgs: [],
      args: [Args.string(name), Args.string(cid)],
    })

    return await this.roochClient.signAndExecuteTransaction({
      transaction,
      signer: chainSigner,
    });
  }
}