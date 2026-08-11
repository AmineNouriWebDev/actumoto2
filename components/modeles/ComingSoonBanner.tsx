"use client";

import React from "react";

export default function ComingSoonBanner() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-full min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
        fontFamily: "var(--font-rajdhani)",
        overflow: "hidden",
      }}
    >
      {/* Background animated elements */}
      <div
        className="absolute rounded-full opacity-20 pointer-events-none"
        style={{
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, #ff0000, transparent)",
          top: "-50px",
          right: "-50px",
          animation: "float-anim 20s infinite ease-in-out",
        }}
      />
      <div
        className="absolute rounded-full opacity-20 pointer-events-none"
        style={{
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, #ff0000, transparent)",
          bottom: "-50px",
          left: "-50px",
          animation: "float-anim 25s infinite ease-in-out reverse",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center">
        <h2
          className="coming-soon-title"
          style={{
            fontFamily: "var(--font-orbitron)",
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            color: "#ffffff",
            margin: "0 0 1rem 0",
            textShadow: "0 0 30px rgba(255, 0, 0, 0.5)",
            letterSpacing: "2px",
            fontWeight: 700,
          }}
        >
          Coming Soon
        </h2>
        <p
          style={{
            fontSize: "clamp(1rem, 4vw, 1.5rem)",
            color: "#ff0000",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "3px",
            animation: "pulse-anim 2s ease-in-out infinite",
          }}
        >
          Bientôt disponible
        </p>
        
        <div className="mt-12">
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #ff0000, #cc0000)",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
              border: "2px solid transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(255, 0, 0, 0.4)";
              e.currentTarget.style.borderColor = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            Retour à l'Accueil
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-anim {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(30px, -30px);
          }
          50% {
            transform: translate(0, -60px);
          }
          75% {
            transform: translate(-30px, -30px);
          }
        }

        @keyframes pulse-anim {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
