import ConanItemSheet from "./ConanItemSheet.mjs";

export default class SpellSheet extends ConanItemSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "spell"]
  };

  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/spell-attributes.hbs"
    }
  };
}