module nuwa_framework::response_action {
    use std::string::{Self, String};
    use moveos_std::object::{Self, Object, ObjectID};
    use moveos_std::json;
    use nuwa_framework::agent::{Self, Agent};
    use nuwa_framework::action;
    use nuwa_framework::channel;

    const ACTION_NAME_SAY: vector<u8> = b"response::say";
    // Action example
    const SAY_ACTION_EXAMPLE: vector<u8> = b"{\"channel_id\":\"0x123\",\"content\":\"I understand you prefer detailed explanations.\"}";

    #[data_struct]
    /// Arguments for the say action
    struct SayActionArgs has copy, drop {
        channel_id: ObjectID,
        content: String,     // Response content
    }

    /// Create arguments for say action
    public fun create_say_args(
        channel_id: ObjectID,
        content: String
    ): SayActionArgs {
        SayActionArgs {
            channel_id,
            content
        }
    }

    public fun register_actions() {
        // Register say action with channel_id parameter
        let say_args = vector[
            action::new_action_argument(
                string::utf8(b"channel_id"),
                string::utf8(b"ObjectID"),
                string::utf8(b"The channel to send response to"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"The response content to send to user"),
                true,
            ),
        ];

        action::register_action(
            string::utf8(ACTION_NAME_SAY),
            string::utf8(b"Send a response to the user"),
            say_args,
            string::utf8(SAY_ACTION_EXAMPLE),
            string::utf8(b"Use this action to send your final response to the specified channel"),
            string::utf8(b"Must be used exactly once in each response"),
        );
    }

    public fun execute(agent: &mut Object<Agent>, action_name: String, args_json: String) {
        if (action_name == string::utf8(ACTION_NAME_SAY)) {
            let args = json::from_json<SayActionArgs>(string::into_bytes(args_json));
            send_response(agent, args.channel_id, args.content);
        };
    }

    fun send_response(agent: &mut Object<Agent>, channel_id: ObjectID, content: String) {
        let channel = object::borrow_mut_object_shared<channel::Channel>(channel_id);
        let agent_addr = agent::get_agent_address(agent);
        channel::add_ai_response(channel, content, agent_addr);
    }

    #[test]
    fun test_response_action_examples() {
        // Test say action example
        let say_args = json::from_json<SayActionArgs>(SAY_ACTION_EXAMPLE);
        assert!(say_args.content == string::utf8(b"I understand you prefer detailed explanations."), 2);
    }
}