"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
}

export default function ModelFilters({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const search = searchParams.get("search") || "";
  const brandFilter = searchParams.get("brand") || "";
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filtering
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateFilters("search", val);
    }, 400); // 400ms debounce
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters("brand", e.target.value);
  };

  return (
    <div className="admin-filters">
      <input
        type="text"
        placeholder="🔍 Rechercher par nom..."
        defaultValue={search}
        onChange={handleSearchChange}
        className="admin-search"
      />
      <select defaultValue={brandFilter} onChange={handleBrandChange} className="admin-select">
        <option value="">-- Toutes les marques --</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {(search || brandFilter) && (
        <Link href="/admin/modeles" className="admin-clear-btn">✕ Effacer</Link>
      )}
    </div>
  );
}
