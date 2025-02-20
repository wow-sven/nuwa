module nuwa_framework::agent {
    use std::string::{Self, String};
    use moveos_std::object::{Self, Object};
    use moveos_std::account::{Self, Account};
    use moveos_std::signer;
    use moveos_std::timestamp;
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::agent_cap::{Self, AgentCap};

    /// Agent represents a running instance of a Character
    struct Agent has key {
        agent_address: address,
        character: Object<Character>,
        // The Agent account, every agent has its own account
        account: Object<Account>,
        last_active_timestamp: u64,
    }

    struct AgentInput<I> has store {
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
    fun generate_system_prompt(character: &Character): String {
        // TODO: Implement template rendering with character fields
        // This is a simplified version
        let prompt = string::utf8(CHARACTER_PROMPT);
        // Replace template variables with character attributes
        prompt
    }

    public fun process_input<I: drop>(
        agent_obj: &mut Object<Agent>,
        input: AgentInput<I>,
    ) {
        let agent = object::borrow_mut(agent_obj);
        let character = object::borrow(&agent.character);
        let _system_prompt = generate_system_prompt(character);
        // Call AI service to generate response
        let AgentInput {
            input_description: _,
            input_data: _,
            actions: _,
        } = input;
        agent.last_active_timestamp = timestamp::now_milliseconds();
    }


    #[test]
    fun test_agent() {
        // TODO: Add test cases
    }
}