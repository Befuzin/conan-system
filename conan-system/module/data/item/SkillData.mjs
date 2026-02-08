import { NumberField, StringField, HTMLField } from "foundry";

export default class SkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attribute: new StringField({
        required: true,
        choices: ["might", "edge", "grit", "wits"],
        initial: "might",
        label: "CONAN.Skill.Attribute"
      }),
      
      bonus: new NumberField({
        required: true,
        integer: true,
        initial: 0,
        label: "CONAN.Skill.Bonus",
        hint: "CONAN.Skill.BonusHint"
      }),
      
      effect: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Skill.Effect",
        hint: "CONAN.Skill.EffectHint"
      }),
      
      description: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }
}