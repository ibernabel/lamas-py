"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { SUPPORTED_LANGUAGES, Language } from "@/lib/i18n/config";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, Moon, Sun, Laptop, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Language Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            {t("settings.languageSection")}
          </CardTitle>
          <CardDescription>{t("settings.languageDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={language}
            onValueChange={(val) => setLanguage(val as Language)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code}>
                <RadioGroupItem
                  value={lang.code}
                  id={`lang-${lang.code}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`lang-${lang.code}`}
                  className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className="font-semibold text-sm">{lang.label}</p>
                      <p className="text-xs text-muted-foreground uppercase">{lang.code}</p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Appearance / Theme Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4 text-primary" />
            {t("settings.appearanceSection")}
          </CardTitle>
          <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme ?? "system"}
            onValueChange={(val) => setTheme(val)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all gap-2"
              >
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-sm">{t("settings.themeLight")}</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all gap-2"
              >
                <Moon className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-sm">{t("settings.themeDark")}</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all gap-2"
              >
                <Laptop className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">{t("settings.themeSystem")}</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
