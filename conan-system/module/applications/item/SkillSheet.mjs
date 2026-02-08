import ConanItemSheet from "./ConanItemSheet.mjs";

export default class SkillSheet extends ConanItemSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "skill"]
  };

  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/skill-attributes.hbs"
    }
  };
}