export default function Footer() {
  return (
    <footer className="footer bg-black text-white py-8 mt-0" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm md:text-base">
              Copyright © 2026 actumoto.tn - Tous droits réservés
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <a
              href="mailto:marwenmahroug@gmail.com"
              className="text-sm md:text-base text-white hover:text-red-300 transition-colors"
              aria-label="Nous contacter par email"
            >
              actumoto.tn@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
