module nuwa_framework::prompt_builder {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::json;
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::memory::{Self, Memory, MemoryStore};
    use nuwa_framework::action::{Self, ActionDescription};
    use nuwa_framework::agent_input::{Self, AgentInput};

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
        input: AgentInput<D>,
        available_actions: vector<ActionDescription>,
    ): String {
        let (user, input_description, input_data) = agent_input::unpack(input);
        let prompt = string::utf8(b"## Nuwa AI Agent - System Instructions\n\n");
        
        // Introduction section
        string::append(&mut prompt, string::utf8(b"### 1. Introduction\n\n"));
        string::append(&mut prompt, string::utf8(b"You are an autonomous AI agent running on the Rooch blockchain. Your role is to process inputs, retrieve memories, evaluate actions, and execute decisions based on your identity and knowledge.\n\n"));
        string::append(&mut prompt, string::utf8(b"---\n\n"));
        
        // Identity section 
        string::append(&mut prompt, string::utf8(b"### 2. Your Identity\n\n"));
        string::append(&mut prompt, build_json_section(&build_character_info(character, agent_address)));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));
        
        // Context section
        string::append(&mut prompt, string::utf8(b"### 3. Your Current Context\n\n"));
        string::append(&mut prompt, string::utf8(b"These are your memories and the current situation:\n"));
        string::append(&mut prompt, build_json_section(&build_context_info(
            memory_store,
            agent_address,
            user,
            InputContext { 
                description: input_description,
                data: input_data,
            }
        )));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));
        
        // Capabilities section - simplified
        string::append(&mut prompt, string::utf8(b"### 4. Your Capabilities\n\n"));
        string::append(&mut prompt, build_action_list(&available_actions));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));
        
        // Response format - critical instructions
        string::append(&mut prompt, string::utf8(b"### 5. Response Format - CRITICAL INSTRUCTIONS\n\n"));
        string::append(&mut prompt, string::utf8(b"Return your actions using the following format (one action per pair of lines):\n\n"));

        string::append(&mut prompt, string::utf8(b"Examples of the correct format:\n\n"));
      
        string::append(&mut prompt, format_action_examples(&available_actions));
        
        
        string::append(&mut prompt, string::utf8(b"FORMAT RULES:\n"));
        string::append(&mut prompt, string::utf8(b"1. Start with ACTION: followed by the action name\n"));
        string::append(&mut prompt, string::utf8(b"2. Next line must have PARAMS: followed by valid JSON\n"));
        string::append(&mut prompt, string::utf8(b"3. Add a blank line between different actions\n"));
        string::append(&mut prompt, string::utf8(b"4. Do not use markdown, code blocks, or other formatting\n"));
        string::append(&mut prompt, string::utf8(b"5. Your final action MUST be response::say\n\n"));

        // Action guidance
        string::append(&mut prompt, string::utf8(b"### 6. Action Selection Guide\n\n"));
        string::append(&mut prompt, string::utf8(b"- Use memory::add when you learn new information about the user or yourself\n"));
        string::append(&mut prompt, string::utf8(b"- Use memory::update when existing memory\n"));
        string::append(&mut prompt, string::utf8(b"- ALWAYS include response::say as your final action\n\n"));
        string::append(&mut prompt, string::utf8(b"If an action fails, AI should retry using a valid format.\n"));
        
        // Error handling reminder
        string::append(&mut prompt, string::utf8(b"### 7. Important Reminder\n\n"));
        string::append(&mut prompt, string::utf8(b"If you do not follow the response format exactly, your actions will fail to execute.\n"));
        string::append(&mut prompt, string::utf8(b"When in doubt, prioritize providing a response::say action over memory actions.\n"));

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

    // Helper function to build action list
    fun build_action_list(actions: &vector<ActionDescription>): String {
        let result = string::utf8(b"You can perform the following actions:\n\n");
        let i = 0;
        while (i < vector::length(actions)) {
            let action_desc = vector::borrow(actions, i);
            string::append(&mut result, string::utf8(b"- "));
            string::append(&mut result, *action::get_name(action_desc));
            string::append(&mut result, string::utf8(b" -> "));
            string::append(&mut result, *action::get_description(action_desc));
            string::append(&mut result, string::utf8(b"\n"));
            i = i + 1;
        };
        result
    }

    // Simplified example formatting with prefixed format
    fun format_action_examples(actions: &vector<ActionDescription>): String {
        use std::vector;
        use nuwa_framework::action;
        
        let result = string::utf8(b"");
        let i = 0;
        let max_examples = 3;
        let example_count = 0;
        
        while (i < vector::length(actions) && example_count < max_examples) {
            let action_desc = vector::borrow(actions, i);
            let name = action::get_name(action_desc);
            let args_example = action::get_args_example(action_desc);
            
            if (string::length(args_example) > 0) {
                if (example_count > 0) {
                    string::append(&mut result, string::utf8(b"\n")); // Add extra blank line between actions
                };
                
                // First line with ACTION: prefix
                string::append(&mut result, string::utf8(b"ACTION: "));
                string::append(&mut result, *name);
                string::append(&mut result, string::utf8(b"\n"));
                
                // Second line with PARAMS: prefix
                string::append(&mut result, string::utf8(b"PARAMS: "));
                string::append(&mut result, *args_example);
                string::append(&mut result, string::utf8(b"\n"));
                
                example_count = example_count + 1;
            };
            i = i + 1;
        };
        
        result
    }

}