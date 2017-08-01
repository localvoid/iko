const iko = require("iko");

describe("hello suite", () => {
  it("aaa", () => {
  });
  it("should fail", () => {
    iko.expect(123).toBeApproximatelyEqual(234);
  });
});
