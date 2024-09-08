import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { MENU_ITEMS_KEY, PROCESSING_KEY } from "@/util/keys";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // This function can run for a maximum of 60 seconds

const SCRAPE_URL = "https://www.chipotle.com/order/build/burrito-bowl";
const DEFAULT_SELECTOR_TIMEOUT = 30000;

const getChipotleMenuData = async () => {
  await kv.set(PROCESSING_KEY, true, {
    ex: 3600, // 1 hour
  });

  // identify whether we are running locally or in AWS
  const isLocal = process.env.AWS_EXECUTION_ENV === undefined;

  let browser;
  if (isLocal) {
    // if we are running locally, use the puppeteer that is installed in the node_modules folder
    console.log("creating local browser");
    browser = await require("puppeteer").launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--ignore-certificate-errors",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    });
  } else {
    // if we are running in AWS, download and use a compatible version of chromium at runtime
    console.log("fetching executable path");
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v127.0.0/chromium-v127.0.0-pack.tar"
    );
    console.log("creating production browser");
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--ignore-certificate-errors",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  console.log("creating page");
  const page = await browser.newPage();

  try {
    await page.setRequestInterception(true);
    page.on("request", (request: any) => {
      if (["image", "stylesheet"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log("doing puppeteer scraping");
    await page.goto(SCRAPE_URL, { waitUntil: "networkidle2", timeout: 0 });
    console.log("navigated successfully to ", SCRAPE_URL);

    // await page.waitForSelector(".toast-name-container", {
    //   timeout: DEFAULT_SELECTOR_TIMEOUT,
    // });
    // await page.click(".toast-name-container");

    console.log("clicking input");
    await page.waitForSelector('input[type="text"]', {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click('input[type="text"]');

    console.log("focusing input");
    await page.focus('input[type="text"]');

    console.log("typing in input");
    await page.type('input[type="text"]', "55424");

    console.log("pressing enter 3 times");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    console.log("clicking the search button");
    await page.waitForSelector(".search-container > img", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".search-container > img");

    console.log("clicking the address");
    await page.waitForSelector(".restaurant-address .address", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".restaurant-address .address");

    console.log("clicking the pickup button");
    await page.waitForSelector(".pickup-btn div[role='button']", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".pickup-btn div[role='button']");

    console.log("scraping the ingredients");
    await page.waitForSelector(
      ".meal-builder-item-selector-card-container[data-qa-item-name='Chicken']",
      {
        timeout: DEFAULT_SELECTOR_TIMEOUT,
      }
    );
    const menuItems = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          ".meal-builder-item-selector-card-container .item-name-container"
        )
      );
      return elements.map((el) => el.textContent);
    });

    await browser.close();

    return menuItems;
  } catch (e) {
    if (isLocal) {
      await page.screenshot({ path: "screenshots/error.png" });
    }
    throw e;
  } finally {
    await kv.set(PROCESSING_KEY, false);
  }
};

type ResponseData = {
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const processing = await kv.get(PROCESSING_KEY);
    console.log("processing", processing);
    if (!processing) {
      const menuItems = await getChipotleMenuData();
      console.log("Saving the ingredients!!!!!!!!!!!!");
      await kv.set(
        MENU_ITEMS_KEY,
        { menuItems, lastUpdated: new Date().toISOString() },
        {
          ex: 86400, // 24 hours
        }
      );
      return res.status(200).json({});
    } else {
      return res.status(202).json({});
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
}
