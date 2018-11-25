class E3 {
  constructor(e1) {
    this.e1 = e1;
  }

  static get $provides() {
    return "e3";
  }

  static get $requires() {
    return ["e1"];
  }
}

module.exports = E3;
