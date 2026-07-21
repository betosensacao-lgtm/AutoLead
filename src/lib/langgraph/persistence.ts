import { MemorySaver } from "@langchain/langgraph";

export function getCheckpointer() {
  try {
    return new MemorySaver();
  } catch {
    console.warn("Falha ao criar checkpointer, usando MemorySaver");
    return new MemorySaver();
  }
}
