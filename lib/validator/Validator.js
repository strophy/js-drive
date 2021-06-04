const IncompleteQuorumMemberInfoError = require("./errors/IncompleteQuorumMemberInfoError");

class Validator {
  /**
   * @param {Buffer} proTxHash
   * @param {Buffer} pubKeyShare
   */
  constructor(proTxHash, pubKeyShare) {
    this.proTxHash = proTxHash;
    this.pubKeyShare = pubKeyShare;
  }

  /**
   * Get validator pro tx hash
   *
   * @return {Buffer}
   */
  getProTxHash() {
    return this.proTxHash;
  }

  /**
   * Get validator public key share
   * @return {Buffer}
   */
  getPublicKeyShare() {
    return this.pubKeyShare;
  }

  /**
   * Get validator voting power
   *
   * @return {number}
   */
  getVotingPower() {
    return Validator.DEFAULT_DASH_VOTING_POWER;
  }

  /**
   * @param {Object} member
   * @return {Validator}
   */
  static createFromQuorumMember(member) {
    if (!member.proTxHash) {
      throw new IncompleteQuorumMemberInfoError('proTxHash');
    }

    if (!member.pubKeyShare) {
      throw new IncompleteQuorumMemberInfoError('pubKeyShare');
    }

    const proTxHash = Buffer.from(member.proTxHash, 'hex');
    const pubKeyShare = Buffer.from(member.pubKeyShare, 'hex');

    return new Validator(proTxHash, pubKeyShare);
  }
}

Validator.DEFAULT_DASH_VOTING_POWER = 100;

module.exports = Validator;
