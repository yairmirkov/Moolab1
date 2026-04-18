import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at top, #0c2d48 0%, #061522 70%, #030b14 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "min(100%, 1180px)",
          height: "100%",
          overflow: "hidden",
          boxShadow:
            "0 0 60px rgba(46,139,192,0.08), 0 0 0 1px rgba(46,139,192,0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
