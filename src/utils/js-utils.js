const concatStringReducer = (separator) =>
  (accumulator, value, i) => i === 0
    ? value
    : accumulator + separator + value

module.exports = { concatStringReducer }