"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { SectionLabel } from "../studio-content";
import { ArrowUpRight, ChevronRight } from "../ui/icons";
import "./portfolio-section.css";

const projects = [
  {
    name: "Radian Robots",
    category: "Brand identity",
    href: "/portfolio/radian-robots-branding",
    background: "/studio/portfolio/radian-background-v3.webp",
    object: "/studio/portfolio/radian-object-lossless.webp",
    objectSizes:
      "(min-width: 1464px) 690px, (min-width: 960px) 53vw, (min-width: 600px) 64vw, 90vw",
    objectLayout: {
      "--object-center": "55.44%",
      "--object-ratio": "1366 / 1151",
      "--object-floor-offset": "1.9114%",
    },
    thumbnail: "/studio/portfolio/radian-card-v2.webp",
    accent: "#b8ef20",
    description:
      "A Radian robot alongside bright green brand identity mockups.",
  },
  {
    name: "Prevaisor",
    category: "Brand identity",
    href: "/portfolio/prevaisor-branding",
    background: "/studio/portfolio/prevaisor-background-v3.webp",
    object: "/studio/portfolio/prevaisor-object-lossless.webp",
    objectSizes:
      "(min-width: 1464px) 390px, (min-width: 960px) 30vw, (min-width: 600px) 36vw, 52vw",
    objectLayout: {
      "--object-center": "57.25%",
      "--object-ratio": "1024 / 1536",
      "--object-floor-offset": "0%",
    },
    thumbnail: "/studio/portfolio/prevaisor-card-v2.webp",
    accent: "#639aff",
    description:
      "Prevaisor’s blue brand world with dimensional product mockups and a hand-held phone.",
  },
  {
    name: "Social Puppy",
    category: "Website design",
    href: "/portfolio/social-puppy-website",
    background: "/studio/portfolio/social-puppy-background-v3.webp",
    object: "/studio/portfolio/social-puppy-object-lossless.webp",
    objectSizes:
      "(min-width: 1464px) 750px, (min-width: 960px) 58vw, (min-width: 600px) 70vw, 98vw",
    objectLayout: {
      "--object-center": "51.21%",
      "--object-ratio": "1431 / 1099",
      "--object-floor-offset": "0%",
    },
    thumbnail: "/studio/portfolio/social-puppy-card-v2.webp",
    accent: "#e9aaa9",
    description:
      "Social Puppy’s playful pink brand world with expressive campaign imagery.",
  },
  {
    name: "Doshi",
    category: "Brand identity",
    href: "/portfolio/doshi",
    background: "/studio/portfolio/doshi-background-v3.webp",
    object: "/studio/portfolio/doshi-object-lossless.webp",
    objectSizes:
      "(min-width: 1464px) 650px, (min-width: 960px) 50vw, (min-width: 600px) 61vw, 86vw",
    objectLayout: {
      "--object-center": "50.93%",
      "--object-ratio": "1328 / 1184",
      "--object-floor-offset": "2.3649%",
    },
    thumbnail: "/studio/portfolio/doshi-card-v2.webp",
    accent: "#c7b6a0",
    description:
      "Doshi’s warm neutral fashion identity with accessories and editorial imagery.",
  },
] as const;

const projectNumber = (index: number) => String(index + 1).padStart(2, "0");
const initialProject = projects.findIndex(
  (project) => project.name === "Doshi",
);

type Selection = {
  active: number;
  previous: number | null;
  direction: "forward" | "backward";
  revision: number;
};

const artworkLayers = ["background", "object"] as const;
type ArtworkLayer = (typeof artworkLayers)[number];
const imageKey = (index: number, layer: ArtworkLayer) => `${index}:${layer}`;

