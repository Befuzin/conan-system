import { NumberField, StringField, HTMLField } from "foundry";

export default class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      cost: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1,
        label: "CONAN.Spell.Cost",
        hint: "CONAN.Spell.CostHint"
      }),
      
      range: new StringField({
        required: true,
        choices: ["touch", "close", "medium", "long", "distant"],
        initial: "close",
        label: "CONAN.Spell.Range"
      }),
      
      effect: new foundry.data.fields.HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Spell.Effect"
      }),
      
      description: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }
}