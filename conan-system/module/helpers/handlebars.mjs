/**
 * Register custom Handlebars helpers
 */
export function registerHandlebarsHelpers() {
  
  /**
   * Concatenate strings
   */
  Handlebars.registerHelper('concat', function() {
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  /**
   * Check if values are equal
   */
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  /**
   * Check if value is greater than
   */
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  /**
   * Check if value is less than
   */
  Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });

  /**
   * Lowercase a string
   */
  Handlebars.registerHelper('lowercase', function(str) {
    return str.toLowerCase();
  });

  /**
   * Uppercase a string
   */
  Handlebars.registerHelper('uppercase', function(str) {
    return str.toUpperCase();
  });

  /**
   * Times block helper for iteration
   */
  Handlebars.registerHelper('times', function(n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  /**
   * Get the max value from a die notation (e.g., "1d6" returns 6)
   */
  Handlebars.registerHelper('dieMax', function(dieNotation) {
    const match = dieNotation?.match(/\d*d(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
}
