import { SchemaField, NumberField, StringField } from "foundry";

/**
 * Single attribute definition (e.g., Might, Edge)
 */
class AttributeData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      value: new NumberField({
        required: true,
        integer: true,
        min: 1,
        max: 8,
        initial: 1,
        label: "CONAN.Attribute.Value"
      }),
      die: new StringField({
        required: true,
        choices: ["d6", "d8", "d10"],
        initial: "d6",
        label: "CONAN.Attribute.Die"
      })
    };
  }

  /** 
   * Parse die notation to max value 
   * @returns {number}
   */
  get dieMax() {
    return parseInt(this.die.slice(1));
  }
}

/**
 * All four core attributes
 */
export default class AttributesData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      might: new SchemaField(AttributeData.defineSchema()),
      edge: new SchemaField(AttributeData.defineSchema()),
      grit: new SchemaField(AttributeData.defineSchema()),
      wits: new SchemaField(AttributeData.defineSchema())
    };
  }
}