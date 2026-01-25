// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    uint256 public itemCount;
    uint256 public feePercent = 2; // 2% marketplace fee
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

    event ItemListed(
        uint256 indexed itemId,
        address indexed nft,
        uint256 indexed tokenId,
        uint256 price,
        address seller
    );

    event ItemSold(
        uint256 indexed itemId,
        address buyer,
        uint256 price
    );

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice List an NFT for sale
     * @param nft ERC721 contract address
     * @param tokenId Token ID
     * @param price Sale price in wei
     */
    function listItem(
        IERC721 nft,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");

        itemCount++;

        // Transfer NFT to marketplace
        nft.transferFrom(msg.sender, address(this), tokenId);

        items[itemCount] = Item({
            itemId: itemCount,
            nft: nft,
            tokenId: tokenId,
            price: price,
            seller: payable(msg.sender),
            sold: false
        });

        emit ItemListed(
            itemCount,
            address(nft),
            tokenId,
            price,
            msg.sender
        );
    }

    /**
     * @notice Buy a listed NFT
     * @param itemId Marketplace item ID
     */
    function buyItem(uint256 itemId) external payable nonReentrant {
        Item storage item = items[itemId];

        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(msg.value == item.price, "Send exact price");

        item.sold = true;

        uint256 fee = (item.price * feePercent) / 100;
        uint256 royaltyAmount = 0;
        address royaltyReceiver;

        // Check ERC2981 royalty support
        if (
            IERC165(address(item.nft)).supportsInterface(
                type(IERC2981).interfaceId
            )
        ) {
            (royaltyReceiver, royaltyAmount) =
                IERC2981(address(item.nft))
                    .royaltyInfo(item.tokenId, item.price);
        }

        require(fee + royaltyAmount <= item.price, "Fees exceed price");

        uint256 sellerProceeds =
            item.price - fee - royaltyAmount;

        // Payouts
        payable(feeRecipient).transfer(fee);

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }

        item.seller.transfer(sellerProceeds);

        // Transfer NFT to buyer
        item.nft.transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );

        emit ItemSold(itemId, msg.sender, item.price);
    }
}
