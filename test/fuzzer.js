var expect    = require("chai").expect;
var main = require("../main");

describe("Sanity check", function() {
  describe("mutationTesting runs", function() {
    it("doesn't crash", function() {
        main.mutationTesting(['test.md','simple.md'],100);
    });
  });

  describe("fuzzer works", function() {
    it("mutate string", function() {
        main.fuzzer.mutateString("hello");
    });
  });
});