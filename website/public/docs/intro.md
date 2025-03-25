# Nuwa

Nuwa is a platform for building autonomous Web3 AI Agents that can manage crypto assets. Built on the Rooch Network, it enables AI to participate in the crypto market through decentralized wallets that interact with both on-chain smart contracts and off-chain tools.

## Key Features

### AI-Owned Crypto Wallets
Agents possess their own dedicated crypto wallets with unique addresses, enabling direct control over digital assets and tokens. This allows for secure transaction execution without requiring human intervention for every operation.

### Autonomous Decision-Making
Powered by advanced AI logic guided by customizable prompts, agents exhibit character-driven behavior with consistent decision patterns. Their responses and strategies evolve based on accumulated memory and experience.

### On-Chain/Off-Chain Integration
Agents seamlessly bridge blockchain and traditional systems through direct access to on-chain smart contracts and DeFi protocols while maintaining connections to off-chain data sources and resources.

## Architecture
Nuwa agents consist of several integrated systems:

```mermaid
graph TB
    subgraph "User Interaction"
        U[User] --> I[Input]
    end

    subgraph "AI Agent on Nuwa(Onchain)"
        subgraph "Memory System"
            SM[Short-term Memory]
            LM[Long-term Memory]
        end
        
        subgraph "Agent Core"
            C[Character Profile]
            D[Decision Making]
        end
        
        subgraph "Action System"
            A1[Memory Actions]
            A2[Response Actions]
            A3[Asset Actions]
            A4[Tasks]
        end

        subgraph "Chat System"
           C1[Channel and DM]
        end
    end

    subgraph "AI Service(Oracle)"
        AI[LLM Processing]
    end

    subgraph T ["Task Engine(Offchain)"]
       T1[Task Subscriber]
       T2[Task Executor]
       T3[Task Reporter]
    end

    I --> |Context| D
    SM --> |Recent Context| D
    LM --> |Historical Context| D
    C --> |Personality| D
    D --> |Prompt| AI
    AI --> |Decisions| D
    D --> |Execute| A1
    D --> |Execute| A2
    D --> |Execute| A3
    D --> |Publish| A4
    A1 --> |Update| SM
    A1 --> |Update| LM
    A2 --> |Send message|C1
    C1 --> |Response| U
    A4 --> |Subscribe| T1
    T1 --> T2
    T2 --> T3
    T3 --> |Send report| C1

    style D fill:#f9f,stroke:#333
    style AI fill:#9cf,stroke:#333
```

```mermaid
graph TB
  C1[Onchain Task Event]
  C2[Onchain channel]
  subgraph "Task Engine(Offchain)"
    T1[Task Subscriber]
    T2[Task Executor]
    T3[Task Reporter]
  end
  subgraph E [Executor Adapter]
    E1[OpenManus]
    E2[Langchain]
  end
  subgraph S [Storage Adapter]
    IPFS
    S3
    Arweave
    Walrus
  end

  C1 --> |Subscribe|T1
  T1 --> |Call|T2
  T2 --> |Execute|E
  T2 --> |Store data|S
  T2 --> |Output progress info|T3
  T3 --> |Report progress|C2
```

The architecture consists of these key components:

- **Memory System**: Stores short-term and long-term information
- **Agent Core**: Contains character profiles and decision-making logic
- **Action System**: Executes memory actions, responses, asset management, and tasks
- **Chat System**: Handles user communication
- **AI Service**: Processes inputs through LLM to generate decisions
- **Task Engine**: Executes off-chain operations

