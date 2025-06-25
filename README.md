# 🧾 POAP Minting dApp
A decentralized application that allows event organizers to mint and distribute Proof of Attendance Protocol (POAP) NFTs as soulbound tokens to event participants.

# 🚀 Features
1) Mint tamper-proof attendance NFTs
2) Store metadata (event name, role, expiry date) on IPFS
3) Non-transferable (soulbound) NFT design
4) View all POAPs owned by a connected wallet

# 🧰 Technologies Used
1) React (Frontend)
2) ethers.js (Smart contract interaction)
3) Solidity (Smart contract)
4) Web3.Storage (IPFS file + metadata hosting)
5) MetaMask (Wallet connection)

# How to run?
1) Navigate to the "POAP" folder in command prompt
2) Navigate to "poap-minting-app" in the POAP folder by running this command :
 cd poap-minting-app 

3) Install Dependencies (IMPORTANT)
4) npm install

5) Configure Environment
Create a .env file in the root of the project and add your Web3.Storage API token.
VITE_WEB3STORAGE_TOKEN=your_web3_storage_api_token_here

5) Add Your Smart Contract Info
Update the following:
src/contract/PoapContract.js with your contract address
src/PoapABI.json with your deployed contract's ABI

6) Start the Development Server
npm start
The app will run at: http://localhost:3000

# 💡 Usage Guide
🧾 Mint a POAP
1) Connect your MetaMask wallet.
2) Go to the Mint POAP tab.
3) Fill in event title, role, expiry date, and image.
4) Click Upload & Mint. It will:
5) Upload metadata to IPFS
6) Call the smart contract's mintBadge() function

# 🔍 View Your POAPs
Navigate to the View POAPs tab.

It will:
1) Get your wallet address
2) Call balanceOf(), tokenOfOwnerByIndex(), and tokenURI() from the contract
3) Fetch and display metadata and images from IPFS


