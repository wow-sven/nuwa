module nuwa_framework::response_action {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::object::Object;
    use nuwa_framework::agent::Agent;
    use nuwa_framework::action;

    const ACTION_NAME_SAY: vector<u8> = b"response::say";

    public fun register_actions() {
        // Register say action
        let say_args = vector[
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
            string::utf8(b"{\"action\":\"response::say\",\"args\":[\"I understand you prefer detailed explanations.\"]}"),
            string::utf8(b"Use this action to send your final response to the user. Should be used after processing other actions."),
            string::utf8(b"Must be used exactly once in each response. Response should match character personality."),
        );
    }

    public fun execute(agent: &mut Object<Agent>, action_name: String, args: vector<String>) {
        assert!(vector::length(&args) >= 1, 1);
        let content = vector::borrow(&args, 0);

        if (action_name == string::utf8(ACTION_NAME_SAY)) {
            // TODO: Add to response history or emit event
            send_response(agent, *content);
        };
    }

    fun send_response(_agent: &mut Object<Agent>, _content: String) {
        // TODO: Implement response handling
    }
}