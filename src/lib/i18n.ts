import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationFR from '../locales/fr/translation.json'

// Application en français : les composants du template appellent t('clé', 'texte français'),
// le texte par défaut est donc affiché tant qu'un catalogue de traduction n'est pas renseigné.
i18n.use(initReactI18next).init({
  resources: { fr: { translation: translationFR } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
