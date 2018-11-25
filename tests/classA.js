class A {
  constructor(b, c) {
    this.b = b;
    this.c = c;
  }

  static get $provides() {
    return "a";
  }

  static get $requires() {
    return ["b", "c"];
  }
}

module.exports = A;
