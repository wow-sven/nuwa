import { RoochClient, Transaction, Args } from "@roochnetwork/rooch-sdk";
import { type SignerInterface, DidAccountSigner } from "@nuwa-ai/identity-kit";
import * as yaml from 'js-yaml';
import { buildClient } from "./client";

export class CapKit {
  protected roochClient: RoochClient;
  protected contractAddress: string;
  protected mcpUrl: string;
  protected signer: SignerInterface;

  constructor(option: {
    mcpUrl: string,
    roochUrl: string,
    contractAddress: string,
    signer: SignerInterface,
  }) {
    this.roochClient = new RoochClient({url: option.roochUrl});
    this.contractAddress = option.contractAddress;
    this.mcpUrl = option.mcpUrl;
    this.signer = option.signer;
  }

  async queryCapWithCID(cid: string) {
    const client = await buildClient(this.mcpUrl, this.signer);

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const queryWithCID = tools.queryWithCID;

      if (!queryWithCID) {
        throw new Error("uploadFile tool not available on MCP server");
      }

      // Upload file to IPFS
      const result = await queryWithCID.execute({cid}, {
        toolCallId: "queryWithCID",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const queryResult = JSON.parse((result.content as any)[0].text);
      
      if (queryResult.code !== 200) {
        throw new Error(`Upload failed: ${queryResult.error || 'Unknown error'}`);
      }

      return queryResult;
    } finally {
      await client.close();
    }
  }

  async queryWithName(
    name?: string,
    page?: number,
    size?: number,
  ) {
    const client = await buildClient(this.mcpUrl, this.signer);

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const queryWithName = tools.queryWithName;

      if (!queryWithName) {
        throw new Error("query tool not available on MCP server");
      }

      // Upload file to IPFS
      const result = await queryWithName.execute({
        name: name,
        page: page,
        pageSize: size
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

  async downloadCap(cid: string, format?: 'base64' | 'utf8') {
    const client = await buildClient(this.mcpUrl, this.signer);

    try {
      // Get tools from MCP server
      const tools = await client.tools();
      const downloadFile = tools.downloadFile;

      if (!downloadFile) {
        throw new Error("downloadFile tool not available on MCP server");
      }

      // Download file from IPFS
      const result = await downloadFile.execute({
        cid: cid,
        dataFormat: format,
      }, {
        toolCallId: "download-cap",
        messages: [],
      });

      if (result.isError) {
        throw new Error((result.content as any) ?.[0]?.text || 'Unknown error');
      }

      const downloadResult = JSON.parse((result.content as any)[0].text);

      if (downloadResult.code !== 200) {
        throw new Error(`Download failed: ${downloadResult.error || 'Unknown error'}`);
      }

      return downloadResult;
    } finally {
      await client.close();
    }
  }

  async registerCap(
    name: string,
    description: string,
    options: any,
  ) {

    // len > 6 && len < 20, only contain a-z, A-Z, 0-9, _
    if (!/^[a-zA-Z0-9_]{6,20}$/.test(name)) {
      throw new Error("Name must be between 6 and 20 characters and only contain a-z, A-Z, 0-9, _");
    }

    // 1. Create ACP (Agent Capability Package) file
    const acpContent = await this.createACPFile({name, description, options});
    
    // 2. Upload ACP file to IPFS using nuwa-cap-store MCP
    const cid = await this.uploadToIPFS(acpContent, this.signer);
    
    // 3. Call Move contract to register the capability
    const result = await this.registerOnChain(name, cid, this.signer);

    if (result.execution_info.status.type !== 'executed') {
      throw new Error("unknown error");
    }

    return cid;
  }

  private async createACPFile(option: {
    name: string;
    description: string;
    options: any;
  }): Promise<string> {
    const did = (await this.signer.listKeyIds())[0];
    const acp = {
      id: `${did}:${option.name}`,
      name: option.name,
      description: option.description,
      ...option.options,
    };

    return yaml.dump(acp);
  }

  private async uploadToIPFS(content: string, signer: SignerInterface): Promise<string> {

    const client = await buildClient(this.mcpUrl, signer);

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