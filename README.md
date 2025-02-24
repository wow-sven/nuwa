# Nuwa Framework

Nuwa is a Move-based framework for building autonomous AI agents on Rooch. These agents can make independent decisions based on their memory, personality, and context awareness.

## Architecture & Flow

```mermaid
graph TB
    subgraph "User Interaction"
        U[User] --> I[Input]
    end

    subgraph "Nuwa Agent"
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
            A3[Custom Actions]
        end
    end

    subgraph "AI Service"
        AI[LLM Processing]
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
    A1 --> |Update| SM
    A1 --> |Update| LM
    A2 --> |Response| U

    style D fill:#f9f,stroke:#333
    style AI fill:#9cf,stroke:#333
```

## Key Concepts

### Autonomous Decision Making
- Agents independently process input using their memory and character profile
- All actions are results of AI-driven decisions, not predefined rules
- Memories influence future decisions, creating continuous learning

### Contextual Awareness
- Short-term memory for recent interactions
- Long-term memory for important information
- Context-based memory retrieval for relevant decision making

### Character-Driven Behavior
- Personality traits guide response style
- Knowledge areas define expertise boundaries
- Bio traits influence decision-making patterns

## Features

- **Memory Management**: Structured memory system for both short-term and long-term storage
- **Action Framework**: Extensible action system for agent behaviors
- **Context-Aware**: Maintains interaction history and user preferences
- **AI Integration**: Built-in support for LLM-based AI services
- **On-chain State**: Persistent state management on Rooch

## Core Components

### Agent System
- Character-based agent creation
- Customizable personality traits
- Interaction history tracking

### Memory System
- Short-term and long-term memory storage
- Context-based memory organization
- Index-based memory updates

### Action System
- Built-in actions:
  - `memory::add` - Store new memories
  - `memory::update` - Update existing memories
  - `response::say` - Generate responses

## Architecture

```
nuwa-framework/
├── sources/
│   ├── action.move         - Action registration and management
│   ├── memory.move         - Memory storage and retrieval
│   ├── agent.move          - Agent core functionality
│   ├── character.move      - Agent personality definition
│   └── prompt_builder.move - AI prompt construction
└── tests/
    └── agent_tests.move    - Integration tests
```

## Development

### Prerequisites
- Rooch CLI

### Testing
Run the test suite:
```bash
rooch move test
```

## License

Apache 2.0