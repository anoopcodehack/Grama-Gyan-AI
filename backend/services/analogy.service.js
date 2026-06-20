import AnalogyLibrary from "../models/AnalogyLibrary.model.js";
import { CULTURAL_ANALOGIES } from "../../src/data/textbooks.js";

export async function findAnalogyForQuery(queryText) {
  const normQuery = queryText.toLowerCase();

  try {
    // 1. Check live collection if Database is connected
    const liveAnalogies = await AnalogyLibrary.find({});
    if (liveAnalogies && liveAnalogies.length > 0) {
      for (const item of liveAnalogies) {
        for (const kw of item.keywords) {
          if (normQuery.includes(kw.toLowerCase())) {
            return item;
          }
        }
      }
    }
  } catch (err) {
    // Suppress db error, move to pre-seeded dataset
  }

  // 2. Local memory lookup fallback
  for (const item of CULTURAL_ANALOGIES) {
    for (const kw of item.keywords) {
      if (normQuery.includes(kw.toLowerCase())) {
        return item;
      }
    }
  }

  return null;
}