export function PortfolioSection() {
  const [selection, setSelection] = useState<Selection>({
    active: initialProject,
    previous: null,
    direction: "forward",
    revision: 0,
  });
  const [requested, setRequested] = useState(initialProject);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [initialImagesReady, setInitialImagesReady] = useState(false);
  const artworkRef = useRef<HTMLDivElement>(null);
  const requestedRef = useRef(initialProject);
  const directionRef = useRef<Selection["direction"]>("forward");
  const loadedImages = useRef(new Set<string>());
  const activeProject = projects[selection.active];
  const isLoading = requested !== selection.active;

  // Keep the current artwork mounted until both incoming images have decoded.
  // A new selection supersedes pending work, including rapid keyboard input.
  function activate(index: number) {
    const direction = directionRef.current;
    setSelection((current) =>
      current.active === index
        ? current
        : {
            active: index,
            previous: current.active,
            direction,
            revision: current.revision + 1,
          },
    );
  }

  function selectProject(index: number, direction?: Selection["direction"]) {
    const next = (index + projects.length) % projects.length;
    directionRef.current =
      direction ?? (next < requestedRef.current ? "backward" : "forward");
    requestedRef.current = next;
    setRequested(next);
    if (
      artworkLayers.every((layer) =>
        loadedImages.current.has(imageKey(next, layer)),
      )
    ) {
      activate(next);
    }
  }

  function finishLoading(index: number, layer: ArtworkLayer) {
    loadedImages.current.add(imageKey(index, layer));
    if (
      !artworkLayers.every((part) =>
        loadedImages.current.has(imageKey(index, part)),
      )
    )
      return;
    if (index === initialProject) setInitialImagesReady(true);
    if (requestedRef.current === index) activate(index);
  }

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.closest("[data-project-switch]") ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        selectProject(requestedRef.current + 1, "forward");
        break;
      case "ArrowLeft":
        event.preventDefault();
        selectProject(requestedRef.current - 1, "backward");
        break;
      case "Home":
        event.preventDefault();
        selectProject(0, "backward");
        break;
      case "End":
        event.preventDefault();
        selectProject(projects.length - 1, "forward");
        break;
    }
  }

  useEffect(() => {
    const artwork = artworkRef.current;
    if (
      !artwork ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(artwork);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selection.previous === null) return;
    const revision = selection.revision;
    const timeout = window.setTimeout(() => {
      setSelection((current) =>
        current.revision === revision
          ? { ...current, previous: null }
          : current,
      );
    }, 1100);
    return () => window.clearTimeout(timeout);
  }, [selection.previous, selection.revision]);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="work-section pb-14 min-[600px]:pb-16 min-[960px]:pb-12"
      style={{ "--project-accent": activeProject.accent } as CSSProperties}
    >
      <div className="work-frame mx-auto w-[calc(100%-48px)] max-w-330 min-[600px]:w-[calc(100%-80px)] min-[960px]:w-[calc(100%-144px)]">
        <div className="border-t border-line pt-5">
          <SectionLabel label="02 / Selected work">
            <span className="hidden min-[600px]:inline">
              TACTIC / Every move matters
            </span>
          </SectionLabel>
          <h2 id="work-title" className="sr-only">
            Selected work
          </h2>
        </div>

        <div
          role="group"
          aria-roledescription="project showcase"
          aria-label="Selected projects"
          aria-describedby="work-keyboard-help"
          onKeyDown={handleKeyboard}
        >
          <p id="work-keyboard-help" className="sr-only">
            Use the project buttons to choose a project. When a project button
            is focused, use the left and right arrow keys to switch projects, or
            Home and End to select the first and last projects.
          </p>

          <div className="work-stage">
            <div
              id="work-active-project"
              className="work-project-header min-w-0"
            >
              <div key={selection.revision} className="work-project-copy">
                <p className="work-project-category font-mono text-[10px] tracking-wider text-green uppercase">
                  {projectNumber(selection.active)} / {activeProject.category}
                </p>
                <h3 className="col-start-1 row-start-2 text-[clamp(28px,4vw,48px)] leading-[1.08] font-normal tracking-[-0.045em]">
                  {activeProject.name}
                </h3>
                <Link
                  className="work-case-link inline-flex min-h-12 items-center justify-center gap-3 text-[12px] whitespace-nowrap"
                  href={activeProject.href}
                  aria-label={`Explore ${activeProject.name}`}
                >
                  <span className="work-case-label">Explore this world</span>
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>

            <div
              ref={artworkRef}
              className="work-artwork"
              data-direction={selection.direction}
              data-entered={hasEntered}
              data-animate={
                selection.revision > 0 || (hasEntered && initialImagesReady)
              }
              role="img"
              aria-label={activeProject.description}
            >
              <div className="work-aura" aria-hidden="true" />
              {projects.map((project, index) => {
                const state =
                  index === selection.active
                    ? "active"
                    : index === selection.previous
                      ? "outgoing"
                      : "idle";
                return (
                  <div
                    key={project.name}
                    className="work-artwork-layer"
                    style={project.objectLayout as CSSProperties}
                    data-state={state}
                    data-project={project.name}
                    aria-hidden="true"
                  >
                    <div
                      key={state === "active" ? selection.revision : "resting"}
                      className="work-artwork-motion"
                    >
                      {artworkLayers.map((layer) => {
                        const key = imageKey(index, layer);
                        const hasFailed = failedImages.includes(key);
                        return (
                          <div
                            key={layer}
                            className={
                              layer === "object"
                                ? "work-artwork-slot work-object-occlusion"
                                : "work-artwork-slot"
                            }
                          >
                            <div
                              className={
                                layer === "background"
                                  ? "work-background-layer"
                                  : "work-object-layer"
                              }
                              data-art-layer={layer}
                            >
                              <div
                                className={
                                  layer === "background"
                                    ? "work-background-mask"
                                    : "work-object-content"
                                }
                                style={
                                  layer === "background"
                                    ? { backgroundColor: project.accent }
                                    : undefined
                                }
                              >
                                {hasFailed ? (
                                  layer === "background" && (
                                    <div
                                      className="work-artwork-fallback"
                                      style={
                                        {
                                          "--fallback-accent": project.accent,
                                        } as CSSProperties
                                      }
                                    >
                                      <span>{project.name}</span>
                                      <ArrowUpRight className="h-16 w-16" />
                                    </div>
                                  )
                                ) : (
                                  <Image
                                    src={project[layer]}
                                    alt=""
                                    fill
                                    quality={90}
                                    sizes={
                                      layer === "background"
                                        ? "(min-width: 1464px) 1320px, (min-width: 960px) calc(100vw - 144px), (min-width: 600px) calc(100vw - 80px), calc(100vw - 48px)"
                                        : project.objectSizes
                                    }
                                    className={
                                      layer === "background"
                                        ? "work-background-image"
                                        : "work-object-image"
                                    }
                                    loading={
                                      index === requested ? "eager" : "lazy"
                                    }
                                    onLoad={() => finishLoading(index, layer)}
                                    onError={() => {
                                      setFailedImages((current) =>
                                        current.includes(key)
                                          ? current
                                          : [...current, key],
                                      );
                                      finishLoading(index, layer);
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="work-project-rail">
            <div className="work-next-moves">
              <span className="work-next-label font-mono text-[10px] tracking-wider text-muted uppercase min-[960px]:text-[9px]">
                Next moves
              </span>
              <div className="work-thumbnail-list grid min-w-0 gap-2 min-[600px]:grid-cols-3">
                {[1, 2, 3].map((offset) => {
                  const index = (selection.active + offset) % projects.length;
                  const project = projects[index];
                  return (
                    <button
                      key={offset}
                      type="button"
                      data-project-switch
                      className="work-thumbnail-button group min-w-0 text-left min-[960px]:bg-transparent"
                      aria-label={`Show ${project.name}`}
                      aria-controls="work-active-project"
                      onClick={() => selectProject(index, "forward")}
                    >
                      <span className="work-thumbnail">
                        <Image
                          src={project.thumbnail}
                          alt=""
                          fill
                          quality={90}
                          sizes="(min-width: 1464px) 410px, (min-width: 960px) calc(33.333vw - 81px), (min-width: 600px) calc(33.333vw - 58px), 96px"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                        <span className="work-thumbnail-arrow">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                      </span>
                      <span className="work-thumbnail-label min-[960px]:mt-2 min-[960px]:block min-[960px]:font-mono min-[960px]:text-[9px] min-[960px]:leading-relaxed min-[960px]:tracking-wider min-[960px]:text-muted min-[960px]:uppercase">
                        <span className="work-thumbnail-number">
                          {projectNumber(index)}
                          <span className="hidden min-[960px]:inline"> / </span>
                        </span>
                        <span className="work-thumbnail-name">
                          {project.name}
                        </span>
                      </span>
                      <ChevronRight className="work-thumbnail-chevron h-4 w-4 text-muted min-[960px]:hidden" />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                data-project-switch
                className="work-next-button"
                aria-label={`Next project: ${projects[(requested + 1) % projects.length].name}`}
                aria-controls="work-active-project"
                onClick={() =>
                  selectProject(requestedRef.current + 1, "forward")
                }
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="work-footer mt-7 flex flex-col items-stretch justify-between gap-2 border-t border-line pt-3 min-[960px]:mt-10 min-[960px]:flex-row min-[960px]:flex-wrap min-[960px]:items-center min-[960px]:gap-x-6 min-[960px]:gap-y-4 min-[960px]:pt-4">
            <div className="flex items-center justify-between gap-4 min-[960px]:justify-start">
              <span
                aria-hidden="true"
                className="font-mono text-[9px] tracking-wider text-muted"
              >
                {projectNumber(selection.active)}{" "}
                <span className="mx-1.5">—</span> 04
              </span>
              <div
                className="flex min-w-0 flex-1 items-center gap-2 min-[960px]:flex-none min-[960px]:gap-0.5"
                aria-label="Choose a project"
              >
                {projects.map((project, index) => (
                  <button
                    key={project.name}
                    type="button"
                    data-project-switch
                    className="work-progress-button flex-1 min-[960px]:flex-none"
                    aria-label={`Show ${project.name}`}
                    aria-pressed={selection.active === index}
                    aria-controls="work-active-project"
                    onClick={() => selectProject(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
              {isLoading && (
                <span className="work-loading-dot" aria-hidden="true" />
              )}
            </div>
            <Link
              href="/portfolio"
              className="work-all-link inline-flex min-h-12 items-center justify-between gap-3 font-mono text-[11px] tracking-wide min-[960px]:justify-start min-[960px]:text-[10px]"
            >
              Explore all projects <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoading
              ? `Loading ${projects[requested].name}.`
              : `${activeProject.name}. ${activeProject.category}. Project ${selection.active + 1} of ${projects.length}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
