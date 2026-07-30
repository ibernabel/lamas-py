"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { SUPPORTED_LANGUAGES, Language } from "@/lib/i18n/config";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="language-switcher-button"
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-2.5 h-9 text-muted-foreground hover:text-foreground"
          title={`Language: ${currentLang.label}`}
        >
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center justify-between cursor-pointer text-xs font-medium"
            onClick={() => setLanguage(lang.code as Language)}
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
            {language === lang.code && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
