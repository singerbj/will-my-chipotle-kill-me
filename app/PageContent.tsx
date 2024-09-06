import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

const fetchData = async () => {
  const res = await fetch("/api");
  return res.json();
};

export const PageContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["apiData"],
    queryFn: fetchData,
    staleTime: 3600000,
  });

  const hasAlPastor = data
    ?.map((item: string) => item.toLowerCase())
    .includes("pastor");
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
        {!error && (
          <div className="">
            {isLoading ? "Loading..." : hasAlPastor ? "Yes" : "No"}
          </div>
        )}
        {error && <div className="">{error && "Error"}</div>}
      </div>
    </>
  );
};
