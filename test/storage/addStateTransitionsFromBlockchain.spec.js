/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');

const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

use(sinonChai);

const addStateTransitionsFromBlockchain = require('../../lib/storage/addStateTransitionsFromBlockchain');
const StateTransitionHeader = require('../../lib/blockchain/StateTransitionHeader');
const StateTransitionHeaderIterator = require('../../lib/blockchain/StateTransitionHeaderIterator');

describe('Storage', () => {
  describe('addStateTransitionsFromBlockchain', () => {
    let transitionHeaders;
    let ipfsAPIMock;
    let stateTransitionHeaderIteratorMock;
    let nextStab;

    beforeEach(function beforeEach() {
      if (!this.sinon) {
        this.sinon = sinon.sandbox.create();
      } else {
        this.sinon.restore();
      }

      const transitionHeadersJSON = fs.readFileSync(path.join(__dirname, '/../fixtures/stateTransitionHeaders.json'));
      const transitionHeadersData = JSON.parse(transitionHeadersJSON);
      transitionHeaders = transitionHeadersData.map(header => new StateTransitionHeader(header));

      // Mock IPFS API
      class IpfsAPI {
        constructor() {
          this.pin = {};
        }
      }

      ipfsAPIMock = new IpfsAPI();
      ipfsAPIMock.pin.add = this.sinon.spy();

      // Mock StateTransitionHeaderIterator
      stateTransitionHeaderIteratorMock = new StateTransitionHeaderIterator({
        rpcClient: {
          getTransitionHeader() {},
        },
      });

      nextStab = this.sinon.stub(stateTransitionHeaderIteratorMock, 'next');
      let currentHeaderIndex = 0;
      nextStab.callsFake(() => {
        if (!transitionHeaders[currentHeaderIndex]) {
          return Promise.resolve({ done: true });
        }

        const currentHeader = transitionHeaders[currentHeaderIndex];

        currentHeaderIndex++;

        return Promise.resolve({ done: false, value: currentHeader });
      });
    });

    it('should pin ST packets by hash from ST headers from blockchain', async () => {
      await addStateTransitionsFromBlockchain(ipfsAPIMock, stateTransitionHeaderIteratorMock);

      expect(nextStab).has.callCount(transitionHeaders.length + 1);

      expect(ipfsAPIMock.pin.add).has.callCount(transitionHeaders.length);

      transitionHeaders.forEach((header) => {
        expect(ipfsAPIMock.pin.add).to.be.calledWith(header.storageHash, { recursive: true });
      });
    });
  });
});