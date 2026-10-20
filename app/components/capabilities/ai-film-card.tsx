import Image from "next/image";
import {
  CapabilityCard,
  ServiceHeading,
  ServiceNumber,
} from "./capability-card";

export function AiFilmCard() {
  return (
    <CapabilityCard
      href="/services/ai-film"
      variant="film"
      className="ability-film-scene group/film min-h-100 min-[701px]:col-span-4 min-[701px]:col-start-9 min-[701px]:row-[1/3]"
      aria-labelledby="ai-film-title"
    >
      <Image
        src="/studio/ai-campaign.png"
        alt="A black perfume bottle on volcanic rocks, surrounded by smoke against a green and rose sunset."
        fill
        sizes="(min-width: 701px) 900px, 720px"
        className="object-cover object-[51%_center] saturate-75 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/film:scale-[1.035] motion-reduce:transition-none"
      />
      <ServiceNumber
        className="top-3 right-6 z-1 min-[1001px]:right-7"
        hoverOpacityClassName="group-hover/capability:opacity-[0.04] group-focus-within/capability:opacity-[0.04]"
        mobileNumber="4"
      >
        o2
      </ServiceNumber>
      <div className="absolute right-6 bottom-7 left-6 z-1 min-[1001px]:right-7 min-[1001px]:left-7">
        <ServiceHeading id="ai-film-title">
          AI /{" "}
          <em className="inline-block origin-bottom-left skew-x-6 font-editorial font-normal transition-transform duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-focus-within/film:translate-x-1 motion-safe:group-focus-within/film:-skew-x-2 motion-safe:group-hover/film:translate-x-1 motion-safe:group-hover/film:-skew-x-2 motion-reduce:transition-none">
            AI Film
          </em>
        </ServiceHeading>
        <p className="mt-2 max-w-48 text-[11px] leading-[1.5] text-chalk/85 min-[1001px]:text-[12px]">
          AI-powered films shaped by creative direction. From the first story to
          the final frame.
        </p>
      </div>
    </CapabilityCard>
  );
}
