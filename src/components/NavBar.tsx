"use client";

import LanguageSwitch from "./Language";
import LoginDialog from "./Login";
import ThemeSwitcher from "./ThemeSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { dispatchOpenRemainingValueCalculatorEvent } from "@/lib/remainingValueEvents";

const NavBar = () => {
  const { publicInfo } = usePublicInfo();
  const { guestDisplay } = useTheme();
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 shadow-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt=""
              className="h-9 w-9 rounded-lg bg-white object-contain p-0.5 shadow-md shadow-primary/20"
            />
            <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {publicInfo?.sitename}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <ThemeSwitcher />
          {guestDisplay.showPrice && guestDisplay.showExpiredAt && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={dispatchOpenRemainingValueCalculatorEvent}
            >
              <Calculator className="h-4 w-4" />
              <span className="sr-only">
                {t("remainingValue.title", { defaultValue: "Remaining Value Calculator" })}
              </span>
            </Button>
          )}
          <LanguageSwitch />

          {publicInfo?.private_site ? (
            <LoginDialog
              autoOpen={publicInfo?.private_site}
              info={t('common.private_site')}
              onLoginSuccess={() => { window.location.reload(); }}
            />
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
