import prisma from "@/lib/prisma";

interface BrandContactsSectionProps {
  brand: string;
}

export default async function BrandContactsSection({ brand }: BrandContactsSectionProps) {
  const brandData = await prisma.brand.findUnique({
    where: { name: brand },
    include: { dealerContact: true }
  });
  
  if (!brandData || !brandData.dealerContact) return null;
  
  const contacts = brandData.dealerContact;
  let displayMode = "text"; // Or whatever default is preferred

  return (
    <div className="brand-contacts-wrapper">
      <div className="brand-contacts">
        <h2 className="contacts-title futurist-font">Concessionnaire {brand}</h2>
        
        {/* Address */}
        {contacts.showroomAddress && (
          displayMode === "maps" && contacts.showroomLocation ? (
            <div className="contact-item maps-item">
              <div className="maps-container">
                <iframe
                  className="maps-iframe"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(contacts.showroomAddress + ", Tunisia")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  style={{ border: 0 }}
                  aria-label={`Google Maps - ${contacts.showroomAddress}`}
                />
                <a
                  href={contacts.showroomLocation}
                  className="maps-link-open"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvrir dans Google Maps"
                >
                  <span>📍 Voir sur Google Maps</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-details">
                <div className="contact-line">{contacts.showroomAddress}</div>
              </div>
            </div>
          )
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
                  <div className="dealer-card-name">{dealer.name}</div>
                  {dealer.city && <div className="dealer-card-city">{dealer.city}</div>}
                  {dealer.address && <div className="dealer-card-address">{dealer.address}</div>}
                  <div className="dealer-card-footer">
                    {dealer.phone && (
                      <a href={`tel:${dealer.phone}`} className="dealer-card-phone">{dealer.phone}</a>
                    )}
                    {dealer.mapUrl && (
                      <a href={dealer.mapUrl} className="dealer-card-map-link" target="_blank" rel="noopener noreferrer">
                        📍 Carte
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
