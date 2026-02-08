import ConanActorSheet from "./ConanActorSheet.mjs";

/**
 * Character-specific sheet
 */
export default class CharacterSheet extends ConanActorSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "character"]
  };

  /** @override */
  static PARTS = {
    ...super.PARTS,
    header: {
      template: "systems/conan-system/templates/actor/character-header.hbs"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Add Character-specific context
    context.originBonuses = this._getOriginBonuses();
    
    return context;
  }

  /**
   * Get origin bonuses for display
   * @returns {Array<string>}
   * @private
   */
  _getOriginBonuses() {
    // This would come from a config or compendium
    // For now, just a placeholder
    return [];
  }
}