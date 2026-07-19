import { expect, test } from "@playwright/test";

async function openCartographer(page: import("@playwright/test").Page) {
  const compass = page.getByRole("button", { name: "指南针" });
  await compass.dispatchEvent("pointerdown");
  await page.waitForTimeout(70);
  await compass.dispatchEvent("pointerup");
  await page.locator("input[inputmode='numeric']").fill("1104");
  await page.getByRole("button", { name: "进入" }).click();
  await expect(page.getByRole("heading", { name: "制图人控制台" })).toBeVisible();
}

test("opens the atlas and exposes a complete no-dead-end fallback", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.getByRole("button", { name: "开启地图" }).click();
  await expect(page.locator(".intro-screen")).toHaveClass(/is-opening/);
  await expect(page.locator(".intro-ink-route")).toBeVisible();
  await expect(page.getByText("好闻的")).toBeVisible();
  await expect(page.locator("image.illustrated-base-map")).toHaveAttribute("href", "/assets/maps/qianjiang-scent-v3.jpg");
  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();

  const compass = page.getByRole("button", { name: "指南针" });
  await compass.dispatchEvent("pointerdown");
  await expect(compass).toHaveClass(/is-holding/);
  expect(
    await compass.locator(".compass-hold-progress circle").evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("compassHoldProgress");
  await compass.dispatchEvent("pointermove", { pointerId: 1, clientX: -20, clientY: -20 });
  await page.waitForTimeout(3_100);
  await compass.dispatchEvent("pointerup");
  await expect(page.getByRole("heading", { name: "输入制图人口令" })).toBeVisible();
  await page.locator("input[inputmode='numeric']").fill("1104");
  await page.getByRole("button", { name: "进入" }).click();
  await expect(page.getByRole("heading", { name: "制图人控制台" })).toBeVisible();
  await page.getByRole("button", { name: "强制抵达" }).click();
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
});

test("automatically arrives after two accurate nearby location samples", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation({ latitude: 30.25414, longitude: 120.21094, accuracy: 18 });
  await page.goto("/");
  await page.getByRole("button", { name: "开启地图" }).click();
  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();
  await context.setGeolocation({ latitude: 30.25415, longitude: 120.21096, accuracy: 16 });
  await page.waitForTimeout(100);
  await context.setGeolocation({ latitude: 30.254158, longitude: 120.21097, accuracy: 14 });
  await page.waitForTimeout(100);
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
  await expect(page.locator("[data-celebration='arrival']")).toBeVisible();
  await expect(page.getByText("坐标已回应")).toBeVisible();
  await expect(page.locator(".goal-arrival-ripple")).toHaveCount(2);
  await expect(page.getByText("精度 ±14m")).toBeVisible();
  await expect(page.locator(".footstep.visible").first()).toBeVisible();
  await expect(page.locator(".you-marker")).toBeVisible();
});

