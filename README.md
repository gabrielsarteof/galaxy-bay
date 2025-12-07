# Galaxy Bay NFT Marketplace

A decentralized NFT marketplace platform built with modern Web3 technologies, demonstrating complete integration between blockchain, IPFS storage, and traditional web infrastructure.

**Development Team:**
- Gabriel Barboza Sartore
- Tracy Julie Calabrez
- Bruna Ribeiro Cedro

## Project Overview

Galaxy Bay is an educational NFT marketplace that implements core blockchain concepts including smart contracts, Web3 wallet integration, decentralized storage, and event-driven architecture. The platform enables users to mint, list, and trade ERC-721 NFTs while maintaining metadata permanence through IPFS.

This project was developed as part of a blockchain course to demonstrate practical understanding of:
- Smart contract development and deployment on Ethereum
- Web3 integration with MetaMask wallets
- IPFS-based decentralized storage
- Backend blockchain indexing and validation
- Full-stack dApp architecture

## Architecture

The platform consists of three main components:

### Smart Contracts (Solidity)
- **GalaxyBayNFT**: ERC-721 compliant NFT contract with URI storage
- **Marketplace**: Escrow-based marketplace for listing and purchasing NFTs

Contracts are deployed on Sepolia testnet and implement security patterns including ReentrancyGuard and Checks-Effects-Interactions.

### Backend (NestJS)
- RESTful API for NFT metadata management
- IPFS integration via Pinata for image and metadata uploads
- Blockchain event indexing and validation
- PostgreSQL database with Prisma ORM

### Frontend (Next.js)
- React-based user interface with TypeScript
- MetaMask wallet integration using ethers.js v6
- Real-time transaction status tracking
- Responsive design with TailwindCSS

## Technology Stack

**Blockchain**
- Solidity 0.8.20
- Hardhat development environment
- OpenZeppelin contract libraries
- Ethers.js v6 for Web3 interactions
- Sepolia testnet deployment

**Backend**
- NestJS framework
- PostgreSQL database
- Prisma ORM
- Pinata SDK for IPFS
- Sharp for image optimization

**Frontend**
- Next.js 15
- TypeScript
- TailwindCSS
- React Query for state management
- ethers.js for blockchain interaction

**Storage**
- IPFS via Pinata for NFT images and metadata
- PostgreSQL for application data and indexing
- Content-addressed storage with CID validation

## Key Features

### NFT Minting
- Direct user minting without owner restrictions
- Automatic image optimization (60-80% size reduction)
- IPFS upload with retry logic and exponential backoff
- Metadata validation following OpenSea standards
- Transaction retry mechanism with user feedback

### Marketplace
- On-chain listing with escrow pattern
- Atomic ETH and NFT transfers
- Event-based state synchronization
- Seller-initiated listing cancellation

### Security Implementation
- ReentrancyGuard protection in marketplace contract
- On-chain ownership validation before database registration
- Network verification forcing Sepolia testnet
- Input sanitization and validation
- Transaction status verification

### IPFS Integration
- Image optimization before upload
- Dual upload workflow (image → metadata)
- Multiple gateway support for redundancy
- Content-addressed immutable storage
- Pinata dedicated gateway for reliability

## Installation and Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MetaMask browser extension
- Sepolia testnet ETH (from faucet)

### Environment Configuration

**Backend (.env)**
```
DATABASE_URL="postgresql://user:password@localhost:5432/galaxy_bay"
JWT_SECRET="your-secret-key"
PINATA_JWT="your-pinata-jwt"
PINATA_GATEWAY="your-gateway.mypinata.cloud"
RPC_URL="your-sepolia-rpc-url"
NFT_CONTRACT_ADDRESS="deployed-nft-contract"
MARKETPLACE_CONTRACT_ADDRESS="deployed-marketplace-contract"
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="deployed-nft-contract"
NEXT_PUBLIC_MARKETPLACE_ADDRESS="deployed-marketplace-contract"
```

### Database Setup

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
```

### Smart Contract Deployment

```bash
cd contracts
npm install
cp .env.example .env
# Configure RPC_URL and PRIVATE_KEY in .env
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

