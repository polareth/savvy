// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC20} from "solady/src/tokens/ERC20.sol";

/// @dev An ultra-minimalistic ERC20 token implementation.
contract Mock_ERC20 is ERC20 {
    constructor() {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  METADATA                                  */
    /* -------------------------------------------------------------------------- */

    function name() public pure override returns (string memory) {
        return "Mock_ERC20";
    }

    function symbol() public pure override returns (string memory) {
        return "M20";
    }
}
