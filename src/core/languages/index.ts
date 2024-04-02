/* eslint-disable @typescript-eslint/no-explicit-any */
import { I18n } from 'i18n-js';

import en_US from 'static/json/languages/en_US.json';

export enum Language {

  EN_US = 'en_US',

}

export const supportedLanguages = {
  [Language.EN_US]: {
    label: 'English',
  },
 
};

export type SupportedLanguage = typeof supportedLanguages;
export type SupportedLanguageKey = keyof SupportedLanguage;

export const i18n = new I18n({
  en_US,
});

// Configure languages
i18n.defaultLocale = Language.EN_US;
i18n.locale = Language.EN_US;
i18n.enableFallback = true;

export const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};
