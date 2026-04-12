import type { ReactNode } from "react";
import BottomNav, { type TabId } from "./BottomNav";
import type { Lang } from "./translations";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  lang: Lang;
  moolies: number;
  showNav: boolean;
}

export default function AppLayout({ children, activeTab, onTabChange, lang, moolies, showNav }: AppLayoutProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      {children}
      {showNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          lang={lang}
          moolies={moolies}
        />
      )}
    </div>
  );
}
