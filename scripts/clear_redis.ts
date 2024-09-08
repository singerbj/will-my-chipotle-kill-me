import { kv } from "@vercel/kv";
import { MENU_ITEMS_KEY, PROCESSING_KEY } from "../util/keys";

async function updateData() {
  const menuItems = []; // replace with actual data

  await kv.del(PROCESSING_KEY);
  await kv.del(MENU_ITEMS_KEY);
}

// Call the function
updateData();
