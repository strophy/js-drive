const sinon = require('sinon');
const getValidatorSetInfoFactory = require('../../../lib/core/getValidatorSetInfoFactory');

describe('getValidatorSetInfo', () => {
  let coreRpcClientMock;
  let coreRpcClientMockQuorumDoesntExistError;
  let coreRpcClientMockUnkownError;
  let validatorsFixture;
  let llmqType;
  let quorumHash;
  let noSuchQuorumError;
  let unknownError;
  let loggerMock;

  beforeEach(() => {
    if (!this.sinon) {
      this.sinon = sinon.createSandbox();
    } else {
      this.sinon.restore();
    }

    validatorsFixture = [
      {
        proTxHash: 'c286807d463b06c7aba3b9a60acf64c1fc03da8c1422005cd9b4293f08cf0562',
        pubKeyOperator: '06abc1c890c9da4e513d52f20da1882228bfa2db4bb29cbd064e1b2a61d9dcdadcf0784fd1371338c8ad1bf323d87ae6',
        valid: true,
      },
      {
        proTxHash: 'a3e1edc6bd352eeaf0ae58e30781ef4b127854241a3fe7fddf36d5b7e1dc2b3f',
        pubKeyOperator: '04d748ba0efeb7a8f8548e0c22b4c188c293a19837a1c5440649279ba73ead0c62ac1e840050a10a35e0ae05659d2a8d',
        valid: true,
      },
    ];

    coreRpcClientMock = {
      quorum: this.sinon.stub().resolves({
        result: {
          members: validatorsFixture,
        },
        error: null,
        id: 5,
      }),
    };

    noSuchQuorumError = new Error({ code: -8 });
    coreRpcClientMockQuorumDoesntExistError = {
      quorum: this.sinon.stub().throws(noSuchQuorumError),
    };

    unknownError = new Error({ code: -928374 });
    coreRpcClientMockUnkownError = {
      quorum: this.sinon.stub().throws(unknownError),
    };

    loggerMock = {
      debug: this.sinon.stub(),
      info: this.sinon.stub(),
      trace: this.sinon.stub(),
      error: this.sinon.stub(),
    };

    llmqType = 4;
    quorumHash = '36252dfdf79b1b8a95141d32a4c66353a88e439506f036867d7949a5ca7d8a37';
  });

  afterEach(function afterEach() {
    this.sinon.restore();
  });

  it('should get quorum info', async () => {
    const getValidatorSetInfo = getValidatorSetInfoFactory(coreRpcClientMock, loggerMock);
    const validatorSetInfo = await getValidatorSetInfo(llmqType, quorumHash);
    expect(coreRpcClientMock.quorum).to.be.calledOnce();
    expect(validatorSetInfo).to.be.an('array');
  });
  it('should throw an error', async () => {
    const getValidatorSetInfo = getValidatorSetInfoFactory(
      coreRpcClientMockQuorumDoesntExistError, loggerMock,
    );
    try {
      await getValidatorSetInfo(llmqType, quorumHash);
    } catch (e) {
      expect(e).to.equal(noSuchQuorumError);
    }
  });
  it('should throw an error', async () => {
    const getValidatorSetInfo = getValidatorSetInfoFactory(
      coreRpcClientMockUnkownError, loggerMock,
    );
    try {
      await getValidatorSetInfo(llmqType, quorumHash);
    } catch (e) {
      expect(e).to.equal(unknownError);
    }
  });
});