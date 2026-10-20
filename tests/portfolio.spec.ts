import { expect, test, type Locator, type Page } from "@playwright/test";
import { join } from "node:path";

const projects = [
  { name: "Radian Robots", href: "/portfolio/radian-robots-branding" },
  { name: "Prevaisor", href: "/portfolio/prevaisor-branding" },
  { name: "Social Puppy", href: "/portfolio/social-puppy-website" },
  { name: "Doshi", href: "/portfolio/doshi" },
] as const;

const progressButton = (work: Locator, name: string) =>
  work
    .getByRole("button", { name: `Show ${name}`, exact: true })
    .and(work.locator("[aria-pressed]"));

async function openWork(page: Page) {
  await page.goto("/");
  const work = page.locator("#work");
  await work.scrollIntoViewIfNeeded();
  await expect(work).toBeVisible();
  return work;
}

async function expectActiveProject(work: Locator, index: number) {
  const project = projects[index];
  await expect(work.getByRole("heading", { level: 3 })).toHaveText(
    project.name,
  );
  await expect(
    work.getByRole("link", { name: `Explore ${project.name}`, exact: true }),
  ).toHaveAttribute("href", project.href);
  await expect(progressButton(work, project.name)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(work.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await expect(work.getByRole("status")).toContainText(
    `Project ${index + 1} of ${projects.length}`,
  );
}

async function expectActiveArtworkLoaded(work: Locator) {
  await expect(work.locator('[data-state="active"] img')).toHaveCount(2);
  for (const layer of ["background", "object"]) {
    const image = work.locator(
      `[data-state="active"] [data-art-layer="${layer}"] img`,
    );
    await expect(image).toHaveCount(1);
    const optimizedSource = new URL(
      (await image.getAttribute("src"))!,
      "http://localhost:3000",
    );
    expect(optimizedSource.pathname).toBe("/_next/image");
    expect(optimizedSource.searchParams.get("q")).toBe("90");
    expect(optimizedSource.searchParams.get("url")).toMatch(
      new RegExp(
        layer === "background"
          ? "-background-v3\\.webp$"
          : "-object-lossless\\.webp$",
      ),
    );
    await expect(image).toHaveAttribute("srcset", /\/_next\/image\?/);
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }
}

test("selected work sits after services and every project opens its own case study", async ({
  page,
}) => {
  const work = await openWork(page);
  await expect(work).toHaveAttribute("aria-labelledby", "work-title");
  await expect(work.getByRole("heading", { level: 2 })).toHaveText(
    "Selected work",
  );
  await expectActiveProject(work, 3);
  expect(
    await work.evaluate((section) => ({
      previous: section.previousElementSibling?.id,
      next: section.nextElementSibling?.id,
    })),
  ).toEqual({ previous: "capabilities", next: "studio" });

  for (const [index, project] of projects.entries()) {
    await progressButton(work, project.name).click();
    await expectActiveProject(work, index);
    await expectActiveArtworkLoaded(work);
  }
  await expect(
    work.getByRole("link", { name: "Explore all projects", exact: true }),
  ).toHaveAttribute("href", "/portfolio");
});

test("thumbnail and next controls cycle through all four project worlds", async ({
  page,
}) => {
  const work = await openWork(page);
  const thumbnails = work
    .getByRole("button", { name: /^Show / })
    .and(work.locator("button:not([aria-pressed])"));
  for (const image of await thumbnails.locator("img").all()) {
    const source = new URL(
      (await image.getAttribute("src"))!,
      "http://localhost:3000",
    );
    expect(source.pathname).toBe("/_next/image");
    expect(source.searchParams.get("url")).toMatch(/-card-v2\.webp$/);
    expect(source.searchParams.get("q")).toBe("90");
    await expect(image).toHaveAttribute("srcset", /\/_next\/image\?/);
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }
  // The same project is available in the persistent progress control and a
  // preview card. Choose the card by its absence of a pressed state.
  await work
    .getByRole("button", { name: "Show Social Puppy", exact: true })
    .and(work.locator("button:not([aria-pressed])"))
    .click();
  await expectActiveProject(work, 2);
  for (const index of [3, 0, 1, 2]) {
    await work
      .getByRole("button", {
        name: `Next project: ${projects[index].name}`,
        exact: true,
      })
      .click();
    await expectActiveProject(work, index);
  }
  await expect(thumbnails).toHaveCount(3);
});

test("rapid selections settle on the latest requested project", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const work = await openWork(page);
  await expectActiveArtworkLoaded(work);
  await expect(work.getByRole("img")).toHaveAttribute("data-entered", "true");
  await expect(
    work.locator('[data-state="active"] [data-art-layer="object"]'),
  ).toHaveCSS("animation-name", "work-object-tilt-up");
  await expect(
    work.locator('[data-state="active"] [data-art-layer="background"]'),
  ).toHaveCSS("animation-name", "work-move-in-forward");
  // Dispatch in one turn, while incoming image loads or transitions can still
  // be pending, to exercise superseded selections rather than queued clicks.
  await work.locator("button[aria-pressed]").evaluateAll((buttons) => {
    for (const index of [1, 3, 0, 2, 1, 3])
      (buttons[index] as HTMLButtonElement).click();
  });
  await expectActiveProject(work, 3);
  await expectActiveArtworkLoaded(work);
  await expect(work.locator('[data-state="outgoing"]')).toHaveCount(0);
  await expectActiveProject(work, 3);
});

test("every animated project keeps its centered rectangular panel during and after the wipe", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1864, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const work = await openWork(page);
  for (const [index, project] of projects.entries()) {
    await progressButton(work, project.name).click();
    await expectActiveProject(work, index);
    await expectActiveArtworkLoaded(work);
    const mask = work.locator('[data-state="active"] .work-background-mask');
    const rectangle = "polygon(0px 25.2%, 100% 25.2%, 100% 82.1%, 0px 82.1%)";
    await expect(mask).toHaveCSS("clip-path", rectangle);
    // The foreground's stationary mask shares the rectangle's lower edge,
    // including while the child object is rotating in perspective.
    const occlusion = work.locator(
      '[data-state="active"] .work-object-occlusion',
    );
    await expect(occlusion).toHaveCSS("animation-name", "none");
    // Measure at rest, since the background itself moves during the wipe.
    await expect
      .poll(() =>
        work
          .locator('[data-state="active"]')
          .evaluate((element) =>
            element
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState === "finished"),
          ),
      )
      .toBe(true);
    await expect(work.locator('[data-state="outgoing"]')).toHaveCount(0);
    await expect(mask).toHaveCSS("clip-path", rectangle);
    const composition = await work
      .locator('[data-state="active"]')
      .evaluate((element) => {
        const frame = element.closest(".work-frame")!.getBoundingClientRect();
        const background = element
          .querySelector(".work-background-layer")!
          .getBoundingClientRect();
        const object = element
          .querySelector(".work-object-layer")!
          .getBoundingClientRect();
        return {
          centerDifference: Math.abs(
            background.left +
              background.width / 2 -
              (frame.left + frame.width / 2),
          ),
          widthRatio: background.width / frame.width,
          popsAbove: object.top < background.top + background.height * 0.252,
        };
      });
    expect(composition.centerDifference).toBeLessThan(1);
    expect(composition.widthRatio).toBeCloseTo(0.72, 2);
    expect(composition.popsAbove).toBe(true);
    const floorDifference = await work
      .locator('[data-state="active"]')
      .evaluate((element) => {
        const background = element
          .querySelector(".work-background-layer")!
          .getBoundingClientRect();
        const occlusion = element.querySelector(".work-object-occlusion")!;
        const points =
          getComputedStyle(occlusion).clipPath.matchAll(/(-?[\d.]+)px/g);
        const floor = [...points].map((match) => Number(match[1]))[0];
        return Math.abs(
          occlusion.getBoundingClientRect().top +
            floor -
            (background.top + background.height * 0.821),
        );
      });
    expect(floorDifference).toBeLessThan(1);
    const screenshotDirectory = process.env.PORTFOLIO_SCREENSHOT_DIR;
    if (screenshotDirectory) {
      const name = `portfolio-animated-${project.name.toLowerCase().replaceAll(" ", "-")}`;
      const path = join(screenshotDirectory, `${name}.png`);
      await work.screenshot({ path, animations: "allow" });
      await testInfo.attach(name, { path, contentType: "image/png" });
    }
  }
  await work.locator(".work-stage").hover();
  const image = work.locator('[data-state="active"] .work-background-image');
  await expect(image).not.toHaveCSS("transform", "none");
  await expect(
    work.locator('[data-state="active"] .work-object-occlusion'),
  ).toHaveCSS("transform", "none");
});

