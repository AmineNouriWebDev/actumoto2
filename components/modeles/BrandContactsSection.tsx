import prisma from "@/lib/prisma";
import { dealersContacts } from "@/lib/data";

interface BrandContactsSectionProps {
  brand: string;
}

function getMapsInfo(address?: string | null, location?: string | null) {
  const cleanAddr = (address || "").trim();
  const cleanLoc = (location || "").trim();

  if (!cleanAddr && !cleanLoc) return null;

  // 1. Déterminer l'URL d'ouverture directe Google Maps
  let openUrl = "";
  if (cleanLoc.startsWith("http")) {
    openUrl = cleanLoc;
  } else if (cleanLoc) {
    openUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanLoc)}`;
  } else {
    const query = cleanAddr + (cleanAddr.toLowerCase().includes("tunis") ? "" : ", Tunisie");
    openUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // 2. Déterminer la requête ou le centre pour l'iframe Google Maps embed
  let embedQuery = "";
  const coordRegex = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
  if (coordRegex.test(cleanLoc)) {
    embedQuery = cleanLoc;
  } else if (cleanLoc.includes("google.com/maps") || cleanLoc.includes("maps.google.com")) {
    try {
      const urlObj = new URL(cleanLoc);
      const q = urlObj.searchParams.get("q");
      if (q) {
        embedQuery = q;
      } else {
        const atMatch = cleanLoc.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
          embedQuery = `${atMatch[1]},${atMatch[2]}`;
        }
      }
    } catch (e) {}
  }

  if (!embedQuery) {
    if (cleanAddr) {
      embedQuery = cleanAddr + (cleanAddr.toLowerCase().includes("tunis") ? "" : ", Tunisie");
    } else if (cleanLoc && !cleanLoc.startsWith("http")) {
      embedQuery = cleanLoc + (cleanLoc.toLowerCase().includes("tunis") ? "" : ", Tunisie");
    } else {
      embedQuery = cleanAddr || "Tunisie";
    }
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return {
    embedUrl,
    openUrl,
    displayAddress: cleanAddr || (coordRegex.test(cleanLoc) ? `Coordonnées GPS : ${cleanLoc}` : cleanLoc),
  };
}

export default async function BrandContactsSection({ brand }: BrandContactsSectionProps) {
  const brandData = await prisma.brand.findUnique({
    where: { name: brand },
    include: { dealerContact: true }
  });
  
  // Recherche statique (insensible à la casse)
  const staticKey = Object.keys(dealersContacts).find(
    (k) => k.toLowerCase() === brand.toLowerCase()
  );
  const staticContact = staticKey ? (dealersContacts as any)[staticKey] : null;
  const dbContact = brandData?.dealerContact;

  if (!dbContact && !staticContact) return null;
  
  const contacts = {
    showroomAddress: dbContact?.showroomAddress || staticContact?.addresses?.[0],
    showroomLocation: dbContact?.showroomLocation || staticContact?.mapUrl,
    phones: (dbContact?.phones?.length ? dbContact.phones : staticContact?.phones) || [],
    emails: (dbContact?.emails?.length ? dbContact.emails : staticContact?.emails) || [],
    website: dbContact?.website || staticContact?.website,
    facebook: dbContact?.facebook || staticContact?.facebook,
    instagram: dbContact?.instagram || staticContact?.instagram,
    youtube: dbContact?.youtube || staticContact?.youtube,
    tiktok: dbContact?.tiktok || staticContact?.tiktok,
    salesParts: (dbContact?.salesParts && (dbContact.salesParts as any[]).length > 0) ? dbContact.salesParts : staticContact?.dealers,
  };

  const mapsInfo = getMapsInfo(contacts.showroomAddress, contacts.showroomLocation);

  return (
    <div className="brand-contacts-wrapper">
      <div className="brand-contacts">
        <h2 className="contacts-title futurist-font">Concessionnaire {brand}</h2>
        
        {/* Adresse & Carte Google Maps */}
        {mapsInfo && (
          <div className="contact-item maps-item">
            <div className="w-full">
              {mapsInfo.displayAddress && (
                <div className="flex items-center gap-2 mb-3 text-white font-medium">
                  <span className="text-xl">📍</span>
                  <span>{mapsInfo.displayAddress}</span>
                </div>
              )}
              <div className="maps-container">
                <iframe
                  className="maps-iframe"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapsInfo.embedUrl}
                  style={{ border: 0 }}
                  aria-label={`Google Maps - ${mapsInfo.displayAddress}`}
                />
                <a
                  href={mapsInfo.openUrl}
                  className="maps-link-open"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvrir dans Google Maps"
                >
                  <span>📍 Ouvrir dans Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Phones */}
        {contacts.phones && contacts.phones.length > 0 && (
          <div className="contact-item">
            <div className="contact-icon">☎️</div>
            <div className="contact-details">
              {contacts.phones.map((phone: string, i: number) => (
                <div key={i} className="contact-line">
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emails */}
        {contacts.emails && contacts.emails.length > 0 && (
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <div className="contact-details">
              {contacts.emails.map((email: string, i: number) => (
                <div key={i} className="contact-line">
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Website */}
        {contacts.website && (
          <div className="contact-item">
            <div className="contact-icon">🌐</div>
            <div className="contact-details">
              <div className="contact-line">
                <a href={contacts.website} target="_blank" rel="noopener noreferrer">
                  {contacts.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Social media */}
        {(contacts.facebook || contacts.instagram || contacts.youtube || contacts.tiktok) && (
          <div className="contact-item social-item">
            {contacts.facebook && (
              <a href={contacts.facebook} className="social-link facebook" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">
                <img src="/img/social/facebook.png" alt="Facebook" />
              </a>
            )}
            {contacts.instagram && (
              <a href={contacts.instagram} className="social-link instagram" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">
                <img src="/img/social/instagram.png" alt="Instagram" />
              </a>
            )}
            {contacts.youtube && (
              <a href={contacts.youtube} className="social-link youtube" target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube">
                <img src="/img/social/youtube.png" alt="YouTube" />
              </a>
            )}
            {contacts.tiktok && (
              <a href={contacts.tiktok} className="social-link tiktok" target="_blank" rel="noopener noreferrer" title="TikTok" aria-label="TikTok">
                <img src="/img/social/tiktok.png" alt="TikTok" />
              </a>
            )}
          </div>
        )}

        {/* Dealers/Revendeurs */}
        {contacts.salesParts && (contacts.salesParts as any[]).length > 0 && (
          <div className="dealers-section">
            <div className="dealers-section-title">
              <span>🏪</span> Revendeurs agréés
            </div>
            <div className="dealers-grid">
              {(contacts.salesParts as any[]).map((dealer: any, i: number) => (
                <div key={i} className="dealer-card">
                  <div className="dealer-name">{dealer.name}</div>
                  {dealer.city && <div className="dealer-city">{dealer.city}</div>}
                  {dealer.address && <div className="dealer-address">{dealer.address}</div>}
                  {dealer.phone && (
                    <div className="dealer-phone">
                      <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>
                    </div>
                  )}
                  {dealer.mapUrl && (
                    <div className="dealer-map">
                      <a href={dealer.mapUrl} target="_blank" rel="noopener noreferrer">
                        📍 Voir sur la carte
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
