import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";
import { MENU_ITEMS_KEY } from "../scrape/route";

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export async function GET() {
  try {
    const menuItems = await kv.get(MENU_ITEMS_KEY);
    console.log(menuItems);
    if (menuItems) {
      console.log("returning cached data");
      return Response.json(menuItems);
    } else {
      return Response.json({}, { status: 202 });
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: e }, { status: 500 });
  }
}
