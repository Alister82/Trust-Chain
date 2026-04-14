# 🔗 TrustChain

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14.2.2-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)

**TrustChain** is a Decentralized Trust Protocol designed to facilitate secure, transparent, and verifiable document management. Connecting **Citizens**, **Issuers**, and **Verifiers** on the blockchain, TrustChain ensures a tamper-proof verification ecosystem using advanced cryptographic checks.

---

## 🌟 Key Features

- **Decentralized Identity & Roles (DID):** Built-in support for multiple stakeholders including Admin, Citizens, Issuers, and Verifiers.
- **On-chain Document Anchoring:** Securely anchor document proofs (hashes and signatures) directly to the blockchain, removing the need for centralized trust.
- **Verification Workflow Engine:** Smooth and transparent requests, approvals, anchoring, and rejections tracked immutably.
- **Web3 Ready Frontend:** Modern, responsive Next.js frontend built with React, TailwindCSS, Wagmi, and Viem for seamless user experience and wallet connectivity.
- **Dual Testing Environment:** Integrated setup with **Hardhat** and **Foundry** targeting both rapid JS tests and deep Solidity fuzz-testing.

---

## 🏗 System Architecture

The project is structured in a monolithic repository containing two main independent workspaces:
- `/blockchain`: Contains the smart contracts (`TrustRegistry.sol`, `Counter.sol`), deployment scripts, and test suites. Managed by Hardhat & Foundry.
- `/frontend`: The interactive DApp frontend built on Next.js 14+, running React 19, and TailwindCSS (v4) to interact with the TrustRegistry natively.

---

## 📋 Prerequisites

Ensure your system meets the following requirements before diving in:
- **Node.js** (v18.x or higher)
- **npm** (v9+) or **Yarn**
- **Git**
- **Foundry** (Forge, Cast, Anvil). [Installation Guide](https://book.getfoundry.sh/getting-started/installation)

---

## 🚀 Installation & Setup 

TrustChain natively supports both **Linux** and **Windows** development environments. 

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/TrustChain.git
cd TrustChain
```

### 2. Smart Contract Backend (`/blockchain`)
Navigate to the blockchain workspace and install necessary dependencies:
```bash
cd blockchain
npm install
```

*(Optional but Recommended)* If you haven't installed Foundry framework globally yet, you can do so by running:
- **Linux/macOS/Windows (WSL):**
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Windows (Powershell):**
  If not using WSL on Windows, use the integrated Git Bash or Foundry's native windows installation instructions. *Note: We provide a helper `setup-foundry.ps1` script for Windows environments.*

Compile the contracts:
```bash
npm run compile
```

### 3. Frontend WebApp (`/frontend`)
Navigate to the frontend workspace to install node dependencies:
```bash
cd ../frontend
npm install
```

Configure your environment variables for the frontend:
- Copy the `.env.local` configurations or setup your `.env.local` to point to the correct smart contract addresses once deployed.

---

## 💻 Running the Application

### Step 1: Start the Local Blockchain Node
Open a new terminal window, navigate to the `blockchain` directory, and start an Anvil node via Hardhat:
```bash
cd blockchain
npm run node
```
*This spins up a local blockchain at `http://127.0.0.1:8545` with pre-funded local accounts.*

### Step 2: Deploy the Smart Contracts
Open a second terminal window, and deploy the contracts to your local blockchain:
```bash
cd blockchain
npm run deploy:local
```
*Make absolutely sure to copy the newly deployed `TrustRegistry` contract address. You will need to plug this address into your frontend properties (e.g., in `.env.local` if applicable).*

### Step 3: Run the Web DApp
In a third terminal window, fire up the Next.js development server:
```bash
cd frontend
npm run dev
```

Visit the frontend at [http://localhost:3000](http://localhost:3000) and connect your Web3 wallet (e.g., MetaMask, Frame) injected onto your localhost network.

---

## 🧪 Running Tests
To verify the integrity and security of the smart contracts:
```bash
cd blockchain
# To run fast Hardhat tests
npx hardhat test

# To run deep Foundry forge testing
forge test
```

---

## 🛠 Frameworks & Libraries
- **Contracts:** [Solidity ^0.8.20](https://docs.soliditylang.org/), [Foundry](https://getfoundry.sh/), [Hardhat](https://hardhat.org/)
- **Frontend Core:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TailwindCSS](https://tailwindcss.com/)
- **Web3 Interaction:** [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/)
- **State/Querying:** [TanStack React Query](https://tanstack.com/query)

---

## 📜 License
This project is open-sourced under the [MIT License](LICENSE).
