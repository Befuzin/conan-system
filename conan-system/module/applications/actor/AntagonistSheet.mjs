import ConanActorSheet from "./ConanActorSheet.mjs";

/**
 * Antagonist-specific sheet
 */
export default class AntagonistSheet extends ConanActorSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "antagonist"]
  };

  /** @override */
  static PARTS = {
    ...super.PARTS,
    header: {
      template: "systems/conan-system/templates/actor/antagonist-header.hbs"
    }
  };
}