test("uses two breathing dots and rotates the current-position arrow", async ({ page }) => {
  await page.addInitScript(() => {
    if (!("DeviceOrientationEvent" in window)) {
      Object.defineProperty(window, "DeviceOrientationEvent", {
        configurable: true,
        value: class DeviceOrientationEvent extends Event {},
      });
    }
  });
  await page.goto("/?mode=fulltest&run=e2e-point-markers");
  await page.getByRole("button", { name: "开启地图" }).click();

  await expect(page.locator(".goal-point")).toBeVisible();
  await expect(page.locator(".goal-tag")).toContainText("GOAL");
  await expect(page.locator(".you-marker")).toBeVisible();
  await expect(page.locator(".atlas-point .point-glow")).toHaveCount(2);
  await expect(page.locator(".parking-mark, .checkpoint-mark")).toHaveCount(0);
  await expect(page.locator(".you-marker text")).toHaveCount(0);
  expect(
    await page.locator(".point-glow").first().evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("atlasPointBreath");

  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();
  await page.evaluate(() => {
    const event = new Event("deviceorientation");
    Object.defineProperty(event, "webkitCompassHeading", { value: 123 });
    window.dispatchEvent(event);
  });
  await expect(page.locator(".you-marker")).toHaveAttribute("data-heading", "123");
  await expect(page.locator(".you-heading-arrow")).toHaveAttribute("transform", "rotate(123)");
});

test("moves the explorer dot from live coordinates and force-arrival never teleports it", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation({ latitude: 30.27463, longitude: 119.99011, accuracy: 18 });
  await page.addInitScript(() => {
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...arguments_: unknown[]) =>
      nativeTimeout(handler, timeout === 3_000 ? 30 : timeout, ...arguments_)) as typeof window.setTimeout;
  });
  await page.goto("/?mode=fulltest&run=e2e-live-dot-v2");
  await page.getByRole("button", { name: "开启地图" }).click();
  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();

  const marker = page.locator(".you-marker");
  await expect(marker).toHaveAttribute("data-map-y", /\d/);
  const beforeY = Number(await marker.getAttribute("data-map-y"));
  await context.setGeolocation({ latitude: 30.27496, longitude: 119.99011, accuracy: 18 });
  await expect.poll(async () => Number(await marker.getAttribute("data-map-y"))).toBeLessThan(beforeY - 10);
  await expect(page.locator(".footstep.visible").first()).toBeVisible();

  const beforeForce = {
    x: await marker.getAttribute("data-map-x"),
    y: await marker.getAttribute("data-map-y"),
  };
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await expect(marker).toHaveAttribute("data-map-x", beforeForce.x!);
  await expect(marker).toHaveAttribute("data-map-y", beforeForce.y!);
});

test("keeps the map immersive with a collapsible floating quest card", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...arguments_: unknown[]) =>
      nativeTimeout(handler, timeout === 3_000 ? 30 : timeout, ...arguments_)) as typeof window.setTimeout;
  });
  await page.goto("/?mode=fulltest&run=e2e-immersive-map");
  await page.getByRole("button", { name: "开启地图" }).click();

  const map = page.locator(".map-stage");
  const card = page.locator(".floating-quest-card");
  await expect(card).toHaveClass(/is-collapsed/);
  await expect(page.locator(".quest-clue")).toHaveCount(0);
  expect(await map.evaluate((element) => getComputedStyle(element).position)).toBe("relative");
  expect(await card.evaluate((element) => getComputedStyle(element).position)).toBe("absolute");
  const [mapBox, viewport] = await Promise.all([map.boundingBox(), page.evaluate(() => innerWidth)]);
  expect(mapBox!.width / viewport).toBeGreaterThan(0.98);

  await page.getByRole("button", { name: "查看线索" }).click();
  await expect(card).toHaveClass(/is-expanded/);
  await expect(page.locator(".quest-clue")).toBeVisible();
  await map.click({ position: { x: 110, y: 260 } });
  await expect(card).toHaveClass(/is-collapsed/);

  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await expect(card).toHaveClass(/is-expanded/);
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
});

test("restores the current unlocked checkpoint after a refresh", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation({ latitude: 30.25414, longitude: 120.21094, accuracy: 18 });
  await page.goto("/");
  await page.getByRole("button", { name: "开启地图" }).click();
  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();
  await context.setGeolocation({ latitude: 30.25415, longitude: 120.21096, accuracy: 16 });
  await page.waitForTimeout(100);
  await context.setGeolocation({ latitude: 30.254158, longitude: 120.21097, accuracy: 14 });
  await page.waitForTimeout(100);
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
  await page.reload();
  await expect(page.locator(".topbar b")).toHaveText("Qianjiang · Scent District");
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
});

test("portrait viewport asks the explorer to rotate", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "请将 iPad 横过来" })).toBeVisible();
});

