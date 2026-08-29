"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };

export function InstallAppButton() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  useEffect(() => { const onPrompt = (value: Event) => { value.preventDefault(); setEvent(value as InstallEvent); }; window.addEventListener("beforeinstallprompt", onPrompt); return () => window.removeEventListener("beforeinstallprompt", onPrompt); }, []);
  if (!event) return null;
  return <Button variant="secondary" onClick={async () => { await event.prompt(); await event.userChoice; setEvent(null); }}>Instalar app</Button>;
}
