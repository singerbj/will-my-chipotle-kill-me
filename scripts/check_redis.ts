import { kv } from "@vercel/kv";
import { MENU_ITEMS_KEY, PROCESSING_KEY } from "../util/keys";

async function updateData() {
  const processing = await kv.get(PROCESSING_KEY);
  const menuItems = await kv.get(MENU_ITEMS_KEY);

  console.log("processing", processing, typeof processing);
  console.log("menuItems", menuItems, typeof processing);
}

// Call the function
updateData();
