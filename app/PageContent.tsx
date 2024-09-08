"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import GrowingTextLoop from "@/components/GrowingTextLoop";
import EmojiFallingAnimation from "@/components/EmojiFallingAnimation";
import FadeInAndGrow from "@/components/FadeInAndGrow";
import { useEffect, useState } from "react";

const NUMBER_OF_EMOJIS = 15;
const EMOJI_DELAY = 2000;

const fetchData = async () => {
  let res = await fetch("/api/menu_items");
  if (res.status === 202) {
    await fetch("/api/scrape");
    // wait 2 seconds before recursively trying again
    await new Promise((resolve) => setTimeout(resolve, 2000));
    res = await fetchData();
  }
  return res.json();
};

const messages = [
  "Checking on it",
  "Getting ingredients",
  "Trying to figure it out",
  "Filling a water cup with soda",
  "Fetching menu items",
  "Investigating",
  "Getting extra guac",
  "Asking for a tortilla on the side",
  "Checking if there are any fajitas left",
];

export const PageContent = () => {
  const [renderEmojis, setRenderEmojis] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["apiData"],
    queryFn: fetchData,
  });
  const hasError = data?.error;
  const menuItems = data?.menuItems;
  const lastUpdated = data?.lastUpdated;
  const hasAlPastor =
    menuItems && menuItems.map
      ? menuItems?.map((item: string) => item.toLowerCase()).includes("pastor")
      : false;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (menuItems) {
      timeoutId = setTimeout(() => {
        setRenderEmojis(true);
      }, EMOJI_DELAY);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [menuItems]);

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col justify-end font-bold text-5xl text-center">
          <FadeInAndGrow delay={0.25}>Will my Chipotle kill me?</FadeInAndGrow>
        </div>
      </div>
      <div className="">
        <FadeInAndGrow delay={0.75}>
          <Image
            src="/chipotle.svg"
            alt="Skull that looks like Chipotle"
            width={250}
            height={250}
            priority
          />
        </FadeInAndGrow>
      </div>
      <div className="flex flex-grow flex-col font-bold text-4xl text-center">
        {!hasError && (
          <div className="w-full">
            {isLoading ? (
              <GrowingTextLoop messages={messages} />
            ) : hasAlPastor ? (
              <FadeInAndGrow delay={1.5}>Yes</FadeInAndGrow>
            ) : (
              <FadeInAndGrow delay={1.5}> No</FadeInAndGrow>
            )}
          </div>
        )}
        {hasError && <div className="w-full">Try again later</div>}
        {lastUpdated && (
          <div className="text-xs text-gray-600 text-center w-full mt-8">
            <FadeInAndGrow delay={2}>
              {new Date(lastUpdated).toLocaleString()}
            </FadeInAndGrow>
          </div>
        )}
      </div>
      {renderEmojis &&
        Array(NUMBER_OF_EMOJIS)
          .fill(null)
          .map((_, index) => (
            <EmojiFallingAnimation
              key={index}
              emoji={hasAlPastor ? "💀" : "😌"}
            ></EmojiFallingAnimation>
          ))}
    </>
  );
};
