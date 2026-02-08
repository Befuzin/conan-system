/**
 * Register custom Handlebars helpers
 */
export function registerHandlebarsHelpers() {
  
  /**
   * Concatenate strings
   */
  Handlebars.registerHelper("concat", function(...args) {
    // Remove the Handlebars options object from the end
    args.pop();
    return args.join("");
  });

  /**
   * Check if values are equal
   */
  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });

  /**
   * Check if value is greater than
   */
  Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  });

  /**
   * Check if value is less than
   */
  Handlebars.registerHelper("lt", function(a, b) {
    return a < b;
  });

  /**
   * Lowercase a string
   */
  Handlebars.registerHelper("lowercase", function(str) {
    return str?.toLowerCase() || "";
  });

  /**
   * Uppercase a string
   */
  Handlebars.registerHelper("uppercase", function(str) {
    return str?.toUpperCase() || "";
  });

  /**
   * Get the max value from a die notation (e.g., "1d6" returns 6)
   */
  Handlebars.registerHelper("dieMax", function(dieNotation) {
    const match = dieNotation?.match(/\d*d(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });

  /**
   * Math operations
   */
  Handlebars.registerHelper("math", function(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    
    switch (operator) {
      case "+": return lvalue + rvalue;
      case "-": return lvalue - rvalue;
      case "*": return lvalue * rvalue;
      case "/": return lvalue / rvalue;
      case "%": return lvalue % rvalue;
      case "abs": return Math.abs(lvalue);
      default: return lvalue;
    }
  });

  /**
   * Check if value is in array
   */
  Handlebars.registerHelper("includes", function(array, value) {
    return Array.isArray(array) && array.includes(value);
  });

  /**
   * Negate a boolean
   */
  Handlebars.registerHelper("not", function(value) {
    return !value;
  });

  /**
   * Logical AND
   */
  Handlebars.registerHelper("and", function(...args) {
    args.pop(); // Remove options
    return args.every(Boolean);
  });

  /**
   * Logical OR
   */
  Handlebars.registerHelper("or", function(...args) {
    args.pop(); // Remove options
    return args.some(Boolean);
  });
}
