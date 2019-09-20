module.exports = {
  isEmpty: function(str) { return !str || 0 === str.length },
  isAnyEmpty: function(arr) { return arr.find(s => this.isEmpty(s)) !== undefined }
}