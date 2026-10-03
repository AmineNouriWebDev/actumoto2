#!/bin/bash
for file in app/\(public\)/categories/\[categorie\]/page.tsx app/\(public\)/marques/\[marque\]/\[modele\]/page.tsx app/\(public\)/marques/\[marque\]/page.tsx; do
  sed -i 's/export async function generateStaticParams() {/export async function generateStaticParams() {\n  if (process.env.DOCKER_BUILD === "1") return [];/' "$file"
done
