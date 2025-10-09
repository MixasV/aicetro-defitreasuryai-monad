// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EmergencyController {
    address public immutable treasury;
    bool public paused;

    event EmergencyStatusChanged(bool paused);

    modifier onlyTreasury() {
        require(msg.sender == treasury, "Not treasury");
        _;
    }

    constructor(address treasuryAddress) {
        treasury = treasuryAddress;
    }

    function pause() external onlyTreasury {
        paused = true;
        emit EmergencyStatusChanged(true);
    }

    function resume() external onlyTreasury {
        paused = false;
        emit EmergencyStatusChanged(false);
    }
}
