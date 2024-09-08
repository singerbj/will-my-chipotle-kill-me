import type { NextApiRequest, NextApiResponse } from "next";
import { MENU_ITEMS_KEY } from "@/util/keys";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";
export const config = {
  maxDuration: 60,
};

type ResponseData =
  | {
      error?: any;
    }
  | {
      menuItems: string[];
      time: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const menuItems = await kv.get(MENU_ITEMS_KEY);
    if (menuItems) {
      console.log("returning cached data");
      return res.status(200).json(menuItems);
    } else {
      return res.status(202).json({});
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
}
