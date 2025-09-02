import i18n from '../i18n/i18n.config';
import { Request, Response } from 'express';

export const getTranslation = (req: Request, res: Response) => {
  const { lang, key } = req.query;

  if (lang) i18n.changeLanguage(lang as string);

  const translation = key ? i18n.t(key as string) : i18n.getDataByLanguage(i18n.language);

  res.json({
    language: i18n.language,
    translation
  });
};