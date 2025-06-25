// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POAPAttendance
 * @dev A soulbound NFT system for issuing verifiable event attendance badges
 * with role-based tagging and optional expiry, compatible with Hardhat.
 */
contract POAPAttendance is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;

    struct Attendance {
        string eventTitle;
        string role;
        uint256 expiryTime; // 0 = no expiry
    }

    mapping(uint256 => Attendance) public attendanceMetadata;
    mapping(address => bool) public validatedStudents;

    event StudentValidated(address indexed student);
    event BadgeMinted(address indexed student, uint256 indexed tokenId);
    /*this part i add */ event POAPMinted(address indexed to, uint256 tokenId, string tokenURI);


    constructor(address initialOwner) ERC721("EventPOAP", "POAP") Ownable(initialOwner) {}

    /// @notice Validates a student's address for badge minting eligibility
    function validateStudent(address student) public onlyOwner {
        validatedStudents[student] = true;
        emit StudentValidated(student);
    }

    /// @notice Revokes student validation
    function revokeStudent(address student) public onlyOwner {
        validatedStudents[student] = false;
    }

    /// @notice Mints a soulbound NFT badge 
    function mintBadge(
        address student,
        string memory tokenURI,
        string memory eventTitle,
        string memory role,
        uint256 expiryTime
    ) public onlyOwner {
        require(validatedStudents[student], "Student not validated");

        uint256 tokenId = nextTokenId;
        _mint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);

        attendanceMetadata[tokenId] = Attendance(eventTitle, role, expiryTime);
        nextTokenId++;

        emit BadgeMinted(student, tokenId);
    }

    /// @dev Prevents transfer of NFTs post-mint (soulbound enforcement)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "This NFT is soulbound and non-transferable");
        return super._update(to, tokenId, auth);
    }

    /// @notice Returns badge role string
    function getBadgeRole(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Badge does not exist");
        return attendanceMetadata[tokenId].role;
    }

    /// @notice Returns event title
    function getEventTitle(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Badge does not exist");
        return attendanceMetadata[tokenId].eventTitle;
    }

    /// @notice Verifies if a badge is still valid (based on expiry)
    function isBadgeValid(uint256 tokenId) public view returns (bool) {
        require(ownerOf(tokenId) != address(0), "Badge does not exist");
        uint256 expiry = attendanceMetadata[tokenId].expiryTime;
        if (expiry == 0) return true;
        return block.timestamp <= expiry;
    }

    /// @notice Combines all metadata into one response for frontend use
    function getBadgeMetadata(uint256 tokenId)
        public
        view
        returns (string memory eventTitle, string memory role, uint256 expiryTime, string memory uri)
    {
        require(ownerOf(tokenId) != address(0), "Badge does not exist");
        Attendance memory data = attendanceMetadata[tokenId];
        return (data.eventTitle, data.role, data.expiryTime, tokenURI(tokenId));
    }

    /// @notice Allows contract ownership transfer
    function transferOwnershipTo(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }
}