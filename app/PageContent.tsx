import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

const fetchData = async () => {
  const res = await fetch("/api");
  return res.json();
};

export const PageContent = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["apiData"],
    queryFn: fetchData,
    staleTime: 3600000,
    retry: false,
  });
  const hasError = data?.error;
  const hasAlPastor =
    data && data.map
      ? data?.map((item: string) => item.toLowerCase()).includes("pastor")
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
      <div className="flex flex-grow font-bold text-5xl text-center">
        {!hasError && (
          <div className="">
            {isLoading ? "Loading..." : hasAlPastor ? "Yes" : "No"}
          </div>
        )}
        {hasError && <div className="">Try again later</div>}
      </div>
    </>
  );
};
