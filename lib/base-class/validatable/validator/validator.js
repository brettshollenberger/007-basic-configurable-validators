angular
  .module('BaseClass')
  .factory('BCValidatable.Validator', ['BCValidatable.ValidationFn', 
  function(ValidationFn) { 
    function Validator(validationFn) {
      this.name    = validationFn.name;
      this.message = validationFn.message;
      this.configure = function(options) {
        options = defaultOptions(options);
        return new ValidationFn(validationFn, _.defaults(options, this));
      }

      function defaultOptions(options) {
        if (!_.isObject(options)) options = {value: options, message: this.message}
        if (!_.isUndefined(validationFn.name)) options[validationFn.name] = options.value;
        return options;
      }

    }

    return Validator;
  }]);

