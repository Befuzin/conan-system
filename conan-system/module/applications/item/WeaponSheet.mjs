import ConanItemSheet from "./ConanItemSheet.mjs";

/**
 * Weapon-specific sheet
 */
export default class WeaponSheet extends ConanItemSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "weapon"]
  };

  /** @override */
  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/weapon-attributes.hbs"
    }
  };
}