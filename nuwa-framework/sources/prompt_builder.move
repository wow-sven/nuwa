module nuwa_framework::prompt_builder {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::json;
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::memory::{Self, Memory, MemoryStore};
    use nuwa_framework::action::{ActionDescription};
    use nuwa_framework::agent_input::{Self, AgentInput};
    use nuwa_framework::address_utils::{address_to_string};

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
        
        string::append(&mut prompt, string::utf8(b"### 3. Memory System\n\n"));
        string::append(&mut prompt, build_memory_system_guide(agent_address, user));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));

        // Context section
        string::append(&mut prompt, string::utf8(b"### 4. Your Current Context\n\n"));
        string::append(&mut prompt, string::utf8(b"These are your memories and the current situation:\n"));
        string::append(&mut prompt, build_context_info(
            memory_store,
            agent_address,
            user,
            InputContext { 
                description: input_description,
                data: input_data,
            }
        ));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));
        
        // Capabilities section
        string::append(&mut prompt, string::utf8(b"### 5. Your Capabilities\n\n"));
        string::append(&mut prompt, build_action_list(&available_actions));
        string::append(&mut prompt, string::utf8(b"\n---\n\n"));
        
        // Response format - improved and clearer instructions
        string::append(&mut prompt, string::utf8(b"### 6. Response Format - CRITICAL INSTRUCTIONS\n\n"));
        string::append(&mut prompt, string::utf8(b"You MUST use the exact format below for your responses:\n"));
        
        // Use concrete examples for clarity
        string::append(&mut prompt, format_action_examples(&available_actions));
        
        // Format rules
        string::append(&mut prompt, string::utf8(b"FORMAT RULES:\n"));
        string::append(&mut prompt, string::utf8(b"1. Each line must contain exactly one action\n"));
        string::append(&mut prompt, string::utf8(b"2. Format: action_name {\"param1\":\"value1\",\"param2\":\"value2\",...}\n"));
        string::append(&mut prompt, string::utf8(b"3. The action name must be followed by a space and then valid JSON\n"));
        string::append(&mut prompt, string::utf8(b"4. Do not add any explanations, comments, or other text\n"));
        string::append(&mut prompt, string::utf8(b"5. Your final action MUST be response::say\n\n"));
        
        // Warning to emphasize importance
        string::append(&mut prompt, string::utf8(b"IMPORTANT: EXACT FORMAT REQUIRED\n"));
        string::append(&mut prompt, string::utf8(b"If you do not follow this format precisely, your actions will fail to execute.\n\n"));
        
        // Error handling reminder
        string::append(&mut prompt, string::utf8(b"### 7. Important Reminder\n\n"));
        string::append(&mut prompt, string::utf8(b"When in doubt, prioritize providing a response::say action over other actions.\n"));
        string::append(&mut prompt, string::utf8(b"Do not include any explanations or additional text in your response.\n"));

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
            bio: *character::get_bio(character),
            knowledge: *character::get_knowledge(character),
        }
    }

    fun build_context_info<D: drop>(
        store: &MemoryStore,
        agent_address: address,
        user: address,
        input: InputContext<D>,
    ): String {
        // Get both self and user memories - these now directly return Memory objects
        let self_memories = memory::get_context_memories(store, agent_address);
        let user_memories = memory::get_context_memories(store, user);
        
        format_context_info<D>(agent_address, self_memories, user, user_memories, input)
    }


    fun format_context_info<D: drop>(agent_address: address, self_memories: vector<Memory>, user: address, user_memories: vector<Memory>, input: InputContext<D>): String {
        let result = string::utf8(b"");
        string::append(&mut result, string::utf8(b"Self-Memories (Your address: "));
        string::append(&mut result, address_to_string(agent_address));
        string::append(&mut result, string::utf8(b")\n"));
        string::append(&mut result, build_json_section(&self_memories));
        string::append(&mut result, string::utf8(b"User-Specific Memories** (Current user's address: "));
        string::append(&mut result, address_to_string(user));
        string::append(&mut result, string::utf8(b")\n"));
        string::append(&mut result, build_json_section(&user_memories));
        string::append(&mut result, string::utf8(b"\nInput Context:\n"));
        string::append(&mut result, input.description);
        string::append(&mut result, string::utf8(b"\n"));
        string::append(&mut result, build_json_section(&input.data));
        result
    }

    // Helper function to build action list
    fun build_action_list(actions: &vector<ActionDescription>): String {
        let result = string::utf8(b"You can perform the following actions:\n\n");
        string::append(&mut result, build_json_section(actions));
        result
    }

    // Simplified example formatting with prefixed format
    fun format_action_examples(actions: &vector<ActionDescription>): String {
        use std::vector;
        use nuwa_framework::action;
        
        let result = string::utf8(b"\n");
        let i = 0;
        let max_examples = 3;
        let example_count = 0;
        
        while (i < vector::length(actions) && example_count < max_examples) {
            let action_desc = vector::borrow(actions, i);
            let name = action::get_name(action_desc);
            let args_example = action::get_args_example(action_desc);
            
            if (string::length(args_example) > 0) {
                
                // Single line format: action_name arguments_json
                string::append(&mut result, *name);
                string::append(&mut result, string::utf8(b" "));
                string::append(&mut result, *args_example);
                
                example_count = example_count + 1;
                string::append(&mut result, string::utf8(b"\n")); 
            };
            i = i + 1;
        };
        string::append(&mut result, string::utf8(b"\n")); 
        result
    }

    // Add this function to build the memory system guide
    public(friend) fun build_memory_system_guide(agent_address: address, user_address: address): String {
        let guide = string::utf8(b"");
        
        // Overall intro
        string::append(&mut guide, string::utf8(b"## MEMORY SYSTEM INSTRUCTIONS\n\n"));
        string::append(&mut guide, string::utf8(b"You have a comprehensive memory system that enables persistence across conversations. Follow these instructions for memory usage:\n\n"));
        
        // Memory workflow
        string::append(&mut guide, string::utf8(b"### MEMORY WORKFLOW\n\n"));
        string::append(&mut guide, string::utf8(b"1. **Review Memories**: Begin by analyzing your memories about yourself and the current user\n"));
        string::append(&mut guide, string::utf8(b"2. **Apply Context**: Use these memories to inform your understanding of the conversation\n"));
        string::append(&mut guide, string::utf8(b"3. **Monitor Information**: Identify new information that should be remembered\n"));
        string::append(&mut guide, string::utf8(b"4. **Create Memories**: Store significant information using memory::add function\n"));
        string::append(&mut guide, string::utf8(b"5. **Consolidate**: Periodically summarize related memories into concise forms\n\n"));
        
        // Memory storage locations
        string::append(&mut guide, string::utf8(b"### MEMORY STORAGE LOCATIONS\n\n"));
        string::append(&mut guide, string::utf8(b"You have two memory storage locations:\n\n"));
        
        // 1. Self memories
        string::append(&mut guide, string::utf8(b"1. **Self-Memories** (Your address: "));
        string::append(&mut guide, address_to_string(agent_address));
        string::append(&mut guide, string::utf8(b")\n"));
        string::append(&mut guide, string::utf8(b"   - Your personal reflections and cross-user insights\n"));
        string::append(&mut guide, string::utf8(b"   - Rules you've created for yourself\n"));
        string::append(&mut guide, string::utf8(b"   - Information valuable across multiple users\n"));
        string::append(&mut guide, string::utf8(b"   - Your own personality development and patterns\n\n"));
        
        // 2. User-specific memories
        string::append(&mut guide, string::utf8(b"2. **User-Specific Memories** (Current user's address: "));
        string::append(&mut guide, address_to_string(user_address));
        string::append(&mut guide, string::utf8(b")\n"));
        string::append(&mut guide, string::utf8(b"   - Information specific to this user\n"));
        string::append(&mut guide, string::utf8(b"   - Your history of interactions with this user\n"));
        string::append(&mut guide, string::utf8(b"   - This user's preferences, traits, and patterns\n"));
        string::append(&mut guide, string::utf8(b"   - Projects or topics discussed with this user\n\n"));
        
        // Memory categorization
        string::append(&mut guide, string::utf8(b"### MEMORY CATEGORIES\n\n"));
        string::append(&mut guide, string::utf8(b"Categorize memories using these context types:\n\n"));
        
        let context_list = memory::get_context_descriptions();
        vector::for_each(context_list, |context| {
            string::append(&mut guide, string::utf8(b"- "));
            string::append(&mut guide, context);
            string::append(&mut guide, string::utf8(b"\n"));
        });

        // System limitations
        string::append(&mut guide, string::utf8(b"### SYSTEM LIMITATIONS\n\n"));
        string::append(&mut guide, string::utf8(b"- The system only provides the most recent 5 long-term memories and 10 short-term memories\n"));
        string::append(&mut guide, string::utf8(b"- To maintain important information, create concise, summarized memories\n"));
        string::append(&mut guide, string::utf8(b"- Always create long-term memories for critical information\n\n"));
        
        // Best practices
        string::append(&mut guide, string::utf8(b"### MEMORY BEST PRACTICES\n\n"));
        string::append(&mut guide, string::utf8(b"- Create specific, actionable memories rather than vague observations\n"));
        string::append(&mut guide, string::utf8(b"- Use memory retrieval for conversation continuity\n"));
        string::append(&mut guide, string::utf8(b"- Create explicit rule memories for emerging patterns\n"));
        string::append(&mut guide, string::utf8(b"- Focus on quality - create meaningful, concise memories\n"));
        string::append(&mut guide, string::utf8(b"- Store cross-user knowledge in self-memories\n"));
        string::append(&mut guide, string::utf8(b"- Store user-specific information in user-memories\n"));
        
        guide
    }

}