import { SchemaField, NumberField, HTMLField } from "foundry";

export default class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      effect: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Talent.Effect",
        hint: "CONAN.Talent.EffectHint"
      }),
      
      uses: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Talent.Uses.Value"
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Talent.Uses.Max",
          hint: "CONAN.Talent.Uses.MaxHint"
        })
      }),
      
      description: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }

  /**
   * Check if talent has limited uses
   * @returns {boolean}
   */
  get hasLimitedUses() {
    return this.uses.max > 0;
  }

  /**
   * Check if talent has uses remaining
   * @returns {boolean}
   */
  get hasUsesRemaining() {
    return !this.hasLimitedUses || this.uses.value > 0;
  }
}