The deployment script automatically:
- Deploys both NFT and Marketplace contracts
- Updates frontend .env.local with contract addresses
- Copies ABIs to frontend/src/contracts directory

### Running the Application

**Backend**
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3001
```

## Smart Contract Details

### GalaxyBayNFT Contract

```solidity
contract GalaxyBayNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    function mintTo(address to, string calldata tokenURI)
        external returns (uint256)
}
```

**Features:**
- Auto-incrementing token IDs
- URI storage for IPFS metadata links
- Public minting capability
- SafeMint validation

### Marketplace Contract

```solidity
contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
    }

    function listItem(address nftContract, uint256 tokenId, uint256 price) external
    function buyItem(address nftContract, uint256 tokenId) external payable
    function cancelListing(address nftContract, uint256 tokenId) external
}
```

**Features:**
- Escrow-based custody during listing
- Reentrancy protection
- Multi-contract support
- Event emission for indexing

## NFT Minting Workflow

1. **User uploads image** via frontend MintForm component
2. **Frontend sends File to backend** `/nfts/prepare-mint` endpoint
3. **Backend optimizes image** using Sharp library
4. **Image uploaded to IPFS** via Pinata HTTP API
5. **Metadata JSON created** with `ipfs://` image reference
6. **Metadata uploaded to IPFS** returning final CID
7. **Frontend receives tokenURI** (`ipfs://metadataCID`)
8. **User signs transaction** via MetaMask
9. **Contract mints NFT** calling `mintTo(address, tokenURI)`
10. **Transaction confirmed** on Sepolia blockchain
11. **TokenId extracted** from Transfer event logs
12. **Backend validates** transaction and ownership on-chain
13. **NFT registered** in PostgreSQL database
14. **Activity logged** for user history

## API Endpoints

### NFT Operations
- `POST /nfts/prepare-mint` - Upload image and metadata to IPFS
- `POST /nfts/register` - Register minted NFT after blockchain confirmation
- `GET /nfts` - Retrieve all NFTs with pagination
- `GET /nfts/:id` - Get single NFT details
- `GET /nfts/page/:pageId` - Get NFTs by creator page

### Page Management
- `POST /pages` - Create creator page
- `GET /pages/:slug` - Get page by slug
- `PATCH /pages/:id` - Update page settings

### Authentication
- `POST /auth/login` - Web3 signature-based login
- `POST /auth/register` - Register new user with wallet address

## Testing

**Backend Unit Tests**
```bash
cd backend
npm test
```

**Smart Contract Tests**
```bash
cd contracts
npx hardhat test
```

Coverage includes:
- Pinata service with proper mocking
- NFT registration with blockchain validation
- Event parsing and tokenId extraction
- Error handling and retry mechanisms

## Security Considerations

### Implemented
- OpenZeppelin audited contracts (ERC721, ReentrancyGuard)
- Checks-Effects-Interactions pattern in marketplace
- On-chain ownership verification before database writes
- Network validation (Sepolia-only in current deployment)
- Input validation with Zod schemas
- CORS configuration
- Rate limiting on API endpoints

### Production Requirements
The current implementation is for educational purposes. Production deployment would require:
- Professional smart contract audit ($50,000-150,000)
- Multi-signature wallet for contract ownership
- Comprehensive test coverage (unit, integration, fuzzing)
- Gas optimization analysis
- Mainnet deployment strategy
- Bug bounty program

## Known Limitations

This is an educational project with the following limitations:

