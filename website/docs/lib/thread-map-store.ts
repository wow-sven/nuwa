import fs from "fs";
import path from "path";

const DATA_FILE = path.join(__dirname, "./slack-assistant-thread-map.json");

function loadMap(): Map<string, string> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const obj = JSON.parse(raw);
      return new Map(Object.entries(obj));
    }
  } catch (e) {
    console.error("Failed to load thread map", e);
  }
  return new Map();
}

function saveMap(map: Map<string, string>) {
  try {
    const obj = Object.fromEntries(map.entries());
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save thread map", e);
  }
}

const slackToAssistantThreadMap = loadMap();

export function setThreadMap(thread_ts: string, assistantThreadId: string) {
  slackToAssistantThreadMap.set(thread_ts, assistantThreadId);
  saveMap(slackToAssistantThreadMap);
}

export function getThreadMap(thread_ts: string) {
  return slackToAssistantThreadMap.get(thread_ts);
}
