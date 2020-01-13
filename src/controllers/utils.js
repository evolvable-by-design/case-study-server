module.exports = {
  isEmpty: function(str) { return !str || str === undefined || str.length === 0 },
  isAnyEmpty: function(arr) { return arr.filter(s => this.isEmpty(s)).length !== 0 }
}