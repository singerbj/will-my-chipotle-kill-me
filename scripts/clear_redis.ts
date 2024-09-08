import { kv } from "@vercel/kv";
import { MENU_ITEMS_KEY, PROCESSING_KEY } from "../util/keys";

async function updateData() {
  let processing = await kv.get(PROCESSING_KEY);
  let menuItems = await kv.get(MENU_ITEMS_KEY);

  console.log("before processing", processing, typeof processing);
  console.log("before menuItems", menuItems, typeof processing);

  await kv.del(PROCESSING_KEY);
  await kv.del(MENU_ITEMS_KEY);

  processing = await kv.get(PROCESSING_KEY);
  menuItems = await kv.get(MENU_ITEMS_KEY);

  console.log("after processing", processing, typeof processing);
  console.log("after menuItems", menuItems, typeof processing);
}

// Call the function
updateData();
