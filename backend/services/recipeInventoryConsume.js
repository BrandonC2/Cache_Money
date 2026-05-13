const InventoryItem = require("../models/InventoryItem");

const normalize = (value) => String(value || "").trim().toLowerCase();

function buildRequirements(ingredients) {
  return (ingredients || [])
    .filter((ing) => (Number(ing.quantity) || 0) > 0 && normalize(ing.name))
    .map((ing) => ({
      name: ing.name,
      unit: ing.unit || "",
      quantity: Number(ing.quantity) || 0,
    }));
}

/**
 * Deduct recipe ingredients from the user's inventory (FIFO by createdAt within name/unit match).
 * @returns {Promise<{ ok: true } | { ok: false, missing: object[], message: string }>}
 */
async function consumeRecipeInventory(userId, ingredients) {
  const inventory = await InventoryItem.find({ userId });
  const requirements = buildRequirements(ingredients);

  if (requirements.length === 0) {
    return { ok: true };
  }

  const missing = [];
  for (const reqIng of requirements) {
    const requiredName = normalize(reqIng.name);
    const requiredUnit = normalize(reqIng.unit);
    const candidates = inventory.filter((inv) => {
      if (normalize(inv.name) !== requiredName) return false;
      const invUnit = normalize(inv.unit);
      if (!requiredUnit || !invUnit) return true;
      return invUnit === requiredUnit;
    });

    const available = candidates.reduce(
      (sum, inv) => sum + (Number(inv.quantity) || 0),
      0
    );
    if (available < reqIng.quantity) {
      missing.push({
        name: reqIng.name,
        unit: reqIng.unit || "",
        required: reqIng.quantity,
        available,
        missing: Math.max(0, reqIng.quantity - available),
      });
    }
  }

  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: "Not enough ingredients in inventory to cook this dish.",
    };
  }

  for (const reqIng of requirements) {
    const requiredName = normalize(reqIng.name);
    const requiredUnit = normalize(reqIng.unit);
    const candidates = inventory
      .filter((inv) => {
        if (normalize(inv.name) !== requiredName) return false;
        const invUnit = normalize(inv.unit);
        if (!requiredUnit || !invUnit) return true;
        return invUnit === requiredUnit;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let remaining = reqIng.quantity;
    for (const invItem of candidates) {
      if (remaining <= 0) break;
      const currentQty = Number(invItem.quantity) || 0;
      const taken = Math.min(currentQty, remaining);
      invItem.quantity = currentQty - taken;
      remaining -= taken;
    }
  }

  for (const invItem of inventory) {
    if ((Number(invItem.quantity) || 0) <= 0) {
      await InventoryItem.findByIdAndDelete(invItem._id);
    } else {
      await invItem.save();
    }
  }

  return { ok: true };
}

module.exports = { consumeRecipeInventory };
