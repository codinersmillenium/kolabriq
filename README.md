# Kolabriq – Decentralized AI-Powered Project Management

## 🌍 Introduction
**Kolabriq** is a **decentralized project management platform** built on blockchain to ensure **security, transparency, and privacy** in modern collaboration. With support from **Artificial Intelligence (AI)**, Kolabriq provides **smart task automation, productivity monitoring, and intelligent prioritization**, enabling teams to work more efficiently and improve workplace well-being.

Kolabriq integrates **Fetch.ai AI Agents (uAgents in Python)** for conversational LLM capabilities and **ICP (Internet Computer) canisters** for decentralized backend services. This creates a **unique Web3 use case** that blends secure data storage, AI-driven insights, and transparent project management.

## 🚀 Installation
  - mops sources
  - dfx generate in folder root
  - dfx start
  - dfx deploy
  - Installation Frontend
    - Change directory `cd {frontend}`
    - Install dependencies `npm install`
  - Installation Agent AI
    # 🐍 uAgents Setup Guide
      ## 📦 Prerequisites
        - Python **3.9+**
        - `pip3` (Python package manager)
      ## 🔧 Installation Steps
      ### 1. Change Directory
      ```bash
      change directory {fetchai}
      ```
      ### 2. Create Virtual Environment
      ```bash
      python3 -m venv venv
      ```
      ### 3. Activate Virtual Environment
      - On **Linux / macOS**:
        ```bash
        source venv/bin/activate
        ```
      - On **Windows (PowerShell)**:
        ```powershell
        .\venv\Scripts\activate
        ```
      
      ### 4. Install Dependencies
      ```bash
      pip3 install -r requirements.txt
      ```
      
      2. Run with:
         ```bash
         python3 agent.py
         ```

## 📝 Documentation Videos

- [Introduction](https://youtu.be/5HLSUoMf1v0)
- [Pitch](https://youtu.be/dQQ_Bji3Dmw)
- [Landing Prolog](https://drive.google.com/file/d/122R_cEsvz0U9HTxy03PWzUPUfbToJ8ZC/view?usp=sharing)
- [Register Admin](https://drive.google.com/file/d/1_IVVJFA8whsYkkkvlXC7CxMNvjib9zGX/view?usp=sharing)
- [Register Dev](https://drive.google.com/file/d/1dvknF3RbWgZVSwbTDMU4wo46nPPMgvtN/view?usp=sharing)
- [Topup Wallet](https://drive.google.com/file/d/1AW8LFvZPcVaYF6DeMnAyygY3UrOi5u_0/view?usp=sharing)
- [App 1](https://drive.google.com/file/d/1sjMfUOQCHjMWGP2Hieac6OMJ3OdjrArc/view?usp=sharing)
- [App 2](https://drive.google.com/file/d/1ST241O0ERshlartHE1vCqki6Quw_9yH9/view?usp=sharing)
- [App 3](https://drive.google.com/file/d/1jr8FHzz4U8vmAgMkuaOzeAWHKb-23r4f/view?usp=sharing)
- [Project Tools & AI Assistant](https://youtu.be/qnklYb2gIzM)
- [Project Payout](https://drive.google.com/file/d/17zRuKwJ2waqwr-Fh42scYueCgcStR5ZF/view?usp=share_link)



## 🚀 Features
1. **AI Assistant for Task Management**
   - Automates task scheduling, reminders, and updates.
   - Suggests priorities based on urgency and deadlines.

2. **Mood & Productivity Monitoring**
   - AI agent analyzes team sentiment.
   - Provides actionable suggestions to boost productivity.

3. **Cross-Border Collaboration**
   - Decentralized data access for global teams.
   - Users retain full control over their data.

4. **Integration with ICP & Fetch.ai**
   - **ICP Canisters** for decentralized task storage and audit trails.
   - **Python uAgents** (Fetch.ai) for smart LLM-driven conversations and planning.

5. **Privacy & Security**
   - Blockchain-based access control.

## 🌐 Future Potential
- **AI Agent Marketplace**: Teams can add specialized agents (HR, finance, R&D).
- **DAO Governance**: Community-driven feature roadmap.
- **Tokenized Incentives**: Reward systems for productivity & milestones.
- **Cross-Chain Collaboration**: Future interoperability with other blockchains.
- **Agile/Hybrid Integration**: Built-in support for Agile, Scrum, and hybrid workflows.

## 💰 Revenue Model
- **Freemium** → Free plan for small teams.
- **Pro Subscription** → Sentiment analysis, extended AI features, extra storage.
- **Enterprise Licensing** → Tailored plans for large organizations.
- **Token Economy** → Governance and reward incentives via utility tokens.
  
## 🏗️ Architecture Overview

```
Frontend (Next.js + Tailwind CSS)
    |
    v
ICP Canisters (Rust/Motoko)
- Task storage
- Access control
- Audit logs
    |
    +------> Decentralized Storage (ICP)
    |
    +------> Blockchain Security (Immutable Records)
    |
    v
AI Agent (Python + uAgents, Fetch.ai)
- Conversational LLM
- Mood monitoring
- Task prioritization
```

## 🔄 User Flow

```
[User]
   |
   | Uses Kolabriq via Next.js frontend (styled with Tailwind)
   v
[ICP Canister Backend]
   | - Creates new projects
   | - Stores task data securely
   | - Manages team access
   |
   +--> [AI Agent (Python uAgents)]
   |      - Chatbot for project guidance
   |      - Chatbot create project or task
   |      - Suggests task priority
   |
   +--> [ICP Blockchain]
          - Logs project history
          - Provides transparency & trust
   |
   v
[User receives results back in UI]
   - AI insights shown
   - Project tasks synced
   - Collaboration data updated
```

## ⚙️ Tech Stack
- **Frontend**: Next.js + Tailwind CSS
- **Backend**: ICP Canisters (Motoko/Rust)
- **AI Agent**: Python + uAgents (Fetch.ai)
- **Blockchain**: Internet Computer Protocol (ICP)
- **Hosting**: 
   - ICP for backend canisters
   - Netlify for frontend
   - Railway for Agent AI
   - Fetch AI Uagent for Model & Agent AI

## 🎉 Credits
This app is heavily using these free & open-source libraries
all the credits go to these peoples and communities
who had helped provide and develop these application
- [@radix-ui/react](https://www.radix-ui.com)
- [nextjs](https://nextjs.org)
- [lucide-react](https://lucide.dev/icons/)
- [@tailwind-css](https://tailwindcss.com)
- [internet-computer](https://internetcomputer.org)
- [@dfinity](https://dfinity.org)
- [fetchAi](https://fetch.ai)
- [netlify](https://netlify.com)
- [railway](https://railway.com)
- [nexadash](https://next.nexadash.demo.sbthemes.com)
- [openai](https://openai.com)

## Developer
- [https://github.com/codinersmillenium]
- [https://github.com/muhisyam]
- [https://github.com/BurhanMuthohar]
