module nuwa_framework::action_dispatcher {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::json;
    use nuwa_framework::memory_action;
    use nuwa_framework::response_action;
    use nuwa_framework::agent::Agent;
    use nuwa_framework::string_utils;
    use moveos_std::object::Object;

    /// Error codes
    const ERROR_INVALID_RESPONSE: u64 = 1;
    const ERROR_MISSING_REQUIRED_FIELDS: u64 = 2;

    #[data_struct]
    /// Response structure from AI - only contains actions to execute
    struct ActionResponse has copy, drop {
        actions: vector<ActionCall>
    }

    #[data_struct]
    struct ActionCall has copy, drop {
        action: String,
        args: vector<String>
    }

    /// Main entry point to dispatch actions from AI response
    public fun dispatch_actions(agent: &mut Object<Agent>, response_json: String) {
        let response = json::from_json<ActionResponse>(string::into_bytes(response_json));
        
        // Execute each action in sequence
        let actions = response.actions;
        let i = 0;
        let len = vector::length(&actions);
        while (i < len) {
            let action_call = vector::borrow(&actions, i);
            execute_action(agent, action_call);
            i = i + 1;
        };
    }

    /// Execute a single action based on its name
    fun execute_action(agent: &mut Object<Agent>, action_call: &ActionCall) {
        let action_name = &action_call.action;
        
        if (string_utils::starts_with(action_name, &b"memory::")) {
            memory_action::execute(agent, *action_name, action_call.args);
        } else if (string_utils::starts_with(action_name, &b"response::")) {
            response_action::execute(agent, *action_name, action_call.args);
        };
        // Add other action types here
    }

    #[test]
    fun test_dispatch_actions() {
        use nuwa_framework::agent;
        use nuwa_framework::action;

        // Initialize
        action::init_for_test();
        memory_action::register_actions();
        response_action::register_actions();

        let (agent, cap) = agent::create_test_agent();

        // Build test response string
        let test_response = build_test_response(
            vector[
                build_action_call(
                    string::utf8(b"memory::add"),
                    vector[
                        string::utf8(b"User prefers detailed explanations"),
                        string::utf8(b"preference"),
                        string::utf8(b"true")
                    ]
                ),
                build_action_call(
                    string::utf8(b"response::say"),
                    vector[string::utf8(b"I understand you prefer detailed explanations.")]
                )
            ]
        );

        dispatch_actions(agent, test_response);
        agent::destroy_agent_cap(cap);
    }

    #[test_only]
    fun build_test_response(actions: vector<ActionCall>): String {
        let response_obj = ActionResponse {
            actions
        };
        string::utf8(json::to_json(&response_obj))
    }

    #[test_only]
    fun build_action_call(action: String, args: vector<String>): ActionCall {
        ActionCall {
            action,
            args
        }
    }
}