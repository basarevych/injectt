class D1 {
  constructor() {}

  static get $provides() {
    return "d1";
  }

  static get $requires() {
    return ["non-existent"];
  }
}

module.exports = D1;
