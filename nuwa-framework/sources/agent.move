module nuwa_framework::agent {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::object::{Self, Object, ObjectID};
    use moveos_std::account::{Self, Account};
    use moveos_std::signer;
    use moveos_std::timestamp;
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::agent_cap::{Self, AgentCap};
    use nuwa_framework::memory::{Self, MemoryStore};
    use nuwa_framework::prompt_builder;
    use nuwa_framework::action::{Self, ActionDescription};
    use nuwa_framework::ai_request;
    use nuwa_framework::ai_service;
    use nuwa_framework::agent_input::{AgentInput};

    friend nuwa_framework::memory_action;
    friend nuwa_framework::action_dispatcher;

    /// Agent represents a running instance of a Character
    struct Agent has key {
        agent_address: address,
        character: Object<Character>,
        // The Agent account, every agent has its own account
        account: Object<Account>,
        last_active_timestamp: u64,
        memory_store: MemoryStore,
        model_provider: String,
    }

    const AI_GPT4O_MODEL: vector<u8> = b"gpt-4o";

    public fun create_agent(character: Object<Character>) : Object<AgentCap> {
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
            model_provider: string::utf8(AI_GPT4O_MODEL),
        };
        //TODO transfer some RGas to the agent account
        // Every account only has one agent
        let agent_obj = object::new_account_named_object(agent_address, agent);
        let agent_obj_id = object::id(&agent_obj);
        object::to_shared(agent_obj);
        let agent_cap = agent_cap::new_agent_cap(agent_obj_id);
        agent_cap
    }

    /// Generate system prompt based on Character attributes
    public fun generate_system_prompt<I: copy + drop>(
        agent: &Agent,
        input: AgentInput<I>,
    ): String {
        let character = object::borrow(&agent.character);
        let available_actions = get_available_actions(&input);
        prompt_builder::build_complete_prompt(
            agent.agent_address,
            character,
            &agent.memory_store,
            input,
            available_actions,
        )
    }

    public fun process_input<I: copy + drop>(
        caller: &signer,
        agent_obj: &mut Object<Agent>,
        input: AgentInput<I>,
    ) {
        let agent_id = object::id(agent_obj);
        let agent = object::borrow_mut(agent_obj);
        
        // Generate system prompt with context
        let system_prompt = generate_system_prompt(
            agent,
            input
        );

        // Create chat messages
        let messages = vector::empty();
        
        // Add system message
        vector::push_back(&mut messages, ai_request::new_system_chat_message(system_prompt));

        // Create chat request
        let chat_request = ai_request::new_chat_request(
            agent.model_provider,
            messages,
        );

        // Call AI service
        ai_service::request_ai(caller, agent_id, chat_request);

        agent.last_active_timestamp = timestamp::now_milliseconds();
    }

    // Helper function to get available actions
    fun get_available_actions<I: drop>(_input: &AgentInput<I>): vector<ActionDescription> {
        action::get_all_action_descriptions()
    }

    public fun borrow_mut_agent(agent_obj_id: ObjectID): &mut Object<Agent> {
        object::borrow_mut_object_shared(agent_obj_id)
    }

    public fun borrow_mut_agent_by_address(agent_addr: address): &mut Object<Agent> {
        let agent_obj_id = object::account_named_object_id<Agent>(agent_addr);
        object::borrow_mut_object_shared(agent_obj_id)
    }

    /// Get mutable reference to agent's memory store
    public(friend) fun borrow_mut_memory_store(agent: &mut Object<Agent>): &mut memory::MemoryStore {
        let agent_ref = object::borrow_mut(agent);
        &mut agent_ref.memory_store
    }

    /// Get immutable reference to agent's memory store
    public(friend) fun borrow_memory_store(agent: &Object<Agent>): &memory::MemoryStore {
        let agent_ref = object::borrow(agent);
        &agent_ref.memory_store
    }

    /// Get agent's address
    public fun get_agent_address(agent: &Object<Agent>): address {
        let agent_ref = object::borrow(agent);
        agent_ref.agent_address
    }

    public fun get_agent_username(agent: &Object<Agent>): &String {
        let agent_ref = object::borrow(agent);
        let character = object::borrow(&agent_ref.character);
        character::get_username(character)
    }

    public entry fun destroy_agent_cap(cap: Object<AgentCap>) {
        //TODO record a variable to show the agent cap is destroyed
        agent_cap::destroy_agent_cap(cap);
    }

    public fun is_agent_account(addr: address): bool {
        let agent_obj_id = object::account_named_object_id<Agent>(addr);
        object::exists_object(agent_obj_id)
    }

    #[test_only]
    /// Create a test agent for unit testing
    public fun create_test_agent(): (&mut Object<Agent>, Object<AgentCap>) {
        use std::string;
        use nuwa_framework::character;
        
        let char_data = character::new_character_data(
            string::utf8(b"Test Assistant"),
            string::utf8(b"test_assistant"),
            string::utf8(b"A helpful test assistant"),
            vector[string::utf8(b"Friendly"), string::utf8(b"Helpful")],
            vector[string::utf8(b"General knowledge")]
        );
        let character_obj = character::create_character(char_data);
        create_test_agent_with_character(character_obj)
    }

    #[test_only]
    public fun create_test_agent_with_character(character: Object<Character>): (&mut Object<Agent>, Object<AgentCap>) {
        use moveos_std::object;

        let agent_cap = create_agent(character);
        
        let agent_obj_id = agent_cap::get_agent_obj_id(&agent_cap);
        let agent_obj = object::borrow_mut_object_shared<Agent>(agent_obj_id);
        (agent_obj, agent_cap)
    }

    #[test]
    fun test_create_test_agent() {
        let (agent, agent_cap) = create_test_agent();
        assert!(object::is_shared(agent), 1);
        agent_cap::destroy_agent_cap(agent_cap);
    }
}