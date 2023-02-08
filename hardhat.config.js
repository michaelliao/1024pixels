require("@nomicfoundation/hardhat-toolbox");
require('hardhat-abi-exporter');

module.exports = {
    solidity: "0.8.17",
    abiExporter: {
        path: "./abi",
        clear: false,
        flat: true,
        only: [
            "Pixels",
            "Animations"
        ],
        pretty: false,
        runOnCompile: true,
    },
    mocha: {
        timeout: 10000000
    }
};
