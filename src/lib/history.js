import { openDB } from "idb";

const dbPromise = openDB("ats_history_db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("analyses")) {
      db.createObjectStore("analyses", { keyPath: "id" });
    }
  },
});

export async function saveAnalysis(analysis) {
  const db = await dbPromise;
  await db.put("analyses", analysis);
}

export async function getHistory() {
  const db = await dbPromise;
  const all = await db.getAll("analyses");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}