test("keyboard selection works and reduced motion removes the project animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const work = await openWork(page);
  const first = progressButton(work, projects[0].name);
  await first.focus();
  await page.keyboard.press("Home");
  await expectActiveProject(work, 0);
  await page.keyboard.press("ArrowRight");
  await expectActiveProject(work, 1);
  await expect(first).toBeFocused();
  await page.keyboard.press("End");
  await expectActiveProject(work, 3);
  await page.keyboard.press("Home");
  await expectActiveProject(work, 0);
  await page.keyboard.press("ArrowLeft");
  await expectActiveProject(work, 3);

  const second = progressButton(work, projects[1].name);
  await second.focus();
  await page.keyboard.press("Space");
  await expectActiveProject(work, 1);
  await expect(second).toBeFocused();
  for (const layer of ["background", "object"])
    await expect(
      work.locator(`[data-state="active"] [data-art-layer="${layer}"]`),
    ).toHaveCSS("animation-name", "none");
  await expect(work.locator("#work-active-project > div")).toHaveCSS(
    "animation-name",
    "none",
  );
});

for (const width of [320, 390, 768, 959, 960, 1440]) {
  test(`project controls fit the ${width}px viewport in every active state`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const work = await openWork(page);
    for (const [index, project] of projects.entries()) {
      await progressButton(work, project.name).click();
      await expectActiveProject(work, index);
      expect(
        await page.evaluate(() => ({
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          viewport: window.innerWidth,
        })),
      ).toEqual({ document: width, body: width, viewport: width });

      const controls = work.locator("button[data-project-switch], a");
      for (const control of await controls.all()) {
        await expect(control).toBeVisible();
        const bounds = await control.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(-1);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
        if (
          width < 960 &&
          (await control.getAttribute("data-project-switch")) !== null
        ) {
          expect(
            bounds!.width,
            "mobile switch targets remain easy to tap",
          ).toBeGreaterThanOrEqual(44);
          expect(
            bounds!.height,
            "mobile switch targets remain easy to tap",
          ).toBeGreaterThanOrEqual(44);
        }
      }

      if (width < 960) {
        const artwork = await work.getByRole("img").boundingBox();
        const projectCopy = await work
          .locator(".work-project-copy")
          .boundingBox();
        const caseLink = await work
          .getByRole("link", {
            name: `Explore ${project.name}`,
            exact: true,
          })
          .boundingBox();
        const nextMoves = await work.locator(".work-next-moves").boundingBox();
        expect(artwork).not.toBeNull();
        expect(projectCopy).not.toBeNull();
        expect(caseLink).not.toBeNull();
        expect(nextMoves).not.toBeNull();
        expect(
          artwork!.x,
          "the mobile artwork stays inside the viewport",
        ).toBeGreaterThanOrEqual(0);
        expect(artwork!.x + artwork!.width).toBeLessThanOrEqual(width);
        expect(
          artwork!.width / artwork!.height,
          "the mobile artwork has room for its composition",
        ).toBeCloseTo(width < 600 ? 1.5 : 16 / 9, 1);
        expect(
          artwork!.y - (projectCopy!.y + projectCopy!.height),
          "project details sit clearly above the artwork",
        ).toBeGreaterThanOrEqual(16);
        expect(
          nextMoves!.y - (artwork!.y + artwork!.height),
          "project previews have their own space below the artwork",
        ).toBeGreaterThanOrEqual(16);

        const thumbnails = work.locator(".work-thumbnail-button");
        await expect(thumbnails).toHaveCount(3);
        for (const thumbnail of await thumbnails.all()) {
          const label = thumbnail.locator(".work-thumbnail-name");
          expect(
            await label.evaluate((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize),
            ),
            "project preview labels remain readable",
          ).toBeGreaterThanOrEqual(10);
          expect(
            await label.evaluate(
              (element) => element.scrollWidth <= element.clientWidth,
            ),
            "project names are not clipped",
          ).toBe(true);
        }
      }

      for (const surface of [".work-artwork", ".work-thumbnail"]) {
        await expect(work.locator(surface).first()).toHaveCSS("filter", "none");
      }

      const screenshotDirectory = process.env.PORTFOLIO_SCREENSHOT_DIR;
      if (screenshotDirectory) {
        await expectActiveArtworkLoaded(work);
        const slug = project.name.toLowerCase().replaceAll(" ", "-");
        const name = `portfolio-${width}-${slug}`;
        const path = join(screenshotDirectory, `${name}.png`);
        await work.screenshot({ path });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  });
}
