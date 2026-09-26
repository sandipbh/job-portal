const nameFieldKeys = new Set(["fullname", "candidatefullname", "name", "candidatename"]);

function findStringField(value, fieldKeys, depth = 0, visited = new Set()) {
    if (!value || typeof value !== "object" || depth > 5 || visited.has(value)) return "";
    visited.add(value);

    for (const [key, fieldValue] of Object.entries(value)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
        if (fieldKeys.has(normalizedKey) && typeof fieldValue === "string" && fieldValue.trim()) {
            return fieldValue.trim();
        }
    }

    for (const fieldValue of Object.values(value)) {
        const found = findStringField(fieldValue, fieldKeys, depth + 1, visited);
        if (found) return found;
    }

    return "";
}

export function getCandidateIdentityFromToken(tokenValue) {
    try {
        const token = JSON.parse(tokenValue || "{}");
        const external = token?.external || {};
        const identitySources = [external, token?.user, token];
        //console.log("Identity Sources:", JSON.stringify(identitySources));
        return {
            fullName: findStringField(identitySources, nameFieldKeys),
            candidateId: external?.uqId || token?.UqId || "",
            role: external?.role || "",
        };
    } catch {
        return { fullName: "", candidateId: "", role: "" };
    }
}