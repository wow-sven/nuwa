#[test_only]
module nuwa_framework::agent_tests {
    use std::debug;
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::object;
    use nuwa_framework::character;
    use nuwa_framework::action;
    use nuwa_framework::memory;
    use nuwa_framework::memory_action;  
    use nuwa_framework::response_action;
    use nuwa_framework::prompt_builder;

    #[test_only]
    struct TestMessage has copy, drop {
        content: String,
        sender: address,
        timestamp: u64,
    }

    #[test]
    fun test_prompt_builder() {
        // Initialize actions
        action::init_for_test();
        memory_action::register_actions();
        response_action::register_actions();

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

        // Create memory store
        let store = memory::new_test_memory_store();
        let agent_address = @0x42;
        let test_user = @0x43;

        // Add test memory
        memory::add_memory(
            &mut store,
            test_user,
            string::utf8(b"User prefers detailed explanations"),
            memory::memory_type_knowledge(),
            memory::context_preference(),
            true
        );

        // Set test properties
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

        // Get available actions
        let available_actions = vector::empty();
        vector::append(&mut available_actions, action::get_action_descriptions(&vector::singleton(string::utf8(b"memory::add"))));
        vector::append(&mut available_actions, action::get_action_descriptions(&vector::singleton(string::utf8(b"response::say"))));

        // Create test message
        let test_message = TestMessage {
            content: string::utf8(b"I'm interested in learning about Move smart contracts"),
            sender: @0x42,
            timestamp: 1234567890,
        };

        // Build and verify prompt
        let prompt = prompt_builder::build_complete_prompt(
            agent_address,
            character,
            &store,
            test_user,
            string::utf8(b"User message to you"),
            test_message,
            available_actions
        );

        // Print generated prompt
        debug::print(&b"Generated Prompt:");
        debug::print(string::bytes(&prompt));

        // Clean up
        memory::destroy_memory_store_for_test(store);
        character::destroy_character(character_obj);
    }
}