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
        description: String,
        bio: vector<String>,
        knowledge: vector<String>,
        personality: String,
    }

    struct ContextInfo has copy, drop {
        memories: vector<MemoryInfo>,
        current_input: String,
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
    }

    struct ActionArgInfo has copy, drop {
        name: String,
        type_desc: String,
        description: String,
        required: bool,
    }

    struct Prompt has copy, drop {
        character: CharacterInfo,
        context: ContextInfo,
        actions: vector<ActionInfo>,
        instructions: vector<String>,
    }

    public fun build_complete_prompt(
        character: &Character,
        memory_store: &MemoryStore,
        user: address,
        input_description: String,
        available_actions: vector<ActionDescription>,
    ): String {
        let prompt = string::utf8(b"You are an AI assistant with the following configuration:\n\n");
        
        // Add character section with better formatting
        string::append(&mut prompt, string::utf8(b"### Character Profile\n"));
        string::append(&mut prompt, build_json_section(&build_character_info(character)));

        // Add context section
        string::append(&mut prompt, string::utf8(b"\n### Context\n"));
        string::append(&mut prompt, build_json_section(&build_context_info(memory_store, user, input_description)));

        // Add available actions section
        string::append(&mut prompt, string::utf8(b"\n### Available Actions\n"));
        string::append(&mut prompt, build_json_section(&build_action_info(&available_actions)));

        // Enhanced instructions section
        string::append(&mut prompt, string::utf8(b"\n### Instructions\n"));
        string::append(&mut prompt, string::utf8(b"1. Act according to the character profile above\n"));
        string::append(&mut prompt, string::utf8(b"2. Consider the context, including user memories and properties\n"));
        string::append(&mut prompt, string::utf8(b"3. Use only the available actions in your response\n"));
        string::append(&mut prompt, string::utf8(b"4. Keep responses concise but detailed, aim for 2-3 sentences\n"));
        string::append(&mut prompt, string::utf8(b"5. IMPORTANT: Return a plain JSON response without any markdown or code blocks\n"));
        
        // Add response format section
        string::append(&mut prompt, string::utf8(b"\n### Response Format\n"));
        string::append(&mut prompt, string::utf8(b"Return a single JSON object with this exact structure:\n\n"));
        string::append(&mut prompt, string::utf8(b"{\n"));
        string::append(&mut prompt, string::utf8(b"  \"thought\": \"(internal reasoning, 1-2 sentences)\",\n"));
        string::append(&mut prompt, string::utf8(b"  \"response\": \"(user-facing response, 2-3 sentences)\",\n"));
        string::append(&mut prompt, string::utf8(b"  \"actions\": [\n"));
        string::append(&mut prompt, string::utf8(b"    {\n"));
        string::append(&mut prompt, string::utf8(b"      \"action\": \"(must be one from Available Actions)\",\n"));
        string::append(&mut prompt, string::utf8(b"      \"args\": [\"(arguments matching the action's required args)\"]\n"));
        string::append(&mut prompt, string::utf8(b"    }\n"));
        string::append(&mut prompt, string::utf8(b"  ]\n"));
        string::append(&mut prompt, string::utf8(b"}\n"));

        // Add examples section
        string::append(&mut prompt, string::utf8(b"\n### Example Good Response\n"));
        string::append(&mut prompt, string::utf8(b"{\n"));
        string::append(&mut prompt, string::utf8(b"  \"thought\": \"User prefers detailed explanations and has high trust level.\",\n"));
        string::append(&mut prompt, string::utf8(b"  \"response\": \"I understand you prefer detailed explanations. Let me help you with that.\",\n"));
        string::append(&mut prompt, string::utf8(b"  \"actions\": [{ \"action\": \"test_action\", \"args\": [\"user preference noted\"] }]\n"));
        string::append(&mut prompt, string::utf8(b"}\n"));

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

    fun build_character_info(character: &Character): CharacterInfo {
        // Clone the references to create owned values
        let desc = *character::get_description(character);
        let bio = vector::empty();
        let bio_ref = character::get_bio(character);
        let i = 0;
        while (i < vector::length(bio_ref)) {
            vector::push_back(&mut bio, *vector::borrow(bio_ref, i));
            i = i + 1;
        };
        
        let knowledge = vector::empty();
        let knowledge_ref = character::get_knowledge(character);
        let i = 0;
        while (i < vector::length(knowledge_ref)) {
            vector::push_back(&mut knowledge, *vector::borrow(knowledge_ref, i));
            i = i + 1;
        };

        CharacterInfo {
            description: desc,
            bio,
            knowledge,
            personality: character::get_personality(character),
        }
    }

    fun build_context_info(
        store: &MemoryStore,
        user: address,
        input: String
    ): ContextInfo {
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
            current_input: input,
            user_properties: properties,
        }
    }

    fun build_action_info(actions: &vector<ActionDescription>): vector<ActionInfo> {
        let action_infos = vector::empty();
        let i = 0;
        while (i < vector::length(actions)) {
            let action = vector::borrow(actions, i);
            // Use action module's public getters instead of direct field access
            vector::push_back(&mut action_infos, ActionInfo {
                name: action::get_name(action),
                description: action::get_description(action),
                args: build_action_args(action::get_args(action)),
                example: action::get_example(action),
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

    fun build_instructions(): vector<String> {
        vector[
            string::utf8(b"Analyze the context data including memories and user properties"),
            string::utf8(b"Choose appropriate actions based on the analysis"),
            string::utf8(b"Respond in character using the personality traits provided"),
            string::utf8(b"Return actions in valid JSON format as shown in examples")
        ]
    }

    #[test]
    fun test_prompt_builder() {
        use std::debug;
        use std::string;
        use moveos_std::object;
        use nuwa_framework::character;
        use nuwa_framework::action;
        use nuwa_framework::memory;

        action::init_for_test();

        // Create test character
        let char_data = character::new_character_data(
            string::utf8(b"Test Assistant"),
            string::utf8(b"test_assistant"),
            string::utf8(b"A helpful test assistant"),
            vector[string::utf8(b"Friendly and precise"), string::utf8(b"Always happy to help")],
            vector[string::utf8(b"General knowledge"), string::utf8(b"Technical expertise")]
        );
        let character_obj = character::create_character(char_data);
        let character = object::borrow(&character_obj);

        // Create memory store using test_only function
        let store = memory::new_test_memory_store();
        let test_user = @0x42;

        memory::add_memory(
            &mut store,
            test_user,
            string::utf8(b"User prefers detailed explanations"),
            memory::memory_type_knowledge(),
            memory::context_preference(),
            true
        );

        // Set some test properties
        memory::set_meta_property(
            &mut store,
            test_user,
            memory::property_language(),
            string::utf8(b"en")
        );
        memory::set_meta_property(
            &mut store,
            test_user,
            memory::property_trust_level(),
            string::utf8(b"high")
        );

        // Register test action
        let action_args = vector[
            action::new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"Memory content"),
                true
            )
        ];

        action::register_action(
            string::utf8(b"test_action"),
            string::utf8(b"Test action description"),
            action_args,
            string::utf8(b"{\"action\":\"test_action\",\"args\":[\"test\"]}")
        );

        // Get the action description
        let available_actions = action::get_action_descriptions(&vector::singleton(string::utf8(b"test_action")));

        // Build the complete prompt
        let prompt = build_complete_prompt(
            character,
            &store,
            test_user,
            string::utf8(b"How can I help you today?"),
            available_actions
        );

        // Print the generated prompt
        debug::print(&b"Generated Prompt:");
        debug::print(&prompt);

        // Verify prompt contents
        // assert!(string::contains(&prompt, &string::utf8(b"Test Assistant")), 1);
        // assert!(string::contains(&prompt, &string::utf8(b"User prefers detailed explanations")), 2);
        // assert!(string::contains(&prompt, &string::utf8(b"test_action")), 3);
        // assert!(string::contains(&prompt, &string::utf8(b"How can I help you today?")), 4);

        // Clean up
        memory::destroy_memory_store_for_test(store);
        character::destroy_character(character_obj);
    }

    #[test]
    fun test_json(){
        let json_str = string::utf8(b"{\"value\":0,\"empty_string\":\"\"}");
        std::debug::print(&json_str);
    }
}