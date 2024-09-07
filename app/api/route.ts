// import chromium from "@sparticuz/chromium-min";
// import puppeteer from "puppeteer-core";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

import cacheData from "memory-cache";
import { NextRequest } from "next/server";

const SCRAPE_URL = "https://www.chipotle.com/order/build/burrito-bowl";
const MENU_ITEMS_KEY = "menuItems";
const HOURS_TO_CACHE = 24;
const DEFAULT_SELECTOR_TIMEOUT = 30000;

const getChipotleMenuData = async () => {
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

    console.log("doing cheerio");
    await page.goto(SCRAPE_URL, { waitUntil: "networkidle2", timeout: 0 });
    console.log("navigated successfully to ", SCRAPE_URL);

    await page.screenshot({ path: "screenshots/1.png" });

    // await page.waitForSelector(".toast-name-container", {
    //   timeout: DEFAULT_SELECTOR_TIMEOUT,
    // });
    // await page.click(".toast-name-container");

    await page.waitForSelector('input[type="text"]', {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click('input[type="text"]');

    await page.focus('input[type="text"]');
    await page.type('input[type="text"]', "55424");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.waitForSelector(".search-container > img", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".search-container > img");

    await page.waitForSelector(".restaurant-address .address", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".restaurant-address .address");

    await page.waitForSelector(".pickup-btn div[role='button']", {
      timeout: DEFAULT_SELECTOR_TIMEOUT,
    });
    await page.click(".pickup-btn div[role='button']");

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
  }
};

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = !!searchParams.get("force");

    const menuItems = cacheData.get(MENU_ITEMS_KEY);
    if (!force && menuItems) {
      console.log("returning cached data - force: ", force);
      return Response.json(menuItems);
    } else {
      console.log("returning scraped data - force: ", force);
      const menuItems = await getChipotleMenuData();
      cacheData.put(MENU_ITEMS_KEY, menuItems, HOURS_TO_CACHE * 1000 * 60 * 60);
      return Response.json(menuItems);
    }
  } catch (e) {
    // console.error(e);
    // return Response.json({ error: e });
    throw e;
  }
}
