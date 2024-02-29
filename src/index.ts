import * as handlebars from "handlebars";

export {run} from '@oclif/core'

handlebars.registerHelper("raw", function(options) {
  console.log(options)
  return options.fn();
});

