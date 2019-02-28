const messages = {
  required: "{{ field }} is required",
  max: "{{ field }} cannot more than {{ argument.0 }} characters",
  min: "{{ field }} cannot less than {{ argument.0 }} characters",
  unique: "{{ field }} is exists",
  integer: "{{ field }} should be an integer value",
  boolean: "{{ field }} should be a boolean"
};

module.exports = messages;
