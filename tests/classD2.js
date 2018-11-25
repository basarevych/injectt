class D2 {
  constructor(result) {
    this.result = result;
  }

  static get $provides() {
    return "d2";
  }

  static get $requires() {
    return ["non-existent?"];
  }
}

module.exports = D2;
