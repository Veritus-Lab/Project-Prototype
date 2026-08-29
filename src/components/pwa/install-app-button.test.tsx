import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InstallAppButton } from "./install-app-button";

type BeforeInstallPromptEvent = Event & {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function createInstallPromptEvent(): BeforeInstallPromptEvent {
  const event = new Event("beforeinstallprompt") as BeforeInstallPromptEvent;
  event.prompt = vi.fn();
  event.userChoice = Promise.resolve({ outcome: "accepted" });
  return event;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InstallAppButton", () => {
  it("remains hidden until the browser signals that installation is available", async () => {
    render(<InstallAppButton />);

    expect(
      screen.queryByRole("button", { name: "Instalar app" }),
    ).not.toBeInTheDocument();

    window.dispatchEvent(createInstallPromptEvent());

    expect(
      await screen.findByRole("button", { name: "Instalar app" }),
    ).toBeInTheDocument();
  });

  it("prompts only after an explicit click and hides after the choice", async () => {
    const installPromptEvent = createInstallPromptEvent();
    render(<InstallAppButton />);
    window.dispatchEvent(installPromptEvent);

    const button = await screen.findByRole("button", {
      name: "Instalar app",
    });
    expect(installPromptEvent.prompt).not.toHaveBeenCalled();

    fireEvent.click(button);

    expect(installPromptEvent.prompt).toHaveBeenCalledOnce();
    expect(
      await screen.findByRole("button", { name: "Instalar app" }),
    ).not.toBeInTheDocument();
  });
});
