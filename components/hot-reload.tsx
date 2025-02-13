"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HotReload() {
  const router = useRouter();
  const [status, setStatus] = useState<"connected" | "connecting" | "no">(
    "connecting",
  );

  useEffect(() => {
    const socket = new WebSocket("http://localhost:8080");

    socket.onopen = (event) => {
      console.log("Dev server connection opened:", event);
      setStatus("connected");
    };

    socket.onclose = () => {
      setStatus("no");
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      router.refresh();
    };

    socket.onerror = () => {
      setStatus("no");
    };

    return () => {
      socket.close();
    };
  }, []);

  if (status === "no") return;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full text-xs bg-fd-secondary text-fd-muted-foreground p-2 shadow-xl">
      {status === "connected" ? "Connected to Dev Server" : "Connecting..."}
    </div>
  );
}
