// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
    }

    // mapeia contrato NFT -> tokenId -> Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    event ItemListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    event ItemSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        uint256 price
    );
    event ItemCanceled(
        address indexed nftContract,
        uint256 indexed tokenId
    );

    /// @notice Lista um token ERC721 para venda
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, unicode"Preço deve ser > 0");
        IERC721 nft = IERC721(nftContract);

        // Transfere custódia temporária para o marketplace
        nft.transferFrom(msg.sender, address(this), tokenId);
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        emit ItemListed(nftContract, tokenId, msg.sender, price);
    }

    /// @notice Compra item listado
    function buyItem(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing memory item = listings[nftContract][tokenId];
        require(item.price > 0, unicode"Item não listado");
        require(msg.value == item.price, unicode"Valor incorreto");

        delete listings[nftContract][tokenId];

        // Transfere ETH ao vendedor
        payable(item.seller).transfer(msg.value);
        // Entrega NFT ao comprador
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        emit ItemSold(nftContract, tokenId, msg.sender, msg.value);
    }

    /// @notice Cancela listagem e devolve NFT ao vendedor
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external {
        Listing memory item = listings[nftContract][tokenId];
        require(
            item.seller == msg.sender,
            unicode"Apenas vendedor pode cancelar"
        );

        delete listings[nftContract][tokenId];
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        emit ItemCanceled(nftContract, tokenId);
    }
}
