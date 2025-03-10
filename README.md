# Define 3.0
The official template repository for Define 3.0

![DefineHack 2025 Logo](https://github.com/user-attachments/assets/8173bc16-418e-4912-b500-c6427e4ba4b6)



# PayMint
### Team Information
- **Team Name**: Big Brown Coders 
- **Track**: AI in Finance

### Team Members
| Name | Role | GitHub | LinkedIn |
|------|------|--------|----------|
| Pirajesh M R | AI / Backend | [@verz0](https://github.com/username) | [Profile](https://linkedin.com/in/pirajesh-m-r) |
| Rahul Rajesh Kumar | Frontend / UI / UX | [@rahulr2101](https://github.com/username) | [Profile](https://linkedin.com/in/rahulr2101) |
| Sarang T Sudhir | Backend / Mobile | [@ash-004](https://github.com/username) | [Profile](https://linkedin.com/in/sarang-thakidiyil-sudhir-77b682331) |
| Nikhil Kumar Mishra | AI | [@yamiarch](https://github.com/username) | [Profile](https://linkedin.com/in/nikhilmishra679) |

## Project Details

### Overview
**Paymint** is an AI-powered sustainable fintech platform that bridges traditional finance, decentralized finance, and blockchain-based sustainability. 
We integrate real time financial data, employ advanced AI and expand into decentralized finance to empower our users to make informed and sustainable investment decisions. The users can also track there expenses in real-time and its all done for them.

### Problem Statement
Traditional financial platforms often provide only raw market data or isolated ESG metrics, leaving investors without a holistic view of both financial performance and sustainable impact. Moreover, the emerging fields of decentralized finance and blockchain‐based carbon offsets remain disconnected from conventional investment tools, making it difficult for investors to align their portfolios with their environmental values. All finance applications are black box as of now, we aim to give the users the ability to control their owwn data

### Solution
Our project, PayMint, bridges this gap by integrating real‑time financial data, ESG metrics, and blockchain-based carbon offset solutions into a single, unified platform accessible by virtually anyone. By leveraging APIs for live market and sustainability data and an AI-powered analysis engine/chatbot that was built on a quantized Llama model, PayMint delivers personalized investment recommendations. PayMint aims to balance profitability with environmental impact. Additionally, we enable users to track their carbon footprints and directly purchase tokenized carbon offsets on Ethereum, thereby letting investors make informed, sustainable decisions that contribute to a greener future.

### Demo
[Watch the video](https://www.youtube.com/watch?v=ZQucrem36os)

[![Project Demo](https://img.youtube.com/vi/ZQucrem36os/0.jpg)](https://www.youtube.com/watch?v=ZQucrem36os)

### Live Project
[PayMint](https://big-brown-coder.vercel.app)


## Technical Implementation

### Technologies Used
- **Frontend**: [React,Tailwind]
- **Backend**: [Flask][solidity][Python]
- **Database**: [SQLite][NoSQL]
- **APIs**: [Yahoo Finance API & ESG API]
- **AI**: [NLP,LLM,GEN-AI]

### Key Features
#### AI-Powered Sustainable Investment Analysis:
Our chatbot is built on a quantized Llama-based language model (llama-cpp-python), designed to deliver intelligent, context-aware financial analysis and investment recommendations. What makes it stand out is its ability to balance profitability with sustainability, ensuring that users are not only making smart financial decisions but also considering eco-friendly alternatives.
Unlike static models, ours keeps track of conversation history, allowing for more natural and informed interactions. It continuously pulls real-time stock data and ESG (Environmental, Social, and Governance) metrics, so the insights it provides are always up to date. Whether you’re looking for the latest market trends or sustainable investment opportunities, the model adapts to your needs, providing accurate and actionable responses.
Trained on a mix of financial datasets and social sentiment from platforms like Twitter, it understands both the numbers and the broader market sentiment. And when you need real-time financial information, it taps into live finance APIs to ensure that every recommendation or analysis is backed by the latest data available. This means you get insights that aren’t just theoretically sound but also practical and relevant in the moment.

#### Integrated Financial & ESG Dashboard:
We integrate real-time market data with in-depth ESG (Environmental, Social, and Governance) metrics, giving investors a complete picture of both financial performance and sustainability impact. This allows for smarter, more responsible investment decisions without compromising profitability.
At the core of our system is a powerful stock screener, driven by a Natural Language to SQL model. Instead of relying on pre-set filters, users can define their own screening criteria using plain language, making the process highly flexible and intuitive. Whether you're looking for high-growth tech stocks with strong ESG ratings or undervalued companies with low carbon footprints, our system translates your requirements into precise database queries—giving you full control over your investment strategy.

#### Carbon Footprint Tracking & Blockchain Offset Purchasing:
Our system seamlessly integrates carbon footprint tracking with blockchain-based offset purchases, allowing users to manage their environmental impact while staying within the world of traditional finance. Built using Ethereum and Truffle, the platform enables users to update their carbon footprint, purchase tokenized carbon offsets, and receive CO2 tokens directly in their wallets.
Each CarbonOffset (CO2) token represents a verifiable carbon credit, ensuring that every offset purchase contributes to real-world sustainability efforts. The smart contract handles transactions securely, allowing for dynamic token pricing, decentralized purchases, and transparent fund withdrawals. By linking financial decision-making with automated sustainability actions, we provide a seamless way for users to offset emissions while engaging with their investments responsibly.

#### Minimal effort Expense tracker App
Most expense trackers require users to manually input every transaction, making budgeting a tedious task. Instead of manually entering every purchase, our app does the work for you— automatically logging every expense and income in real time. It even categorizes transactions intelligently by looking at where you are and what you’ve spent before, so you don’t have to sort through receipts later. Built with Kotlin on the mobile side, every change syncs instantly with the website, giving you a clear, up-to-date view of your finances without the hassle.

## Setup Instructions
 
### Prerequisites
- Requirement 1
- Requirement 2
- Requirement 3

### Installation 
Ensure you have Git installed, then clone the repository
```bash
git clone <repository_url>
cd <repository_name>

## 
npm install

## Ensure you have Node.js installed (recommended version: LTS). Then, install dependencies
npm install firebase


```
<h1>Backend Setup (Chatbot & Blockchain)</h1>
2.1 Navigate to the Backend Directory

```bash

cd ./backend/chatbot/
```

2.2 Install Solidity and Blockchain Dependencies

Install Truffle (for smart contract development & testing)

```bash

npm install -g truffle

```
2.3 Running the LLaMA 2-Based LLM Model


```bash
python3 esg.py
```

For CPU
```bash

pip install torch torchvision torchaudio

```

For GPU (CUDA)
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118


```

Kotlin Installation
If your project involves Kotlin, install it using SDKMAN
```bash
sdk install kotlin
```

For GPU (CUDA)

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

```

### Running the Project
```bash
cd ./backend/chatbot
python3 app.py
new terminal
cd ../../frontend/
npm run dev
```

## Additional Resources

### Project Timeline
#### Phase 1 – Planning & Design
On the train journey to Trivandrum we scoured through sustainable startups and fintech companies for inspiration and finally landed on our idea.

#### Phase 2 - AI Module & Conversation Management
One of the first features to be completed since the problem statement requires it 

#### Phase 3 & 4 - Blockchain & Carbon Offset, Frontend Development & Integration
#### Phase 5 – Deployment
Deployment has been completed.

### Challenges Faced
_Discuss technical challenges and how you overcame themt_
- First time working with blockchain technologies so we had to read a learn and navigate ourselves through the tech in a short span of time
- Due to lack of compute on our side, we had to learn to work with quantized models via yt videos and documentations on the go and made it possible to produce highly accurate results

### Future Enhancements
_Share your vision for future development_

- Full fledged mobile app for expense tracking
- Advanced and comphrehensive screener
- Deployment with good compute and resources

### Submission Checklist
- [✅] Completed all sections of this README
- [✅] Added project demo video
- [✅] Live Deployment
- [✅] Ensured all team members are listed
- [✅] Included setup instructions
- [✅] Submitted final code to repository

---

© Define 3.0 | [Define 3.0](https://www.define3.xyz/)
