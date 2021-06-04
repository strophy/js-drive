const DriveError = require('../../errors/DriveError');

class IncompleteQuorumMemberInfoError extends DriveError {
  constructor(field) {
    super(`Quorum member info doesn't contain ${field}`);
  }
}

module.exports = IncompleteQuorumMemberInfoError;
