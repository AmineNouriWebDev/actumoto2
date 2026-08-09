"use client";

import { useState } from "react";

interface DetailGalleryProps {
  images: string[];
  modelName: string;
  brandName: string;
}

export default function DetailGallery({ images, modelName, brandName }: DetailGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const fixPath = (path: string) =>
    path ? path.replace(/^\.\//, "/") : "/img/placeholder-moto.jpg";

  const imgs = images.length > 0 ? images.map(fixPath) : ["/img/placeholder-moto.jpg"];

  return (
    <div className="detail-gallery">
      {/* Image principale */}
      <div className="detail-main-image-wrap">
        <img
          src={imgs[activeIdx]}
          alt={`${brandName} ${modelName}`}
          onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
        />
      </div>

      {/* Miniatures */}
      {imgs.length > 1 && (
        <div className="detail-thumbnails">
          {imgs.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${modelName} vue ${i + 1}`}
              className={`detail-thumb ${activeIdx === i ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
