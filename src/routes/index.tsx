import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficSense AI — Traffic Capacity & Peak Demand Analysis" },
      {
        name: "description",
        content:
          "AI-powered traffic capacity, peak-demand and congestion analysis platform for civil engineers, planners and smart cities.",
      },
      { property: "og:title", content: "TrafficSense AI" },
      {
        property: "og:description",
        content:
          "Analyze traffic capacity, detect congestion hotspots, and generate engineering recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      Loading TrafficSense AI…
    </div>
  );
}
