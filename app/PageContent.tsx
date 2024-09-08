import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import GrowingTextLoop from "@/components/GrowingTextLoop";
import EmojiAnimation from "@/components/EmojiAnimation";

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
  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col justify-end font-bold text-5xl text-center">
          Will my Chipotle kill me?
        </div>
      </div>
      <div className="">
        <Image
          src="/chipotle.svg"
          alt="Skull that looks like Chipotle"
          width={250}
          height={250}
          priority
        />
      </div>
      <div className="flex flex-grow flex-col font-bold text-4xl text-center">
        {!hasError && (
          <div className="w-full">
            {isLoading ? (
              <GrowingTextLoop messages={messages} />
            ) : hasAlPastor ? (
              "Yes"
            ) : (
              "No"
            )}
          </div>
        )}
        {hasError && <div className="w-full">Try again later</div>}
        {lastUpdated && (
          <div className="text-sm text-center w-full mt-4">
            {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
      {/* <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation>
      <EmojiAnimation emoji="😵"></EmojiAnimation> */}
    </>
  );
};