test("walks the four preset rehearsal maps and unlocks one with live geolocation", async ({ page, context, baseURL }) => {
  const origin = { latitude: 30.2742, longitude: 119.99088, accuracy: 24 };
  await page.addInitScript(() => {
    sessionStorage.removeItem("exploration-nearby-rehearsal-v4");
  });
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation(origin);
  await page.goto("/?mode=nearby");
  await page.getByRole("button", { name: "展开固定彩排地图" }).click();
  const route = page.locator(".nearby-route");
  await expect(route).toBeVisible();
  await expect(route.locator("h2")).toContainText("富力中心北区 · 东门");
  await expect(page.locator("image.illustrated-base-map")).toHaveAttribute(
    "href",
    "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png",
  );

  const latitude = Number(await route.getAttribute("data-target-latitude"));
  const longitude = Number(await route.getAttribute("data-target-longitude"));
  expect(Number.isFinite(latitude)).toBe(true);
  expect(Number.isFinite(longitude)).toBe(true);

  for (let index = 0; index < 7; index += 1) {
    await context.setGeolocation({
      latitude: latitude + index * 0.000001,
      longitude: longitude + index * 0.000001,
      accuracy: 18,
    });
    await page.waitForTimeout(100);
  }
  await expect(page.getByRole("button", { name: "记录通过，前往下一点" })).toBeVisible();
  await page.getByRole("button", { name: "记录通过，前往下一点" }).click();
  await expect(page.locator(".quest-number")).toHaveText("02");
  await expect(page.locator("image.illustrated-base-map")).toHaveAttribute(
    "href",
    "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png",
  );

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "强制抵达（室内兜底）" }).click();
    const buttonName = index === 2 ? "完成附近彩排" : "记录通过，前往下一点";
    await page.getByRole("button", { name: buttonName }).click();
  }
  await expect(page.getByRole("heading", { name: "附近彩排完成" })).toBeVisible();
});

test("walks all six gifts through the fallback path to the finale", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...arguments_: unknown[]) =>
      nativeTimeout(handler, timeout === 3_000 ? 30 : timeout, ...arguments_)) as typeof window.setTimeout;
  });
  await page.goto("/?mode=fulltest&run=e2e-complete");
  await expect(page.locator(".intro-map-sheet img")).toHaveAttribute(
    "src",
    "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png",
  );
  await page.getByRole("button", { name: "开启地图" }).click();

  for (const [gift, asset] of [
    ["好闻的", "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png"],
    ["好用的", "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png"],
    ["好听的", "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png"],
  ]) {
    await expect(page.locator(".quest-card h2")).toContainText(gift);
    await expect(page.locator("image.illustrated-base-map")).toHaveAttribute("href", asset);
    await openCartographer(page);
    await page.getByRole("button", { name: "强制过关" }).click();
    await page.getByRole("button", { name: "返回载具" }).click();
    await page.getByRole("button", { name: "我已停车，展开下一片地图" }).click();
  }

  await expect(page.locator(".quest-card h2")).toContainText("好看的");
  await expect(page.locator("image.illustrated-base-map")).toHaveAttribute("href", "/assets/maps/rehearsal/05-fuli-north-four-gates-v1.png");
  await openCartographer(page);
  await page.getByRole("button", { name: "强制过关" }).click();
  await page.getByRole("button", { name: "点亮下一个坐标" }).click();

  await expect(page.locator(".quest-card h2")).toContainText("好吃的");
  await openCartographer(page);
  await page.getByRole("button", { name: "强制过关" }).click();
  await page.getByRole("button", { name: "点亮下一个坐标" }).click();

  await expect(page.locator(".quest-card h2")).toContainText("好爱的");
  await page.getByRole("button", { name: "打开最后一封信" }).click();
  await page.getByRole("button", { name: "完成探索" }).click();
  await expect(page.getByRole("heading", { name: "Exploration Completed" })).toBeVisible();
});

