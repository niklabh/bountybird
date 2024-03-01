import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Acme";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const title =
    "Bounty Bird: The Ultimate Social Bounty Platform! Create bounties on Twitter, Hey, and more with ease! Just tag @TheBountyBird and leverage your social graph. Powered by TownHall , Built on Lens.";
  const coverUrl = "/assets/og2-image.png";

  return new ImageResponse(
    (
      <div tw="w-full h-full flex flex-col justify-end items-stretch justify-end bg-slate-200">
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="cover-image"
            tw="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        <div tw="bg-white p-8">
          <div tw="text-5xl mb-2">{title}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
