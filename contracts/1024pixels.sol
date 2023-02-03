// SPDX-License-Identifier: GPL-v3

pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PixelArt is ERC721, Ownable {
    mapping(uint256 => bytes) internal pixels;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            '{"name":"1024 Pixels # ',
            Strings.toString(tokenId),
            '","image":"',
            imageURI(tokenId),
            '"}'
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function imageURI(uint256 tokenId) public view returns (string memory) {
        _requireMinted(tokenId);
        bytes memory data = pixels[tokenId];
        uint256 i;
        uint256 j;
        uint256 x;
        bytes memory gif = abi.encodePacked(
            GIF_START_1,
            GIF_START_2,
            GIF_START_3,
            GIF_START_4,
            GIF_START_5,
            GIF_START_6,
            GIF_START_7
        );
        for (i = 0; i < 1024; i += 32) {
            x = 0;
            for (j = 0; j < 32; j++) {
                x = x << 8;
                x = x | uint8(data[i + j]);
            }
            gif = abi.encodePacked(gif, GIF_PIXEL_PREFIX, x);
        }
        gif = abi.encodePacked(gif, GIF_END);
        return
            string(
                abi.encodePacked("data:image/gif;base64,", Base64.encode(gif))
            );
    }

    function mint(bytes memory data) public returns (uint256) {
        require(data.length == 1024, "invalid pixels length");
        for (uint256 i = 0; i < 1024; i++) {
            require(uint8(data[i]) < 48, "invalid pixel index color");
        }
        uint256 tokenId = uint256(keccak256(data));
        pixels[tokenId] = data;
        super._safeMint(msg.sender, tokenId);
        return tokenId;
    }

    bytes32 constant GIF_START_1 =
        0x47494638396120002000f52f00ff8080ffff8080ff8000ff8080ffff0080ffff;
    bytes32 constant GIF_START_2 =
        0x80c0ff80ffff0000ffff0080ff0000ff4000ffff0080c08080c0ff00ff804040;
    bytes32 constant GIF_START_3 =
        0xff804000ff000080800040808080ff800040ff0080800000ff80000080000080;
    bytes32 constant GIF_START_4 =
        0x400000ff0000a08000808000ff40000080400000400000404000008000004040;
    bytes32 constant GIF_START_5 =
        0x0040400080000000808000808040808080408080c0c0c0ffffff111111111111;
    bytes32 constant GIF_START_6 =
        0x1111111111111111111111111111111111111111111111111111111111111111;
    bytes32 constant GIF_START_7 =
        0x1111111111111111111111111121f9040100002f002c00000000200020000007;

    bytes2 constant GIF_PIXEL_PREFIX = 0x2180;

    bytes4 constant GIF_END = 0x0181003b;
}