test("supports dragging and two-pointer zoom on the hand-drawn map", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "开启地图" }).click();
  const map = page.getByLabel("可拖拽和双指缩放的探索地图");
  const before = await map.evaluate((element) => getComputedStyle(element).transform);
  await map.dispatchEvent("pointerdown", { pointerId: 1, clientX: 300, clientY: 300 });
  await map.dispatchEvent("pointermove", { pointerId: 1, clientX: 355, clientY: 330 });
  await map.dispatchEvent("pointerup", { pointerId: 1, clientX: 355, clientY: 330 });
  await page.waitForTimeout(1_200);
  const afterDrag = await map.evaluate((element) => getComputedStyle(element).transform);
  expect(afterDrag).not.toBe(before);
  expect(await map.getAttribute("data-pan")).toBe("55,30");

  await map.dispatchEvent("pointerdown", { pointerId: 1, clientX: 300, clientY: 300 });
  await map.dispatchEvent("pointerdown", { pointerId: 2, clientX: 400, clientY: 300 });
  await map.dispatchEvent("pointermove", { pointerId: 2, clientX: 500, clientY: 300 });
  await map.dispatchEvent("pointerup", { pointerId: 2, clientX: 500, clientY: 300 });
  await map.dispatchEvent("pointerup", { pointerId: 1, clientX: 300, clientY: 300 });
  await page.waitForTimeout(1_200);
  expect(Number(await map.getAttribute("data-zoom"))).toBeGreaterThan(1.2);
});

test("shows one reference photo, scores an uploaded recreation, and stores it locally", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...arguments_: unknown[]) =>
      nativeTimeout(handler, timeout === 3_000 ? 30 : timeout, ...arguments_)) as typeof window.setTimeout;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "开启地图" }).click();
  await page.getByRole("button", { name: "停车完毕，开始探索" }).click();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await page.getByRole("button", { name: "开启照片复刻" }).click();

  await expect(page.getByAltText("制图人预先拍摄的模特参考照片")).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  const uploadInput = page.locator("input[data-role='capture-photo']").first();
  await uploadInput.waitFor({ state: "attached" });
  await uploadInput.setInputFiles("public/references/scent.svg");
  const startedAt = Date.now();
  await page.getByRole("button", { name: "开始匹配" }).click();
  await expect(page.locator("[data-celebration='photo']")).toBeVisible();
  await expect(page.locator(".confetti-cannon")).toHaveCount(2);
  await expect(page.locator(".confetti-piece")).toHaveCount(52);
  await expect(page.getByText("画面与记忆重合")).toBeVisible();
  await expect(page.getByText("SCENT FOUND")).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(4_000);
  await expect(page.getByText(/照片匹配度 \d+%/)).toBeVisible();

  const photoCount = await page.evaluate(async () => {
    return new Promise<number>((resolve, reject) => {
      const request = indexedDB.open("exploration-atlas");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const count = request.result.transaction("photos").objectStore("photos").count();
        count.onerror = () => reject(count.error);
        count.onsuccess = () => resolve(count.result);
      };
    });
  });
  expect(photoCount).toBe(1);
});

test("stores the complete atlas and local vision model for offline use", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, 5_000);
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
    }
  });
  await expect(page.getByText("离线地图已缓存")).toBeVisible();
  await context.setOffline(true);
  const offlineAssets = await page.evaluate(async () => {
    const paths = [
      "index.html",
      "models/pose_landmarker_lite.task",
      "mediapipe/wasm/vision_wasm_internal.js",
      "mediapipe/wasm/vision_wasm_internal.wasm",
      "workers/photo-score.js",
    ];
    const exact = await Promise.all(
      paths.map(async (path) => {
        const response = await caches.match(path);
        return { path, ok: Boolean(response), bytes: response ? (await response.arrayBuffer()).byteLength : 0 };
      }),
    );
    const cacheName = (await caches.keys()).find((name) => name.startsWith("exploration-atlas-"));
    const keys = (cacheName ? await caches.open(cacheName).then((cache) => cache.keys()) : []).map(
      (request) => new URL(request.url).pathname,
    );
    return {
      exact,
      hasApplicationScript: keys.some((path) => /\/assets\/index-[^/]+\.js$/.test(path)),
      hasApplicationStyles: keys.some((path) => /\/assets\/index-[^/]+\.css$/.test(path)),
    };
  });
  expect(offlineAssets.exact.every((asset) => asset.ok && asset.bytes > 0)).toBe(true);
  expect(offlineAssets.hasApplicationScript).toBe(true);
  expect(offlineAssets.hasApplicationStyles).toBe(true);
  await context.setOffline(false);
});
