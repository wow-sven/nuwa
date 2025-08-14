import { RoochClient, Transaction, Args } from "@roochnetwork/rooch-sdk";
import { type SignerInterface, DidAccountSigner } from "@nuwa-ai/identity-kit";
import * as yaml from 'js-yaml';
import { buildClient } from "./client";
import {Cap, CapThumbnail, CapThumbnailSchema, Page, Result, ResultCap, ResultCapMetadataSchema} from "./type";

export * from './type'

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
    tags?: string[],
    page?: number,
    size?: number,
  ): Promise<Result<Page<ResultCap>>> {
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
        tags: tags,
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
      if (queryResult.code === 404) {
        return {
          code: 200,
          data: {
            totalItems: 0,
            page: page || 0,
            pageSize: size || 50,
            items: [] as ResultCap[]
          }
        } as Result<Page<ResultCap>>;
      }
      
      if (queryResult.code !== 200) {
        throw new Error(`query failed: ${queryResult.error || 'Unknown error'}`);
      }
      // Transform the raw response data to ResultCap format
      const transformedItems = queryResult.data.items.map((item: any) => {
        const thumbnailType = JSON.parse(item.thumbnail)
        let id = item.id
        const ids = item.id.split(':') as string[]
        if (ids.length > 1 && ids[1] === item.name) {
          id = item.id
        } else {
          id = `${item.id}:${item.name}`
        }
        return {
          id: id,
          cid: item.cid,
          name: item.name,
          version: item.version,
          displayName: item.display_name,
          description: item.description,
          tags: item.tags,
          submittedAt: item.submitted_at,
          homepage: item.homepage,
          repository: item.repository,
          thumbnail: thumbnailType
        }
      });

      return {
        code: queryResult.code,
        data: {
          totalItems: queryResult.data.total_items,
          page: queryResult.data.page,
          pageSize: queryResult.data.page_size,
          items: transformedItems
        }
      } as Result<Page<ResultCap>>;
      
    } finally {
      await client.close();
    }
  }

  async downloadCap(cid: string, format?: 'base64' | 'utf8'): Promise<Cap> {
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

      const sss = yaml.load(downloadResult.fileData)
      return yaml.load(downloadResult.data.fileData) as Cap;
    } finally {
      await client.close();
    }
  }

  async registerCap(cap: Cap) {

    // len > 6 && len < 20, only contain a-z, A-Z, 0-9, _
    if (!/^[a-zA-Z0-9_]{6,20}$/.test(cap.idName)) {
      throw new Error("Name must be between 6 and 20 characters and only contain a-z, A-Z, 0-9, _");
    }

    // 1. Create ACP (Agent Capability Package) file
    const acpContent = yaml.dump(cap);
    
    // 2. Upload ACP file to IPFS using nuwa-cap-store MCP
    const cid = await this.uploadToIPFS(cap.id, acpContent, this.signer);

    // 3. Call Move contract to register the capability
    const result = await this.registerOnChain(cap.idName, cid, this.signer);

    if (result.execution_info.status.type !== 'executed') {
      throw new Error("unknown error");
    }

    return cid;
  }

  private async uploadToIPFS(name: string, content: string, signer: SignerInterface): Promise<string> {

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
      const fileName = `${name}.cap.yaml`;

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
      maxGas: 500000000
    })

    return await this.roochClient.signAndExecuteTransaction({
      transaction,
      signer: chainSigner,
    });
  }
}