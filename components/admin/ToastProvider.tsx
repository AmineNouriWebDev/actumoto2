"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const successMsg = searchParams.get("success");
    const errorMsg = searchParams.get("error");

    if (successMsg) {
      toast.success(decodeURIComponent(successMsg), {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }

    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg), {
        position: "bottom-right",
        autoClose: 5000,
        theme: "dark",
      });
    }

    if (successMsg || errorMsg) {
      // Nettoyer l'URL sans recharger la page
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("success");
      newSearchParams.delete("error");
      
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
        
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}

export default function ToastProvider() {
  return (
    <>
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>
      <ToastContainer />
    </>
  );
}
