// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalaxyBayNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor()
        ERC721("GalaxyBayNFT", "GBNFT")
        Ownable(msg.sender)
    {}

    /// @notice Mint NFT para um endereço específico com URI de metadata
    /// @param to Endereço beneficiário do token
    /// @param tokenURI URI da metadata
    /// @return tokenId ID do token cunhado
    /// @dev Removido onlyOwner para permitir que qualquer usuário possa mintar
    function mintTo(address to, string calldata tokenURI) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}
