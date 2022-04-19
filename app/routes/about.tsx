import type { HeadersFunction } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type LoaderData = { time: number };

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ time: Date.now() });
};

export const headers: HeadersFunction = () => {
  const oneMinute = 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;
  const oneWeek = oneDay * 7;
  const oneYear = oneDay * 365;
  return {
    "Cache-Control": `max-age=${oneHour}, s-maxage=${oneYear}, stale-while-revalidate=${oneWeek}`,
  };
};

export default function AboutPage() {
  const data = useLoaderData() as LoaderData;
  return (
    <div className="m-auto max-w-4xl">
      <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
        About
      </h1>
      <p>Let me tell you about this page...</p>
      <footer>Generated: {data.time}</footer>
    </div>
  );
}
