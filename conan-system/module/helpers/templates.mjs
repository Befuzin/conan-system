/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  return loadTemplates([
    // Actor partials
    "systems/conan-system/templates/actor/parts/actor-stats.hbs",
    "systems/conan-system/templates/actor/parts/actor-items.hbs",
    "systems/conan-system/templates/actor/parts/actor-effects.hbs",
    
    // Item partials
    "systems/conan-system/templates/item/parts/item-effects.hbs",
    
    // Chat message templates
    "systems/conan-system/templates/chat/stat-check.hbs",
    "systems/conan-system/templates/chat/attack-roll.hbs",
    "systems/conan-system/templates/chat/damage-roll.hbs"
  ]);
}
