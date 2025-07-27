import axios from "axios";
import yaml from "js-yaml";
import { storeToSupabase, queryCIDFromSupabase } from './supabase.js';
import { RoochClient } from '@roochnetwork/rooch-sdk';

const DEFAULT_IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
const DEFAULT_PACKAGE_ID = process.env.PACKAGE_ID || 'YOUR_ROOCH_PACKAGE_ID';

export interface YamlData {
  name: string;
  id: string;
}

export async function fetchAndParseYaml(cid: string, ipfs: string = DEFAULT_IPFS_GATEWAY): Promise<YamlData> {
  try {
    const url = `${ipfs}?arg=${cid}`;
    const response = await axios.post(url, { timeout: 10000 });

    if (response.status !== 200) {
      throw new Error(`IPFS request failed with status ${response.status}`);
    }

    const content = response.data;
    const parsedData = yaml.load(content) as Partial<YamlData>;

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

export async function processRoochRegisterEvent(option: {
  roochUrl: string,
  ipfsUrl: string,
  packageId: string
}) {
  try {
    const client = new RoochClient({url: option.roochUrl});
    const events = await client.queryEvents({
      filter: {
        event_type: `${option.packageId}::acp_registry::RegisterEvent`,
      }
    });

    for (const event of events.data) {
      try {
        
        const data = (event.decoded_event_data as any)?.value as any;
        if (typeof data.cid !== 'string') {
            throw new Error('Event data does not contain a valid CID string');
        }
        const cid = data.cid;
        const yamlData = await fetchAndParseYaml(cid, option.ipfsUrl);

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

export async function queryCID(name: string, id: string) {
  try {
    if (!name || !id) throw new Error('Missing name or id parameter');

    const result = await queryCIDFromSupabase(name, id);
    return {
      success: true,
      cid: result.cid
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export function setupRoochEventListener(interval = 30000, option: {
  ipfsUrl: string,
  roochUrl: string,
  packageId: string
}) {
  setInterval(async () => {
    try {
      console.log("Checking Rooch for new RegisterEvents...");
      await processRoochRegisterEvent(option);
    } catch (error) {
      console.error(`Event polling error: ${(error as Error).message}`);
    }
  }, interval);
}

