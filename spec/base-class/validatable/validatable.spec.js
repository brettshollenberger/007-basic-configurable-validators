describe("BCValidatable", function() {

  var Validatable, Validator;
  beforeEach(inject(["BCValidatable", "BCValidatable.Validator", 
  function(_BCValidatable_, _BCValidator_) {
    Validatable = _BCValidatable_;
    Validator   = _BCValidator_;
  }]));

  // # Validators
  // =============
  //
  // Validators are registerable, configurable constructors that return validation functions, which
  // are capable of validating values and reporting error messages.
  //
  //    factory('MinValidator', ['Validatable.Validator', function(Validator) {
  //      function min(value) {
  //        return value.length >= this.min;
  //      }
  //
  //      min.message = function() {
  //        return "must be greater than " + this.min + " characters.";
  //      }
  //
  //      return new Validator(min);
  //    }]);
  //
  // By registering this function as a validator, we obtain the ability to use it in our models:
  //
  //    Post.validates({
  //      title: {
  //        min: 5
  //      }
  //    });
  //
  // In low-level terms, registered validators expose one function, configure:
  //
  //    // example from above
  //    MinValidator.configure(5);
  //
  //    // with additional options
  //    MinValidator.configure({value: 5, message: "Must be larger than that."});
  //
  // ## Define Arbitrary Configuration Options
  // ========================================== 
  //
  // A configured validator returns a validation function, with its error message and options
  // set. The options are all exposed on the context of the validation function:
  //
  //    function numericality(value) {
  //      if (this.ignore) value = value.replace(this.ignore, '');
  //      return !(isNaN(value));
  //    }
  //
  //    moneyValidationFn = NumericalityValidator.configure({
  //      ignore: /^\$/
  //    });
  //
  // Each field on your models can configure the validator with different options.
  //
  // ## Registering Validators with Children
  // ========================================
  //
  // Sometimes we want to describe a collection of validations under the same name in our DSL:
  //
  //    Post.validates({
  //      title: {
  //        length: {
  //          min: 5,
  //          max: 10
  //        }
  //      }
  //    });
  //
  // Here we say that the length validator has two children--in this example, the user is actually
  // naming two separate validators--min & max length.
  //
  // To create this grouping of validators:
  //
  // 1) Create the children
  //
  //    factory('MinValidator', ['Validator', function() {
  //      ...
  //      return new Validator(min);
  //    }]);
  //
  //    factory('MaxValidator', ['Validator', function() {
  //      ...
  //      return new Validator(max);
  //    }]);
  //
  // 2) Name the children as options of the parent:
  //
  //    factory('LengthValidator', ['MinValidator', 'MaxValidator', 'Validatable.Validator', 
  //      function(min, max, Validator) {
  //
  //      function length() {}
  //
  //      length.options = {
  //        min: minValidator,
  //        max: maxValidator
  //      }
  //
  //      return new Validator(length);
  //    }]);
  //
  // Configuring LengthValidator will now configure any associated children:
  //
  //    // example above
  //    LengthValidator.configure({
  //      min: 5,
  //      max: 10
  //    });
  //
  //    // calls
  //    MinValidator.configure(5);
  //    MaxValidator.configure(10);
  //
  //    // returns
  //    [configuredMinFn, configuredMaxFn]
  //
  // ## Interaction with the Validatable Module
  // ===========================================
  //
  // Validatable itself exposes the method #validates, which sets the collection of validations for 
  // each model it is mixed into. When it receives a configuration like:
  //
  //    Post.validates({
  //      title: {
  //        required: true,
  //        length: { in: _.range(1, 20) }
  //      },
  //      slug: {
  //        ...
  //      }
  //    });
  //
  // It loops through each field, takes the name of each validation, and configures the validation,
  // passing in the options provided. It will either receive in return a single configured validation
  // function, or an array of configured validation functions (as in the case of the LengthValidator).
  //
  // It transforms each validation function it receives into a Validation--a combination of the
  // field name, validation function, and message.
  //
  // When a Validatable model calls #validate([field]) on a particular instance, under the covers 
  // Validatable checks the validations for the specified field (or all fields if none is provided),
  // and hands off the request to each Validation. Validation#validate receives an instance, and
  // already knows which field to validate, which configured validation function to call, and
  // what error message to return in the case the value is invalid.
  describe("Validators that receive values", function() {
    var minValidator, configuredMinFn;
    beforeEach(function() { 
      function min(value) {
        return value.length >= this.min;
      }

      min.message = function() {
        return "Must be greater than " + this.min;
      }

      minValidator    = new Validator(min);
      configuredMinFn = minValidator.configure(5);
    });

    it("curries in the configured values to the validationFn", function() { 
      expect(configuredMinFn("hello")).toEqual(true);
      expect(configuredMinFn("hi")).toEqual(false);
    });

    it("configures the message", function() { 
      expect(configuredMinFn.message).toEqual("Must be greater than 5");
    });
  });
});
