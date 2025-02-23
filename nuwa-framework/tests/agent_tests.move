#[test_only]
module nuwa_framework::agent_tests {
    use std::debug;
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::object;
    use nuwa_framework::character;
    use nuwa_framework::action;
    use nuwa_framework::memory_action;  
    use nuwa_framework::response_action;
    use nuwa_framework::agent;
    use nuwa_framework::action_dispatcher;

    #[test_only]
    struct TestMessage has copy, drop {
        content: String,
        sender: address,
        timestamp: u64,
    }

    struct MessageInput has copy, drop {
        history: vector<TestMessage>,
        current: TestMessage,
    }

    const MESSAGE_INPUT_DESCRIPTION: vector<u8> = b"This is a conversation input. The `history` contains previous messages in chronological order, each message has `sender` (address), `content` (the message text), and `timestamp`. The `current` is the latest message that needs your response. Messages from users have their addresses as sender, messages from you have your agent address as sender.";

    #[test]
    fun test_prompt_builder() {
        // Initialize actions
        action::init_for_test();
        memory_action::register_actions();
        response_action::register_actions();

        // Create test character with more detailed personality
        let char_data = character::new_character_data(
            string::utf8(b"MoveGuide"),
            string::utf8(b"move_guide"),
            string::utf8(b"A specialized Move programming assistant with expertise in blockchain development"),
            vector[
                string::utf8(b"Patient and methodical in explanations"),
                string::utf8(b"Always provides practical code examples"),
                string::utf8(b"Focuses on best practices and security"),
                string::utf8(b"Adapts explanations to user's skill level"),
                string::utf8(b"Encourages learning through hands-on coding")
            ],
            vector[
                string::utf8(b"Move language and smart contract development"),
                string::utf8(b"Blockchain architecture and principles"),
                string::utf8(b"Smart contract security and auditing"),
                string::utf8(b"Development tools and testing frameworks"),
                string::utf8(b"Resource-oriented programming concepts")
            ]
        );
        let character_obj = character::create_character(char_data);
        let (agent, cap) = agent::create_test_agent_with_character(character_obj);
        
        
        let test_user = @0x43;

        // First interaction: User introduces themselves
        let test_message = TestMessage {
            content: string::utf8(b"Hi, I'm Alex. I prefer learning with real code examples and practical projects. I'm very interested in Move smart contracts and blockchain development. Could you help me learn?"),
            sender: test_user,
            timestamp: 1234567890,
        };
        let message_input = MessageInput{
            history: vector::empty(),
            current: test_message,
        };

        let agent_input = agent::create_agent_input(
            test_user,
            string::utf8(MESSAGE_INPUT_DESCRIPTION),
            message_input
        );

        // Get first prompt
        let prompt = agent::generate_system_prompt(object::borrow(agent), &agent_input);

        // Print first prompt
        debug::print(&string::utf8(b"First Prompt:"));
        debug::print(string::bytes(&prompt));

        // Process AI's response
        let ai_response = string::utf8(b"{\"actions\":[{\"action\":\"memory::add\",\"args\":[\"0x43\",\"Alex prefers learning with real code examples and practical projects, is very interested in Move smart contracts and blockchain development.\",\"preference\",\"true\"]},{\"action\":\"response::say\",\"args\":[\"Hi Alex! It's great to hear that you're interested in Move smart contracts and blockchain development. I'd be happy to help you learn with practical examples and projects. Do you have any specific project or topic in mind to start with?\"]}]}");
        
        let action_response = action_dispatcher::parse_response(ai_response);
        let response_action = vector::borrow(action_dispatcher::get_actions(&action_response), 1);
        let response_message = vector::borrow(action_dispatcher::get_action_args(response_action), 0);
        action_dispatcher::dispatch_actions(agent, ai_response);

        let ai_message = TestMessage{
            content: *response_message,
            sender: agent::get_agent_address(agent),
            timestamp: 1234567891,
        };

        // Second interaction: User responds about specific topic
        let test_message_2 = TestMessage {
            content: string::utf8(b"I'd like to start by learning how to create and manage digital assets using Move. Can you show me a simple example?"),
            sender: test_user,
            timestamp: 1234567892,
        };

        let history = vector[test_message, ai_message];

        let message_input_2 = MessageInput{
            history,
            current: test_message_2,
        };

        let agent_input_2 = agent::create_agent_input(
            test_user,
            string::utf8(MESSAGE_INPUT_DESCRIPTION),
            message_input_2
        );

        // Get second prompt
        let prompt_2 = agent::generate_system_prompt(object::borrow(agent), &agent_input_2);

        // Print second prompt
        debug::print(&string::utf8(b"Second Prompt:"));
        debug::print(string::bytes(&prompt_2));

        // Clean up
        agent::destroy_agent_cap(cap);
    }
}