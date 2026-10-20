import Image from "next/image";

const clients = [
  { name: "Unixa", logo: "/studio/clients/unixa.png" },
  { name: "Milan Technologies", logo: "/studio/clients/milan.png" },
  { name: "Magny", logo: "/studio/clients/magny.png" },
  { name: "Aura", logo: "/studio/clients/aura.png" },
  { name: "Exilex", logo: "/studio/clients/exilex.png" },
  { name: "Social Puppy", logo: "/studio/clients/social-puppy.png" },
  { name: "Cryptolemos", logo: "/studio/clients/cryptolemos.png" },
  { name: "Visa2Go", logo: "/studio/clients/visa2go.png" },
];

export function ClientRibbon() {
  return (
    <section
      aria-label="Selected clients"
      className="client-ribbon mx-auto w-[calc(100%-48px)] max-w-330 bg-background pt-3 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-sage min-[600px]:w-[calc(100%-80px)] min-[701px]:pt-5 min-[960px]:w-[calc(100%-144px)]"
      tabIndex={0}
      aria-describedby="client-ribbon-description"
    >
      <p id="client-ribbon-description" className="sr-only">
        Client logos scroll slowly. Hover or focus this ribbon to pause.
      </p>
      <div className="client-ribbon-window w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="client-ribbon-track flex w-max">
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
              className="client-ribbon-group m-0 flex shrink-0 list-none items-center p-0"
            >
              {clients.map(({ name, logo }) => (
                <li
                  key={name}
                  className="flex h-20 w-42 shrink-0 items-center justify-center min-[701px]:h-24 min-[701px]:w-54"
                >
                  <Image
                    src={logo}
                    width={166}
                    height={54}
                    alt={duplicate ? "" : name}
                    unoptimized
                    loading="eager"
                    className="h-auto w-29 opacity-90 brightness-180 min-[701px]:w-33"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
