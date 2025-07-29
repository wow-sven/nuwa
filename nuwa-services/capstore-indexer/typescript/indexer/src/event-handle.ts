import axios from "axios";
import yaml from "js-yaml";
import { storeToSupabase } from './supabase.js';
import { RoochClient } from '@roochnetwork/rooch-sdk';
import type { Cap } from "./type.js";
import { IPFS_GATEWAY, PACKAGE_ID, ROOCH_NODE_URL } from "./constant.js";

export async function fetchAndParseYaml(cid: string): Promise<Cap> {
  try {
    // Check if this is a local IPFS API endpoint
    const isLocalApi = IPFS_GATEWAY.includes(':5001');
    const url = isLocalApi 
      ? `${IPFS_GATEWAY}/api/v0/cat?arg=${cid}`
      : `${IPFS_GATEWAY}/ipfs/${cid}`;
    
    const requestMethod = isLocalApi ? 'post' : 'get';
    const response = await axios[requestMethod](url, { 
      timeout: 10000,
      responseType: 'text',
      responseEncoding: 'utf8'
    });

    if (response.status !== 200) {
      throw new Error(`IPFS request failed with status ${response.status}`);
    }

    const content = response.data;
    const parsedData = yaml.load(content) as Partial<Cap>;

    if (!parsedData?.name || !parsedData?.id) {
      throw new Error('Invalid YAML structure: Missing required fields');
    }

    return {
      name: parsedData.name,
      id: parsedData.id,
    };
  } catch (error) {
    throw new Error(`Failed to fetch or parse YAML: ${(error as Error).message}`);
  }
}

export async function processRoochRegisterEvent() {
  try {
    const client = new RoochClient({url: ROOCH_NODE_URL});
    const events = await client.queryEvents({
      filter: {
        event_type: `${PACKAGE_ID}::acp_registry::RegisterEvent`,
      }
    });

    for (const event of events.data) {
      try {
        
        const data = (event.decoded_event_data as any)?.value as any;
        if (typeof data.cid !== 'string') {
            throw new Error('Event data does not contain a valid CID string');
        }
        const cid = data.cid;
        const yamlData = await fetchAndParseYaml(cid);

        await storeToSupabase(yamlData, cid);

        console.log(`Processed CID: ${cid}`);
      } catch (innerError) {
        console.error(`Error processing event: ${(innerError as Error).message}`);
      }
    }

    return events;
  } catch (error) {
    throw new Error(`Rooch event query failed: ${(error as Error).message}`);
  }
}

export function setupRoochEventListener(interval = 30000) {
  setInterval(async () => {
    try {
      console.log("Checking Rooch for new RegisterEvents...");
      await processRoochRegisterEvent();
    } catch (error) {
      console.error(`Event polling error: ${(error as Error).message}`);
    }
  }, interval);
}