**Not Implemented:**
- EIP-2981 royalty standard (creators don't receive secondary sale fees)
- Marketplace transaction fees (unsustainable without revenue model)
- Lazy minting (users pay gas upfront)
- Auction mechanisms (only fixed-price sales)
- Offer system below listing price
- Collection verification badges
- Complete NFT indexing (only platform-minted NFTs)

**Testnet Only:**
- Deployed on Sepolia testnet
- Uses test ETH (no real value)
- Production would require mainnet deployment

**Simplifications:**
- Single NFT contract (marketplace supports multiple but UI shows only ours)
- No proxy pattern for upgrades
- Basic event indexing (could use The Graph for better performance)

## Project Structure

```
galaxy-bay/
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT authentication
│   │   ├── nft/               # NFT business logic
│   │   ├── pages/             # Creator pages
│   │   ├── utils/             # Blockchain and IPFS services
│   │   └── prisma/            # Database schema and migrations
│   └── test/                  # Unit and e2e tests
├── contracts/
│   ├── contracts/
│   │   ├── GalaxyBayNFT.sol   # ERC721 NFT implementation
│   │   └── Marketplace.sol    # Marketplace logic
│   ├── scripts/
│   │   └── deploy.ts          # Deployment automation
│   └── test/                  # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks (useMint, useMetaMask)
│   │   ├── services/          # API and contract services
│   │   ├── contracts/         # ABIs (auto-copied from deployment)
│   │   └── app/               # Next.js app router pages
│   └── public/                # Static assets
└── README.md
```

## Development Timeline

**Phase 1 - Smart Contracts**
- ERC-721 NFT contract with OpenZeppelin
- Marketplace escrow implementation
- Security patterns integration
- Hardhat testing environment

**Phase 2 - Backend Infrastructure**
- NestJS API setup
- Prisma schema design
- IPFS integration via Pinata
- Blockchain service for read-only queries

**Phase 3 - Frontend Integration**
- MetaMask wallet connection
- NFT minting interface
- Transaction status tracking
- IPFS gateway configuration

**Phase 4 - Testing & Refinement**
- Comprehensive test suite
- Error handling improvements
- Retry mechanisms
- Documentation

## Performance Optimizations

**Image Optimization:**
- Automatic resize to max 2000x2000 pixels
- JPEG conversion with 85% quality
- Typical 60-80% size reduction
- Maintains visual quality while reducing IPFS storage costs

**Upload Reliability:**
- 3 retry attempts with exponential backoff (1s, 2s delays)
- Multiple IPFS gateway fallbacks
- 10-minute timeout for large files
- Progress tracking for user feedback

**Network Resilience:**
- Backend uses 5 fallback RPC providers
- Automatic failover on connection errors
- 5-second timeout per RPC attempt
- Static network configuration for faster init

**Database:**
- Prisma with optimized indexes
- Selective field queries
- Pagination support
- Relation preloading

## Educational Value

This project demonstrates practical understanding of:

**Blockchain Concepts:**
- Smart contract development lifecycle
- Gas optimization considerations
- Event-driven architecture
- On-chain vs off-chain storage decisions

**Web3 Integration:**
- Wallet connection patterns
- Transaction signing flow
- Event parsing from receipts
- Network switching and validation

**Decentralized Storage:**
- IPFS content addressing
- Gateway redundancy
- Metadata standards (OpenSea)
- Permanent vs temporary storage

**Full-Stack Development:**
- Backend validation of blockchain state
- Frontend transaction management
- Database indexing of blockchain events
- Error handling across async operations

## Future Enhancements

**Smart Contract:**
- Implement EIP-2981 for royalty payments
- Add marketplace fee mechanism
- Proxy pattern for upgradeability
- Batch minting capabilities

**Platform Features:**
- Lazy minting to reduce user gas costs
- Auction system (English and Dutch)
- Collection creation and management
- Advanced search and filtering
- User profiles and social features

**Infrastructure:**
- The Graph integration for improved indexing
- IPFS cluster for redundancy
- Mainnet deployment
- Multi-chain support (Polygon, Arbitrum)

## Contributing

This is an educational project developed for academic purposes. The codebase demonstrates blockchain integration patterns and can serve as a reference for similar implementations.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

**Technologies:**
- OpenZeppelin for audited smart contract libraries
- Hardhat for Ethereum development environment
- Pinata for IPFS pinning service
- Sepolia testnet for deployment infrastructure

**Standards:**
- EIP-721 for NFT implementation
- OpenSea metadata standards
- EIP-1193 for provider interactions

## Contact

For questions about this implementation or blockchain development, please open an issue in the repository.

---

**Note:** This is an educational project demonstrating blockchain concepts. It has not undergone professional security auditing and should not be used in production without proper security review.
