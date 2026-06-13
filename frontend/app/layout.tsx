import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "Shamba", description: "Grow your on-chain farm on Celo. Plant, water, harvest." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="talentapp:project_verification" content="b8284cc66b137ee355be3e58b3b7f29a4b400e0f64b5f7acc32f32a7c838b0a6532fe515e366cd14b1e6e3255d53b59ebfb3bffbb41618c4dd44e3d7a139e027" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
