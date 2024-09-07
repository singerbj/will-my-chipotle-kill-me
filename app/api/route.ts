// import chromium from "@sparticuz/chromium-min";
// import puppeteer from "puppeteer-core";

import type { NextApiRequest, NextApiResponse } from "next";
import playwright from "playwright-core";
import { chromium } from "playwright"; // If you're bundling Chromium with the app

import cacheData from "memory-cache";
import { NextRequest } from "next/server";

const SCRAPE_URL = "https://www.chipotle.com/order/build/burrito-bowl";
const MENU_ITEMS_KEY = "menuItems";
const HOURS_TO_CACHE = 24;

const getChipotleMenuData = async () => {
  console.log("creating browser");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log("doing cheerio");
    await page.goto(SCRAPE_URL);

    await page.waitForSelector(".toast-name-container", { timeout: 5000 });
    await page.click(".toast-name-container");

    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.click('input[type="text"]');

    await page.focus('input[type="text"]');
    await page.type('input[type="text"]', "55424");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.waitForSelector(".search-container > img", { timeout: 5000 });
    await page.click(".search-container > img");

    await page.waitForSelector(".restaurant-address .address", {
      timeout: 5000,
    });
    await page.click(".restaurant-address .address");

    await page.waitForSelector(".pickup-btn div[role='button']", {
      timeout: 5000,
    });
    await page.click(".pickup-btn div[role='button']");

    await page.waitForSelector(
      ".meal-builder-item-selector-card-container[data-qa-item-name='Chicken']",
      {
        timeout: 5000,
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
    // await page.screenshot({ path: "screenshots/error.png" });
    throw e;
  }
};

// const getChipotleMenuData = async () => {
//   console.log("creating browser");
//   const browser = await puppeteer.launch({
//     args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath(
//       `https://github.com/Sparticuz/chromium/releases/download/v127.0.0/chromium-v127.0.0-pack.tar`
//     ),
//     headless: chromium.headless,
//   });
//   console.log("creating page");
//   const page = await browser.newPage();
//   try {
//     console.log("doing cheerio");
//     await page.goto(SCRAPE_URL);

//     await page.waitForSelector(".toast-name-container", { timeout: 5000 });
//     await page.click(".toast-name-container");

//     await page.waitForSelector('input[type="text"]', { timeout: 5000 });
//     await page.click('input[type="text"]');

//     await page.focus('input[type="text"]');
//     await page.type('input[type="text"]', "55424");
//     await page.keyboard.press("Enter");
//     await page.keyboard.press("Enter");
//     await page.keyboard.press("Enter");

//     await page.waitForSelector(".search-container > img", { timeout: 5000 });
//     await page.click(".search-container > img");

//     await page.waitForSelector(".restaurant-address .address", {
//       timeout: 5000,
//     });
//     await page.click(".restaurant-address .address");

//     await page.waitForSelector(".pickup-btn div[role='button']", {
//       timeout: 5000,
//     });
//     await page.click(".pickup-btn div[role='button']");

//     await page.waitForSelector(
//       ".meal-builder-item-selector-card-container[data-qa-item-name='Chicken']",
//       {
//         timeout: 5000,
//       }
//     );
//     const menuItems = await page.evaluate(() => {
//       const elements = Array.from(
//         document.querySelectorAll(
//           ".meal-builder-item-selector-card-container .item-name-container"
//         )
//       );
//       return elements.map((el) => el.textContent);
//     });

//     await browser.close();

//     return menuItems;
//   } catch (e) {
//     // await page.screenshot({ path: "screenshots/error.png" });
//     throw e;
//   }
// };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = !!searchParams.get("force");

    const menuItems = cacheData.get(MENU_ITEMS_KEY);
    if (!force && menuItems) {
      console.log("returning cached data", force);
      return Response.json(menuItems);
    } else {
      console.log("returning scraped data", force);
      const menuItems = await getChipotleMenuData();
      cacheData.put(MENU_ITEMS_KEY, menuItems, HOURS_TO_CACHE * 1000 * 60 * 60);
      return Response.json(menuItems);
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: e });
  }
}
