import { SchemaField, NumberField, StringField } from "foundry";

/**
 * Single defense value with linked attribute
 */
class DefenseData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      base: new NumberField({
        required: true,
        integer: true,
        initial: 2,
        label: "CONAN.Defense.Base"
      }),
      value: new NumberField({
        required: true,
        integer: true,
        initial: 5,
        min: 5,
        label: "CONAN.Defense.Value"
      }),
      attribute: new StringField({
        required: true,
        choices: ["might", "edge", "grit", "wits"],
        label: "CONAN.Defense.Attribute"
      })
    };
  }
}

/**
 * Physical and Sorcery defenses
 */
export default class DefensesData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      physical: new SchemaField({
        ...DefenseData.defineSchema(),
        attribute: new StringField({
          required: true,
          initial: "edge",
          choices: ["might", "edge", "grit", "wits"]
        })
      }),
      sorcery: new SchemaField({
        ...DefenseData.defineSchema(),
        attribute: new StringField({
          required: true,
          initial: "wits",
          choices: ["might", "edge", "grit", "wits"]
        })
      })
    };
  }
}