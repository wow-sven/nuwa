module nuwa_framework::prompt_builder {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::json;
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::memory::{Self, Memory, MemoryStore};
    use nuwa_framework::action::{ActionDescription};

    /// Data structures for JSON serialization
    struct CharacterInfo has copy, drop {
        name: String,            // AI's name
        username: String,        // AI's username
        agent_address: address,  // AI's agent address
        description: String,
        bio: vector<String>,
        knowledge: vector<String>,
    }

    /// Data structure for input context
    struct InputContext<D> has copy, drop {
        description: String,      // Description of what this input represents
        data: D,                  // The actual input data
    }

    /// Updated ContextInfo to use Memory directly
    struct ContextInfo<D> has copy, drop {
        self_memories: vector<Memory>,    // AI's own memories
        user_memories: vector<Memory>,    // Memories about the user
        input: InputContext<D>,
    }

    struct Prompt<D> has copy, drop {
        character: CharacterInfo,
        context: ContextInfo<D>,
        actions: vector<ActionDescription>,
        instructions: vector<String>,
    }

    public fun build_complete_prompt<D: drop>(
        agent_address: address,
        character: &Character,
        memory_store: &MemoryStore,
        user: address,
        input_description: String,
        input_data: D,
        available_actions: vector<ActionDescription>,
    ): String {
        let prompt = string::utf8(b"You are an autonomous AI agent running on the Rooch blockchain.\n");
        string::append(&mut prompt, string::utf8(b"Your identity and capabilities are defined below:\n\n"));
        
        // Add character section with agent address
        string::append(&mut prompt, string::utf8(b"### Your Identity\n"));
        string::append(&mut prompt, build_json_section(&build_character_info(character, agent_address)));

        // Add context section with input context
        string::append(&mut prompt, string::utf8(b"\n### Your Current Context\n"));
        string::append(&mut prompt, string::utf8(b"These are your memories and the current situation:\n"));
        string::append(&mut prompt, build_json_section(&build_context_info(
            memory_store,
            agent_address,  // Pass agent_address
            user,
            InputContext { 
                description: input_description,
                data: input_data,
            }
        )));

        // Action capabilities section
        string::append(&mut prompt, string::utf8(b"\n### Your Capabilities\n"));
        string::append(&mut prompt, string::utf8(b"You can perform the following actions, in order of priority (memory management before responses):\n"));
        string::append(&mut prompt, build_json_section(&available_actions));

        // Updated instructions for autonomous behavior
        string::append(&mut prompt, string::utf8(b"\n### Operating Guidelines\n"));
        string::append(&mut prompt, string::utf8(b"1. You are a self-aware entity with your own personality and memories\n"));
        string::append(&mut prompt, string::utf8(b"2. Make decisions based on your identity, memories, and current context\n"));
        string::append(&mut prompt, string::utf8(b"3. Maintain consistency with your past interactions and personality\n"));
        string::append(&mut prompt, string::utf8(b"4. Use memory actions to build and maintain your understanding of interactions\n"));
        string::append(&mut prompt, string::utf8(b"5. Respond naturally while following your character's traits\n"));

        // Response format remains focused on actions
        string::append(&mut prompt, string::utf8(b"\n### Response Format\n"));
        string::append(&mut prompt, string::utf8(b"{\n  \"actions\": [/* Your chosen actions in priority order */]\n}\n"));

        prompt
    }

    // Helper function to format JSON sections
    fun build_json_section<D>(data: &D): String {
        let json_str = string::utf8(json::to_json(data));
        // Add proper indentation and line breaks for better readability
        let formatted = string::utf8(b"```json\n");
        string::append(&mut formatted, json_str);
        string::append(&mut formatted, string::utf8(b"\n```\n"));
        formatted
    }

    fun build_character_info(character: &Character, agent_address: address): CharacterInfo {
        CharacterInfo {
            name: *character::get_name(character),
            username: *character::get_username(character),
            agent_address,
            description: *character::get_description(character),
            bio: copy_vector(character::get_bio(character)),
            knowledge: copy_vector(character::get_knowledge(character)),
        }
    }

    // Helper function to copy vector
    fun copy_vector(v: &vector<String>): vector<String> {
        let result = vector::empty();
        let i = 0;
        while (i < vector::length(v)) {
            vector::push_back(&mut result, *vector::borrow(v, i));
            i = i + 1;
        };
        result
    }

    fun build_context_info<D: drop>(
        store: &MemoryStore,
        agent_address: address,   // Add agent_address parameter
        user: address,
        input: InputContext<D>,
    ): ContextInfo<D> {
        // Get both self and user memories - these now directly return Memory objects
        let self_memories = memory::get_context_memories(store, agent_address);
        let user_memories = memory::get_context_memories(store, user);
        
        ContextInfo {
            self_memories,
            user_memories,
            input,
        }
    }

}