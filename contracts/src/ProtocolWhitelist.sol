// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProtocolWhitelist {
    address public owner;
    mapping(address => bool) public approved;

    event ProtocolApproved(address indexed protocol, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function updateProtocol(address protocol, bool status) external onlyOwner {
        approved[protocol] = status;
        emit ProtocolApproved(protocol, status);
    }

    function batchUpdate(address[] calldata protocols, bool status) external onlyOwner {
        for (uint256 i = 0; i < protocols.length; i++) {
            approved[protocols[i]] = status;
            emit ProtocolApproved(protocols[i], status);
        }
    }
}
