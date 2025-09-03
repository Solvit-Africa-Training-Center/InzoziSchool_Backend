import i18n from '../i18n/i18n.config';
import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Internationalization
 *   description: Language and translation management
 */

/**
 * @swagger
 * /api/i18n:
 *   get:
 *     summary: Get translations
 *     description: Retrieve translation data for a specific language or key
 *     tags: [Internationalization]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, fr, rw]
 *         description: Language code (en, fr, rw)
 *         example: en
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Specific translation key to retrieve
 *         example: welcome
 *     responses:
 *       200:
 *         description: Translation data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TranslationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getTranslation = (req: Request, res: Response) => {
  const { lang, key } = req.query;

  if (lang) i18n.changeLanguage(lang as string);

  const translation = key ? i18n.t(key as string) : i18n.getDataByLanguage(i18n.language);

  res.json({
    language: i18n.language,
    translation
  });
};