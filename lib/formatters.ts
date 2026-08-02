// Formatters pour afficher les spécifications avec unités

/**
 * Formate une spécification pour occasionModelsData
 * Les valeurs sont déjà formatées comme du texte, on les affiche juste avec "-" si vides
 */
function formatOccasionSpecification(key: string, value: any) {
    if (value === null || value === undefined || value === "" || value === "Environ 180 km/h") {
        return "-";
    }
    return value;
}

/**
 * Formate une spécification avec son unité appropriée
 * @param {string} key - La clé de la spécification (ex: "cylindree", "puissance")
 * @param {any} value - La valeur
 * @param {string} fuelType - Type de carburant ("Thermique" ou "Electrique")
 * @returns {string} - Valeur formatée avec unité
 */
function formatSpecification(key: string, value: any, fuelType = "Thermique") {
    // Si la valeur est null ou vide, retourner "-"
    if (value === null || value === undefined || value === "") {
        return "-";
    }



    const specs: Record<string, any> = {
        // Unités simples
        "kilometrage": (v: any) => v, // Déjà formaté avec "km" dans les données
        "cylindree": (v: any) => String(v).toLowerCase().includes('cc') ? v : `${v} cc`,
        "coupleMaximal": (v: any) => String(v).toLowerCase().includes('nm') ? v : `${v} Nm`,
        "vitesseMaximale": (v: any) => String(v).toLowerCase().includes('km/h') ? v : `${v} km/h`,
        "refroidissement": (v: any) => v,
        "typeMoteur": (v: any) => v,
        "alimentation": (v: any) => v,
        "freinage": (v: any) => v,
        "systemeFreinage": (v: any) => v,

        // Unités conditionnelles selon fuelType
        "puissance": (v: any, fuel: any) => {
            if (fuel === "Electrique") {
                return String(v).toLowerCase().includes('w') ? v : `${Math.round(v)} W`;
            }
            return String(v).toLowerCase().includes('ch') ? v : `${v} ch`;
        },

        // Unités selon fuelType
        "tankCapacity": (v: any) => {
            if (v === null || v === undefined || v === "") return "-";
            return String(v).toLowerCase().includes('litre') ? v : `${v} Litres`;
        },

        "autonomie": (v: any) => {
            if (v === null || v === undefined || v === "") return "-";
            return String(v).toLowerCase().includes('km') ? v : `${v} Km`;
        },

        // Prix
        "price": (v: any) => {
            if (v === null || v === undefined) return "En arrivage";
            return `${v.toLocaleString('fr-FR')} TND`;
        }
    };

    const formatter = specs[key];
    if (!formatter) return value;

    return typeof formatter === 'function' 
        ? formatter(value, fuelType) 
        : formatter;
}

/**
 * Retourne les specs à afficher en fonction du type de carburant
 * @param {Object} model - Objet modèle avec toutes les specs
 * @returns {Object} - Specs à afficher
 */
function getDisplaySpecs(model: any) {
    const { specs, fuelType } = model;
    const display = { ...specs };

    if (fuelType === "Electrique") {
        // Pour électrique: afficher autonomie, PAS tankCapacity
        delete display.tankCapacity;
    } else if (fuelType === "Thermique") {
        // Pour thermique: afficher tankCapacity, PAS autonomie
        delete display.autonomie;
    }

    return display;
}

/**
 * Exemple d'utilisation dans le HTML
 * Pour afficher une fiche produit:
 */

// Exemple 1: Affichage simple
function displayModelCard(model: any) {
    const specs = getDisplaySpecs(model);
    
    let html = `
        <div class="model-card">
            <h3>${model.name}</h3>
            <div class="specs">
                <p><strong>Cylindrée:</strong> ${formatSpecification('cylindree', specs.cylindree)}</p>
                <p><strong>Puissance:</strong> ${formatSpecification('puissance', specs.puissance, model.fuelType)}</p>
                <p><strong>Couple Max:</strong> ${formatSpecification('coupleMaximal', specs.coupleMaximal)}</p>
                <p><strong>Vitesse Max:</strong> ${formatSpecification('vitesseMaximale', specs.vitesseMaximale)}</p>
                
                ${model.fuelType === "Thermique" 
                    ? `<p><strong>Réservoir:</strong> ${formatSpecification('tankCapacity', specs.tankCapacity)}</p>`
                    : `<p><strong>Autonomie:</strong> ${formatSpecification('autonomie', specs.autonomie)}</p>`
                }
                
                <p><strong>Freinage:</strong> ${formatSpecification('freinage', specs.freinage)}
                    ${specs.systemeFreinage ? ` - ${specs.systemeFreinage}` : ''}
                </p>
            </div>
        </div>
    `;
    
    return html;
}

// Exemple 2: Affichage dynamique avec boucle
function displayAllSpecs(model: any) {
    const specs = getDisplaySpecs(model);
    const specNames: Record<string, string> = {
        "typeMoteur": "Type Moteur",
        "cylindree": "Cylindrée",
        "puissance": "Puissance",
        "coupleMaximal": "Couple Maximal",
        "refroidissement": "Refroidissement",
        "tankCapacity": "Réservoir",
        "vitesseMaximale": "Vitesse Max",
        "autonomie": "Autonomie",
        "alimentation": "Alimentation",
        "freinage": "Freinage",
        "systemeFreinage": "Système Freinage"
    };

    let html = "<div class='specs-list'>";
    for (const [key, value] of Object.entries(specs)) {
        const label = specNames[key] || key;
        const formatted = formatSpecification(key, value, model.fuelType);
        html += `<div class='spec-item'>
                    <span class='label'>${label}:</span>
                    <span class='value'>${formatted}</span>
                 </div>`;
    }
    html += "</div>";
    
    return html;
}

// Export pour utilisation en module
export {
    formatSpecification,
    getDisplaySpecs,
    displayModelCard,
    displayAllSpecs
};
