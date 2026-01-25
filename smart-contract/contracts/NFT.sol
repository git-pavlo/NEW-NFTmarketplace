// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract NFT is ERC721URIStorage, IERC2981, Ownable {
    uint256 public tokenCount;

    struct Royalty {
        address receiver;
        uint96 fee; // basis points (100 = 1%)
    }

    mapping(uint256 => Royalty) private _royalties;

    constructor()
        ERC721("NeonNFT", "NNFT")
        Ownable(msg.sender)
    {}

    function mint(
        string memory tokenURI,
        address royaltyReceiver,
        uint96 royaltyFee
    ) external returns (uint256) {
        require(royaltyFee <= 1000, "Royalty too high");

        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, tokenURI);

        _royalties[tokenCount] = Royalty(royaltyReceiver, royaltyFee);

        return tokenCount;
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        Royalty memory r = _royalties[tokenId];
        uint256 royaltyAmount = (salePrice * r.fee) / 10000;
        return (r.receiver, royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
