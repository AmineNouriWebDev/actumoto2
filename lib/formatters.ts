// Formatters pour afficher les spécifications avec unités

/**
 * Formate une spécification pour occasionModelsData
 * Les valeurs sont déjà formatées comme du texte, on les affiche juste avec "-" si vides
 */
function formatOccasionSpecification(key, value) {
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
function formatSpecification(key, value, fuelType = "Thermique") {
    // Si la valeur est null ou vide, retourner "-"
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    // Si c'est une chaîne (occasionModelsData), retourner telle quelle
    if (typeof value === 'string') {
        return value;
    }

    const specs = {
        // Unités simples
        "kilometrage": (v) => v, // Déjà formaté avec "km" dans les données
        "cylindree": (v) => `${v} cc`,
        "coupleMaximal": (v) => `${v} Nm`,
        "vitesseMaximale": (v) => `${v} km/h`,
        "refroidissement": (v) => v,
        "typeMoteur": (v) => v,
        "alimentation": (v) => v,
        "freinage": (v) => v,
        "systemeFreinage": (v) => v,

        // Unités conditionnelles selon fuelType
        "puissance": (v, fuel) => {
            if (fuel === "Electrique") {
                return `${Math.round(v)} W`;
            }
            return `${v} ch`;
        },

        // Unités selon fuelType
        "tankCapacity": (v) => {
            if (v === null || v === undefined || v === "") return "-";
            return `${v} L`;
        },

        "autonomie": (v) => {
            if (v === null || v === undefined || v === "") return "-";
            return `${v} km`;
        },

        // Prix
        "price": (v) => {
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
function getDisplaySpecs(model) {
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
function displayModelCard(model) {
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
function displayAllSpecs(model) {
    const specs = getDisplaySpecs(model);
    const specNames = {
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
