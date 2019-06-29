"use strict";
const assert = require("assert");
const ProtocolStore = require("./InMemorySignalProtocolStore.js");
var protocolStore = new ProtocolStore();
const api = require("../src/index.js");
const libsignal = require("@throneless/libsignal-protocol");

describe("Protocol Wrapper", function thisNeeded() {
  const identifier = "+5558675309";

  this.timeout(5000);

  before(done => {
    protocolStore.clear();
    api.KeyHelper.generateIdentityKeyPair()
      .then(key => protocolStore.saveIdentity(identifier, key.pubKey))
      .then(() => {
        done();
      });
  });
  describe("processPreKey", function() {
    it("rejects if the identity key changes", function() {
      var address = new libsignal.SignalProtocolAddress(identifier, 1);
      var builder = new libsignal.SessionBuilder(protocolStore, address);
      return builder
        .processPreKey({
          identityKey: api.KeyHelper.getRandomBytes(33),
          encodedNumber: address.toString()
        })
        .then(() => {
          throw new Error("Allowed to overwrite identity key");
        })
        .catch(e => {
          assert.strictEqual(e.message, "Identity key changed");
        });
    });
  });
});
