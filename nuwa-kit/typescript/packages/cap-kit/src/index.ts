import { RoochClient, Transaction, Args } from "@roochnetwork/rooch-sdk";
import { type SignerInterface, DIDAuth, DidAccountSigner } from "@nuwa-ai/identity-kit";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

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

      const uploadResult = JSON.parse((result.content as any)[0].text);
      
      if (!uploadResult.success || !uploadResult.ipfsCid) {
        throw new Error(`query failed: ${uploadResult.error || 'Unknown error'}`);
      }

      return uploadResult.ipfsCid;
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

      // Upload file to IPFS
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

      if (!downloadResult.success || !downloadResult.ipfsCid) {
        throw new Error(`Upload failed: ${downloadResult.error || 'Unknown error'}`);
      }

      return downloadResult;
    } finally {
      await client.close();
    }
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
    const acpContent = this.createACPFile(option);
    
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

  private createACPFile(option: {
    name: string;
    description: string;
    options: any;
  }): string {
    const acp = {
      id: `did:nuwa:cap:${option.name}@0.1.0`,
      name: option.name,
      description: option.description,
      ...option.options,
    };

    return JSON.stringify(acp, null, 2);
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
      console.log(fileName)
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
      
      if (!uploadResult.success || !uploadResult.ipfsCid) {
        throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`);
      }
      console.log(uploadResult.ipfsCid)
      return uploadResult.ipfsCid;
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