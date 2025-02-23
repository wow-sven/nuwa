module nuwa_framework::prompt_builder {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::json;
    use moveos_std::simple_map::{Self, SimpleMap};
    use nuwa_framework::character::{Self, Character};
    use nuwa_framework::memory::{Self, MemoryStore};
    use nuwa_framework::action::{Self, ActionDescription, ActionArgument};

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

    /// Updated ContextInfo to include input context
    struct ContextInfo<D> has copy, drop {
        memories: vector<MemoryInfo>,
        input: InputContext<D>,
        user_properties: SimpleMap<String, String>,
    }

    struct MemoryInfo has copy, drop {
        content: String,
        context: String,
        timestamp: u64,
    }

    struct ActionInfo has copy, drop {
        name: String,
        description: String,
        args: vector<ActionArgInfo>,
        example: String,
        usage_hint: String,
        constraints: String,
    }

    struct ActionArgInfo has copy, drop {
        name: String,
        type_desc: String,
        description: String,
        required: bool,
    }

    struct Prompt<D> has copy, drop {
        character: CharacterInfo,
        context: ContextInfo<D>,
        actions: vector<ActionInfo>,
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
        let prompt = string::utf8(b"You are an AI assistant with the following configuration:\n\n");
        
        // Add character section with agent address
        string::append(&mut prompt, string::utf8(b"### Character Profile\n"));
        string::append(&mut prompt, build_json_section(&build_character_info(character, agent_address)));

        // Add context section with input context
        string::append(&mut prompt, string::utf8(b"\n### Context\n"));
        string::append(&mut prompt, build_json_section(&build_context_info(
            memory_store,
            user,
            InputContext { 
                description: input_description,
                data: input_data,
            }
        )));

        // Simplified action section
        string::append(&mut prompt, string::utf8(b"\n### Available Actions\n"));
        string::append(&mut prompt, string::utf8(b"Actions are ordered by their namespace (memory:: actions should be executed before response::)\n"));
        string::append(&mut prompt, build_json_section(&build_action_info(&available_actions)));

        // Simplified instructions
        string::append(&mut prompt, string::utf8(b"\n### Instructions\n"));
        string::append(&mut prompt, string::utf8(b"1. Act according to the character profile above\n"));
        string::append(&mut prompt, string::utf8(b"2. Consider the context and follow each action's usage hints and constraints\n"));
        string::append(&mut prompt, string::utf8(b"3. Return a plain JSON response with only the actions array\n"));

        // Simplified response format
        string::append(&mut prompt, string::utf8(b"\n### Response Format\n"));
        string::append(&mut prompt, string::utf8(b"{\n  \"actions\": [/* actions ordered by usage_order */]\n}\n"));

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
        user: address,
        input: InputContext<D>,
    ): ContextInfo<D> {
        let memories = memory::get_context_memories(store, user);
        let memory_infos = vector::empty();
        let i = 0;
        while (i < vector::length(&memories)) {
            let memory = vector::borrow(&memories, i);
            vector::push_back(&mut memory_infos, MemoryInfo {
                content: memory::get_content(memory),
                context: memory::get_context(memory),
                timestamp: memory::get_timestamp(memory),
            });
            i = i + 1;
        };

        // Convert properties from vector to SimpleMap
        let properties = simple_map::new();
        let props = memory::get_all_properties(store, user);
        let i = 0;
        while (i < vector::length(&props)) {
            let prop = vector::borrow(&props, i);
            simple_map::add(&mut properties, memory::get_property_key(prop), memory::get_property_value(prop));
            i = i + 1;
        };

        ContextInfo {
            memories: memory_infos,
            input,
            user_properties: properties,
        }
    }

    fun build_action_info(actions: &vector<ActionDescription>): vector<ActionInfo> {
        let action_infos = vector::empty();
        let i = 0;
        while (i < vector::length(actions)) {
            let action = vector::borrow(actions, i);
            vector::push_back(&mut action_infos, ActionInfo {
                name: action::get_name(action),
                description: action::get_description(action),
                args: build_action_args(action::get_args(action)),
                example: action::get_example(action),
                usage_hint: action::get_usage_hint(action),
                constraints: action::get_constraints(action),
            });
            i = i + 1;
        };
        action_infos
    }

    fun build_action_args(args: &vector<ActionArgument>): vector<ActionArgInfo> {
        let arg_infos = vector::empty();
        let i = 0;
        while (i < vector::length(args)) {
            let arg = vector::borrow(args, i);
            vector::push_back(&mut arg_infos, ActionArgInfo {
                name: action::get_arg_name(arg),
                type_desc: action::get_arg_type_desc(arg),
                description: action::get_arg_description(arg),
                required: action::get_arg_required(arg),
            });
            i = i + 1;
        };
        arg_infos
    }

}