class E2 {
  constructor(e3) {
    this.e3 = e3;
  }

  static get $provides() {
    return "e2";
  }

  static get $requires() {
    return ["e3"];
  }
}

module.exports = E2;
