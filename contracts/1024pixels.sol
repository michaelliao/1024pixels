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

    function tokenExist(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

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

    function partOfLine(
        bytes memory data,
        uint256 x,
        uint256 i,
        uint256 jstart,
        uint256 jend
    ) internal pure returns (uint256) {
        uint256 j;
        uint8 c;
        for (j = jstart; j < jend; j++) {
            c = uint8(data[i + j]);
            x = x << 8;
            x = x | c;
            x = x << 8;
            x = x | c;
            x = x << 8;
            x = x | c;
        }
        return x;
    }

    function linesData(bytes memory data) internal pure returns (bytes memory) {
        bytes memory lines = abi.encodePacked("");
        uint256 x1;
        uint256 x2;
        uint256 x3;
        uint256 i;
        uint8 c;
        bytes memory line;
        for (i = 0; i < 1024; i += 32) {
            x1 = 0;
            x1 = partOfLine(data, x1, i, 0, 10);
            // index of c  = 10:
            c = uint8(data[i + 10]);
            x1 = x1 << 8;
            x1 = x1 | c;
            x1 = x1 << 8;
            x1 = x1 | c;

            x2 = 0;
            x2 = x2 << 8;
            x2 = x2 | c;
            x2 = partOfLine(data, x2, i, 11, 21);
            // index of c  = 21:
            c = uint8(data[i + 21]);
            x2 = x2 << 8;
            x2 = x2 | c;

            x3 = 0;
            x3 = x3 << 8;
            x3 = x3 | c;
            x3 = x3 << 8;
            x3 = x3 | c;
            x3 = partOfLine(data, x3, i, 22, 32);
            line = abi.encodePacked(GIF_PIXEL_PREFIX, x1, x2, x3);
            lines = abi.encodePacked(lines, line, line, line);
        }
        return lines;
    }

    function imageURI(uint256 tokenId) public view returns (string memory) {
        _requireMinted(tokenId);
        bytes memory data = pixels[tokenId];
        bytes memory gif = abi.encodePacked(
            GIF_START_1,
            GIF_START_2,
            GIF_START_3,
            GIF_START_4,
            GIF_START_5,
            GIF_START_6,
            GIF_START_7
        );

        gif = abi.encodePacked(gif, linesData(data), GIF_END);
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
        0x47494638396160006000f52f00ff8080ffff8080ff8000ff8080ffff0080ffff;
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
        0x1111111111111111111111111121f9040100002f002c00000000600060000007;

    bytes2 constant GIF_PIXEL_PREFIX = 0x6180;

    bytes4 constant GIF_END = 0x0181003b;
}
