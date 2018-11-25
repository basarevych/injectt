class B {
  constructor(c) {
    this.c = c;
  }

  static get $provides() {
    return "b";
  }

  static get $requires() {
    return ["c"];
  }
}

module.exports = B;
