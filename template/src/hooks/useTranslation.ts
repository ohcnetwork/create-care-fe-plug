import { useTranslation as useTranslationBase } from "react-i18next";

export const useTranslation = () => {
  return useTranslationBase("{{PROJECT_NAME_SNAKE}}_fe");
};
