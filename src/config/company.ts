/**
 * Centrale bedrijfsconfiguratie voor RS Car Detailing.
 * Alleen gegevens die verifieerbaar zijn op https://www.rscardetailing.be/
 * Geen verzonnen e-mail, openingsuren, BTW of marketingclaims.
 */

export interface CompanySocials {
  /** Officiële WhatsApp-link indien aangeboden */
  whatsapp?: string;
}

export interface CompanyConfig {
  /** Officiële merknaam */
  name: string;
  /** Korte weergavenaam */
  shortName: string;
  /** Website */
  website: string;
  /** Vestigingsplaats (geverifieerd) */
  location: string;
  /** Telefoonnummer in weergaveformaat */
  phoneDisplay: string;
  /** Telefoonnummer voor tel: links (E.164) */
  phoneE164: string;
  /** WhatsApp deep-link (geverifieerd via wa.me) */
  whatsappUrl?: string;
  /** E-mail — alleen invullen indien officieel gepubliceerd. Momenteel niet geverifieerd. */
  email?: string;
  /** Socials */
  socials: CompanySocials;
  /** Tagline / korte beschrijving gebaseerd op officiële site */
  tagline: string;
  /** Korte dienstbeschrijving (neutraal, gebaseerd op site) */
  description: string;
}

/**
 * Officiële gegevens geverifieerd op:
 * - https://www.rscardetailing.be/
 * - https://www.rscardetailing.be/contact
 *
 * Telefoon/WhatsApp: 0492/07.05.98 → +32 492 07 05 98 / wa.me/32492070598
 * Locatie: Borsbeek, België
 * E-mail: niet publiek gevonden op de site → weggelaten
 */
export const company: CompanyConfig = {
  name: 'RS Car Detailing',
  shortName: 'RS Car Detailing',
  website: 'https://www.rscardetailing.be/',
  location: 'Borsbeek, België',
  phoneDisplay: '0492 07 05 98',
  phoneE164: '+32492070598',
  whatsappUrl: 'https://wa.me/32492070598',
  // email: niet geverifieerd op officiële site — niet invullen
  socials: {
    whatsapp: 'https://wa.me/32492070598',
  },
  tagline: 'Custom werkbusinrichting voor carwash-professionals',
  description:
    'RS Car Detailing specialiseert zich in het customizen van werkbussen voor carwash-handelaars. Met ervaring als detailers leveren wij maatwerkoplossingen voor een efficiënte mobiele werkplek.',
};

export default company;
