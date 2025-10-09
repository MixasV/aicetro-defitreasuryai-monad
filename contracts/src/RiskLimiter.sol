// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RiskLimiter {
    struct RiskRule {
        uint256 maxValue;
        uint256 maxRiskScore;
        bool active;
    }

    mapping(bytes32 => RiskRule) public rules;
    address public owner;

    event RiskRuleUpdated(bytes32 indexed key, uint256 maxValue, uint256 maxRiskScore, bool active);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner;
    }

    function setRiskRule(bytes32 key, uint256 maxValue, uint256 maxRiskScore, bool active) external onlyOwner {
        rules[key] = RiskRule({maxValue: maxValue, maxRiskScore: maxRiskScore, active: active});
        emit RiskRuleUpdated(key, maxValue, maxRiskScore, active);
    }

    function validate(bytes32 key, uint256 value, uint256 riskScore) external view returns (bool) {
        RiskRule memory rule = rules[key];
        if (!rule.active) return true;
        if (value > rule.maxValue) return false;
        if (riskScore > rule.maxRiskScore) return false;
        return true;
    }
}
