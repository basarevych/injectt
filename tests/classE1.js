class E1 {
  constructor(e2) {
    this.e2 = e2;
  }

  static get $provides() {
    return "e1";
  }

  static get $requires() {
    return ["e2"];
  }
}

module.exports = E1;
