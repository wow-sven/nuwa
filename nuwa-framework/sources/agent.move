module nuwa_framework::agent {
    use std::string::{String};
    use std::vector;
    use moveos_std::object::{Self, Object};
    use moveos_std::account::{Self, Account};
    use moveos_std::signer;
    use moveos_std::timestamp;
    use nuwa_framework::character::{Character};
    use nuwa_framework::agent_cap;
    use nuwa_framework::memory::{Self, MemoryStore};
    use nuwa_framework::prompt_builder;
    use nuwa_framework::action::ActionDescription;

    /// Agent represents a running instance of a Character
    struct Agent has key {
        agent_address: address,
        character: Object<Character>,
        // The Agent account, every agent has its own account
        account: Object<Account>,
        last_active_timestamp: u64,
        memory_store: MemoryStore,
    }

    struct AgentInput<I> has store {
        sender: address,
        input_description: String,
        input_data: I,
        actions: vector<String>,
    }

    /// Constants for system prompt templates
    const CHARACTER_PROMPT: vector<u8> = b"You are {name}. {system}\n\nBio:\n{bio}\n\nLore:\n{lore}\n\nKnowledge:\n{knowledge}";
    const MAX_CONTEXT_MESSAGES: u64 = 10;

    public entry fun create_agent(creater: &signer, character: Object<Character>) {
        let creater_addr = signer::address_of(creater);
        let agent_account = account::create_account();
        let agent_signer = account::create_signer_with_account(&mut agent_account);
        //TODO provide a function to get address from account
        let agent_address = signer::address_of(&agent_signer);
        let agent = Agent {
            agent_address,
            character,
            account: agent_account,
            last_active_timestamp: timestamp::now_milliseconds(),
            memory_store: memory::new_memory_store(),
        };
        //TODO transfer some RGas to the agent account
        // Every account only has one agent
        let agent_obj = object::new_account_named_object(agent_address, agent);
        let agent_obj_id = object::id(&agent_obj);
        object::to_shared(agent_obj);
        let agent_cap = agent_cap::new_agent_cap(agent_obj_id);
        object::transfer(agent_cap, creater_addr);    
    }

    /// Generate system prompt based on Character attributes
    public fun generate_system_prompt<I: drop>(
        agent: &Agent,
        input: &AgentInput<I>,
        available_actions: vector<ActionDescription>,
    ): String {
        let character = object::borrow(&agent.character);
        prompt_builder::build_complete_prompt(
            character,
            &agent.memory_store,
            input.sender,
            input.input_description,
            available_actions,
        )
    }

    public fun process_input<I: drop>(
        agent_obj: &mut Object<Agent>,
        input: AgentInput<I>,
    ) {
        let agent = object::borrow_mut(agent_obj);
        // Get available actions for this input
        let available_actions = get_available_actions(&input);
        
        // Generate system prompt with context
        let _system_prompt = generate_system_prompt(
            agent,
            &input,
            available_actions
        );

        // TODO: Call AI service to generate response
        let AgentInput {
            sender: _,
            input_description: _,
            input_data: _,
            actions: _,
        } = input;
        agent.last_active_timestamp = timestamp::now_milliseconds();
    }

    // Helper function to get available actions
    fun get_available_actions<I: drop>(_input: &AgentInput<I>): vector<ActionDescription> {
        // TODO: Implement action resolution based on input type and context
        vector::empty()
    }

    /// Get mutable reference to agent's memory store
    public fun borrow_memory_store_mut(agent: &mut Object<Agent>): &mut memory::MemoryStore {
        let agent_ref = object::borrow_mut(agent);
        &mut agent_ref.memory_store
    }

    /// Get immutable reference to agent's memory store
    public fun borrow_memory_store(agent: &Object<Agent>): &memory::MemoryStore {
        let agent_ref = object::borrow(agent);
        &agent_ref.memory_store
    }

    #[test]
    fun test_agent() {
        // TODO: Add test cases
    }
}