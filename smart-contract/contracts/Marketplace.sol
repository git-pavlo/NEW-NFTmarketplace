// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Marketplace is ReentrancyGuard {
    uint256 public itemCount;
    uint256 public feePercent = 2;
    address public feeRecipient;

    struct Item {
        uint256 itemId;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }

    mapping(uint256 => Item) public items;

    event Offered(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event Bought(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed buyer
    );

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    function listItem(
        IERC721 nft,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");

        itemCount++;
        nft.transferFrom(msg.sender, address(this), tokenId);

        items[itemCount] = Item(
            itemCount,
            nft,
            tokenId,
            price,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(nft), tokenId, price, msg.sender);
    }

    function buyItem(uint256 itemId) external payable nonReentrant {
        Item storage item = items[itemId];
        require(!item.sold, "Sold");
        require(msg.value >= item.price, "Not enough ETH");

        item.sold = true;

        // marketplace fee
        uint256 fee = (item.price * feePercent) / 100;
        payable(feeRecipient).transfer(fee);

        // royalty
        if (supportsRoyalty(item.nft)) {
            (address receiver, uint256 royaltyAmount) =
                IERC2981(address(item.nft)).royaltyInfo(item.tokenId, item.price);
            if (royaltyAmount > 0) {
                payable(receiver).transfer(royaltyAmount);
                item.seller.transfer(item.price - fee - royaltyAmount);
            } else {
                item.seller.transfer(item.price - fee);
            }
        } else {
            item.seller.transfer(item.price - fee);
        }

        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit Bought(
            itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            msg.sender
        );
    }

    function supportsRoyalty(IERC721 nft) internal view returns (bool) {
        try IERC165(address(nft)).supportsInterface(type(IERC2981).interfaceId) {
            return true;
        } catch {
            return false;
        }
    }
}
