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
        bool cancelled;
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

    event ItemCancelled(uint256 indexed itemId);

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function listItem(
        IERC721 nft,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        itemCount++;

        nft.transferFrom(msg.sender, address(this), tokenId);

        items[itemCount] = Item({
            itemId: itemCount,
            nft: nft,
            tokenId: tokenId,
            price: price,
            seller: payable(msg.sender),
            sold: false,
            cancelled: false
        });

        emit ItemListed(itemCount, address(nft), tokenId, price, msg.sender);
    }

    function cancelItem(uint256 itemId) external nonReentrant {
        Item storage item = items[itemId];
        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(!item.cancelled, "Item already cancelled");
        require(item.seller == msg.sender, "Not seller");

        item.cancelled = true;

        item.nft.transferFrom(address(this), item.seller, item.tokenId);

        emit ItemCancelled(itemId);
    }

    function buyItem(uint256 itemId) external payable nonReentrant {
        Item storage item = items[itemId];

        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(!item.cancelled, "Item cancelled");
        require(msg.value == item.price, "Send exact price");

        item.sold = true;

        uint256 fee = (item.price * feePercent) / 100;
        uint256 royaltyAmount = 0;
        address royaltyReceiver;

        if (
            IERC165(address(item.nft)).supportsInterface(
                type(IERC2981).interfaceId
            )
        ) {
            (royaltyReceiver, royaltyAmount) = IERC2981(address(item.nft))
                .royaltyInfo(item.tokenId, item.price);
        }

        require(fee + royaltyAmount <= item.price, "Fees exceed price");

        uint256 sellerProceeds = item.price - fee - royaltyAmount;

        payable(feeRecipient).transfer(fee);

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }

        item.seller.transfer(sellerProceeds);

        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit ItemSold(itemId, msg.sender, item.price);
    }

    struct Auction {
        uint256 itemId;
        address payable highestBidder;
        uint256 highestBid;
        uint256 endAt;
        bool ended;
    }

    mapping(uint256 => Auction) public auctions;

    event AuctionStarted(uint256 indexed itemId, uint256 endTime);
    event BidPlaced(uint256 indexed itemId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed itemId, address winner, uint256 amount);

    function startAuction(uint256 itemId, uint256 durationInHours) external {
        Item storage item = items[itemId];
        require(item.seller == msg.sender, "Not the seller");
        require(!item.sold, "Already sold");

        auctions[itemId] = Auction({
            itemId: itemId,
            highestBidder: payable(address(0)),
            highestBid: item.price, // Starting price
            endAt: block.timestamp + (durationInHours * 1 minutes),
            ended: false
        });
        
        emit AuctionStarted(itemId, auctions[itemId].endAt);
    }

    mapping(address => uint256) public pendingWithdrawals; // For Pull pattern refunds

    function placeBid(uint256 itemId) external payable nonReentrant {
        Auction storage auction = auctions[itemId];
        require(block.timestamp < auction.endAt, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // 1. Pull over Push Pattern
        // Instead of transferring now, store the refund for the previous bidder
        if (auction.highestBidder != address(0)) {
            pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        // 2. Time Extension (Anti-Snipping)
        // If bid is placed in the last 1 minute, extend auction by 1 minute
        uint256 timeBuffer = 1 minutes;
        if (auction.endAt - block.timestamp < timeBuffer) {
            auction.endAt += timeBuffer;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit BidPlaced(itemId, msg.sender, msg.value);
    }

    // Function for users to manually claim their refunds
    function withdrawRefund() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function endAuction(uint256 itemId) external nonReentrant {
        Auction storage auction = auctions[itemId];
        Item storage item = items[itemId];
        require(block.timestamp >= auction.endAt, "Auction not ended");
        require(!auction.ended, "Already settled");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner and funds to seller
            item.sold = true;
            item.nft.transferFrom(address(this), auction.highestBidder, item.tokenId);
            item.seller.transfer(auction.highestBid);
        } else {
            // No bids? Return NFT to seller
            item.nft.transferFrom(address(this), item.seller, item.tokenId);
        }

        emit AuctionEnded(itemId, auction.highestBidder, auction.highestBid);
    }
}
