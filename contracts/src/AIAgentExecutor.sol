// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITreasuryManager {
    function recordSpending(address account, uint256 amount) external;
    function getDelegation(address account)
        external
        view
        returns (address delegate, uint256 dailyLimit, uint256 spent24h, bool active, address[] memory whitelist);
}

contract AIAgentExecutor {
    ITreasuryManager public immutable treasury;
    address public immutable corporateAccount;
    uint256 public maxRiskScore;

    event StrategyExecuted(address indexed protocol, uint256 value, bytes data);

    modifier onlyDelegate() {
        (address delegate,, , bool active,) = treasury.getDelegation(corporateAccount);
        require(active, "Delegation inactive");
        require(msg.sender == delegate, "Not delegated");
        _;
    }

    constructor(address treasuryManager, address account, uint256 riskScore) {
        treasury = ITreasuryManager(treasuryManager);
        corporateAccount = account;
        maxRiskScore = riskScore;
    }

    function setMaxRiskScore(uint256 newScore) external onlyDelegate {
        maxRiskScore = newScore;
    }

    function execute(
        address protocol,
        bytes calldata callData,
        uint256 value,
        uint256 riskScore
    ) external onlyDelegate {
        (, uint256 dailyLimit,, bool active, address[] memory whitelist) = treasury.getDelegation(corporateAccount);
        require(active, "Delegation disabled");
        require(riskScore <= maxRiskScore, "Risk too high");
        require(_isProtocolAllowed(protocol, whitelist), "Protocol not allowed");

        treasury.recordSpending(corporateAccount, value);

        (bool success,) = protocol.call{value: value}(callData);
        require(success, "Execution failed");

        emit StrategyExecuted(protocol, value, callData);
    }

    function _isProtocolAllowed(address protocol, address[] memory whitelist) private pure returns (bool) {
        for (uint256 i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == protocol) {
                return true;
            }
        }
        return false;
    }

    receive() external payable {}
}
