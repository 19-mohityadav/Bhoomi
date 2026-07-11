// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bhoomi is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct LandParcel {
        string coordinates; 
        uint256 price;      
        bool isForSale;
    }

    mapping(uint256 => LandParcel) public parcels;

    constructor() ERC721("Bhoomi Parcel", "BHOOMI") Ownable(msg.sender) {}

    // 1. Authority Flow: Register and Mint Land
    function registerLand(address citizen, string memory tokenURI, string memory coords) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newId = _tokenIds;
        
        _mint(citizen, newId);
        _setTokenURI(newId, tokenURI);
        
        parcels[newId] = LandParcel(coords, 0, false);
        return newId;
    }

    // 2. Listing Flow
    function listLand(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        parcels[tokenId].price = price;
        parcels[tokenId].isForSale = true;
    }

    // 3. Marketplace Flow: Atomic Swap (Buy Land)
    function buyLand(uint256 tokenId) public payable {
        LandParcel memory parcel = parcels[tokenId];
        require(parcel.isForSale, "Not for sale");
        require(msg.value >= parcel.price, "Insufficient funds");

        address seller = ownerOf(tokenId);
        parcels[tokenId].isForSale = false;

        payable(seller).transfer(msg.value);
        _transfer(seller, msg.sender, tokenId);
    }
}