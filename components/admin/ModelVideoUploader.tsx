"use client";

import { useState } from "react";
import { uploadVideo, deletePhysicalImage } from "@/lib/upload";

interface ModelVideoUploaderProps {
  initialVideoUrl?: string | null;
  initialYoutubeUrl?: string | null;
}

export default function ModelVideoUploader({
  initialVideoUrl,
  initialYoutubeUrl,
}: ModelVideoUploaderProps) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "youtube">(
    initialVideoUrl ? "upload" : "youtube"
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check: 200MB max
    if (file.size > 200 * 1024 * 1024) {
      alert("La vidéo ne doit pas dépasser 200 Mo.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadVideo(file, "videos");
      if (url) {
        // Remove old video if exists
        if (videoUrl && videoUrl.startsWith("/img/")) {
          await deletePhysicalImage(videoUrl);
        }
        setVideoUrl(url);
      } else {
        alert("Erreur lors de l'upload de la vidéo. Format non supporté.");
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveVideo = async () => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    if (videoUrl.startsWith("/img/")) {
      await deletePhysicalImage(videoUrl);
    }
    setVideoUrl("");
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1.25rem",
    border: "1px solid #e5e7eb",
    borderBottom: active ? "1px solid #fff" : "1px solid #e5e7eb",
    borderRadius: "6px 6px 0 0",
    background: active ? "#fff" : "#f9fafb",
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
    color: active ? "#ff0000" : "#374151",
    fontSize: "0.82rem",
    marginBottom: "-1px",
  });

  return (
    <div>
      {/* Inputs cachés passés au formulaire */}
      <input type="hidden" name="videoUrl" value={videoUrl} />
      <input type="hidden" name="youtubeUrl" value={youtubeUrl} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0", borderBottom: "1px solid #e5e7eb" }}>
        <button type="button" style={tabStyle(activeTab === "upload")} onClick={() => setActiveTab("upload")}>
          🎬 Fichier MP4
        </button>
        <button type="button" style={tabStyle(activeTab === "youtube")} onClick={() => setActiveTab("youtube")}>
          ▶️ YouTube
        </button>
      </div>

      <div style={{
        border: "1px solid #e5e7eb",
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        padding: "1.25rem",
        background: "#fff",
      }}>
        {/* Tab Upload MP4 */}
        {activeTab === "upload" && (
          <div>
            {videoUrl ? (
              <div>
                {/* Prévisualisation */}
                <video
                  src={videoUrl}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "280px",
                    borderRadius: "8px",
                    background: "#000",
                    marginBottom: "0.75rem",
                  }}
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <label
                    className="btn-secondary"
                    style={{ cursor: "pointer", fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                  >
                    {isUploading ? "⏳ Upload en cours..." : "🔄 Remplacer la vidéo"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    style={{
                      padding: "0.4rem 0.8rem",
                      background: "none",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "10px",
                  padding: "2.5rem",
                  cursor: isUploading ? "wait" : "pointer",
                  transition: "border-color 0.2s",
                  background: "#fafafa",
                  gap: "0.5rem",
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <span style={{ fontSize: "2.5rem" }}>🎬</span>
                <span style={{ fontWeight: 700, color: "#374151" }}>
                  {isUploading ? "⏳ Upload en cours..." : "Cliquer pour importer une vidéo"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                  MP4, WebM, MOV — Max 200 Mo
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        )}

        {/* Tab YouTube */}
        {activeTab === "youtube" && (
          <div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.82rem" }}>URL YouTube</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                style={{ marginBottom: "0.5rem" }}
              />
              <small style={{ color: "#6b7280", fontSize: "0.77rem" }}>
                La vidéo YouTube sera intégrée sur la page de détail.
              </small>
            </div>
            {youtubeUrl && (
              <button
                type="button"
                onClick={() => setYoutubeUrl("")}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.3rem 0.7rem",
                  background: "none",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                }}
              >
                ✕ Effacer l'URL
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
