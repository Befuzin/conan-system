import { NumberField, BooleanField, HTMLField } from "foundry";

export default class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quantity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1,
        label: "CONAN.Gear.Quantity"
      }),
      
      isBundle: new BooleanField({
        required: true,
        initial: true,
        label: "CONAN.Gear.IsBundle",
        hint: "CONAN.Gear.IsBundleHint"
      }),
      
      description: new foundry.data.fields.HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }
}