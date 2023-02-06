// SPDX-License-Identifier: GPL-v3

pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Pixels is ERC721, Ownable, IERC2981 {
    event Redirect(address indexed creator, address indexed redirectTo);

    uint256 constant MAX_ROYALTY_FRACTION = 10000;

    uint256 public royaltyFraction;
    uint256 public mintFee;
    mapping(uint256 => bytes) internal _pixels;
    mapping(uint256 => address) internal _creators;
    mapping(address => address) internal _creatorRedirects;
    mapping(address => bool) internal _superOperators;

    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) ERC721(name, symbol) {
        setRoyaltyFraction(250);
        transferOwnership(owner);
    }

    /**
     * Get redirect address of a creator, or address(0) if not set.
     */
    function creatorRedirect(address from) public view returns (address) {
        return _creatorRedirects[from];
    }

    /**
     * A creator can set its redirect address, or address(0) to unset.
     */
    function setCreatorRedirect(address to) public {
        _creatorRedirects[msg.sender] = to;
        emit Redirect(msg.sender, to);
    }

    /**
     * Admin: set royalty fraction: 0 ~ 10000
     */
    function setRoyaltyFraction(uint256 val) public onlyOwner {
        require(val <= MAX_ROYALTY_FRACTION, "Pixels: Out of range");
        royaltyFraction = val;
    }

    /**
     * Admin: set mint fee
     */
    function setMintFee(uint256 val) public onlyOwner {
        mintFee = val;
    }

    /**
     * Admin: set super operator such as OpenSea.
     */
    function setSuperOperator(address superOperator, bool add)
        public
        onlyOwner
    {
        _superOperators[superOperator] = add;
    }

    /**
     * Admin: withdraw from this contract to owner.
     */
    function withdraw(address[] memory tokens) public onlyOwner {
        address srcAddress = address(this);
        for (uint256 i = 0; i < tokens.length; i++) {
            address t = tokens[i];
            if (t == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
                if (srcAddress.balance > 0) {
                    payable(msg.sender).transfer(srcAddress.balance);
                }
            } else {
                IERC20 erc = IERC20(t);
                uint256 balance = erc.balanceOf(srcAddress);
                if (balance > 0) {
                    SafeERC20.safeTransfer(erc, msg.sender, balance);
                }
            }
        }
    }

    /**
     * Pre-approve by safe market place such as OpenSea, LooksRare, etc.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (_superOperators[operator]) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    /**
     * IERC2981: Returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of
     * exchange. The royalty amount is denominated and should be paid in that same unit of exchange.
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = creatorOf(tokenId);
        royaltyAmount = (salePrice / 10000) * royaltyFraction;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * Creator of the token. NOTE a redirect address is returned if set by original creator.
     */
    function creatorOf(uint256 tokenId) public view returns (address) {
        address creator = _creators[tokenId];
        require(creator != address(0), "ERC721: invalid token ID");
        address redirect = _creatorRedirects[creator];
        return redirect == address(0) ? creator : redirect;
    }

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
            // index of c = 10:
            c = uint8(data[i + 10]);
            x1 = x1 << 8;
            x1 = x1 | c;
            x1 = x1 << 8;
            x1 = x1 | c;

            x2 = 0;
            x2 = x2 << 8;
            x2 = x2 | c;
            x2 = partOfLine(data, x2, i, 11, 21);
            // index of c = 21:
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
        bytes memory data = _pixels[tokenId];
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

    function mint(bytes memory data) public payable returns (uint256) {
        require(msg.value == mintFee, "Pixels: invalid mint fee");
        require(data.length == 1024, "Pixels: invalid pixels length");
        for (uint256 i = 0; i < 1024; i++) {
            require(uint8(data[i]) < 64, "Pixels: invalid pixel index color");
        }
        uint256 tokenId = uint256(keccak256(data));
        _pixels[tokenId] = data;
        _creators[tokenId] = msg.sender;
        super._safeMint(msg.sender, tokenId);
        return tokenId;
    }

    bytes32 constant GIF_START_1 =
        0x47494638396160006000f53f00ffc0c0ffffc0c0ffc000ffc0c0ffff80c0ffc0;
    bytes32 constant GIF_START_2 =
        0xc0ffffc0ffff8080ffff8080ff8000ff8080ffff0080ffff80c0ff80ffff0000;
    bytes32 constant GIF_START_3 =
        0xffff0080ff0000ff4000ffff0080c08080c0ff00ffc00000c0c00040ff4000c0;
    bytes32 constant GIF_START_4 =
        0xc000c0ff8040c0804080ff40c0804040ff804000ff000080800040808080ff80;
    bytes32 constant GIF_START_5 =
        0x0040ff0080800000ff80000080000080400000ff0000a08000808000ff400000;
    bytes32 constant GIF_START_6 =
        0x8040000040000040400000800000404000404000800000008080008080408080;
    bytes32 constant GIF_START_7 =
        0x80408080c0c0c0ffffff11111121f9041100003f002c00000000600060000007;

    bytes2 constant GIF_PIXEL_PREFIX = 0x6180;

    bytes4 constant GIF_END = 0x0181003b;
}
