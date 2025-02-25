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
    const ERROR_MISSING_ACTION_NAME: u64 = 2;
    const ERROR_MISSING_ARGS: u64 = 3;

    #[data_struct]
    struct ActionCall has copy, drop {
        action: String,
        /// JSON string containing action-specific arguments
        args: String,  
    }

    #[data_struct]
    /// Response structure from AI - contains a vector of action calls
    /// Each action call has:
    /// - "action": specifies the action name, e.g., "memory::add"
    /// - "args": contains a nested JSON string with action-specific parameters
    /// Example:
    /// {
    ///   "actions": [
    ///     {
    ///       "action": "memory::add",
    ///       "args": "{\"target\":\"0x42\",\"content\":\"Some memory\",\"context\":\"conversation\",\"is_long_term\":true}"
    ///     },
    ///     {
    ///       "action": "response::say",
    ///       "args": "{\"channel_id\":\"0x123\",\"content\":\"Hello user\"}"
    ///     }
    ///   ]
    /// }
    struct ActionResponse has copy, drop {
        actions: vector<ActionCall>
    }

    /// Main entry point to dispatch actions from AI response
    public fun dispatch_actions(agent: &mut Object<Agent>, response_json: String) {
        let response = parse_response(response_json);
        
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

    /// Execute a single action call
    fun execute_action(agent: &mut Object<Agent>, action_call: &ActionCall) {
        let action_name = &action_call.action;
        let args = &action_call.args;

        if (string_utils::starts_with(action_name, &b"memory::")) {
            memory_action::execute(agent, *action_name, *args);
        } else if (string_utils::starts_with(action_name, &b"response::")) {
            response_action::execute(agent, *action_name, *args);
        };
        // Add other action types here
    }

    /// Parse JSON response into ActionResponse
    public fun parse_response(json_str: String): ActionResponse {
        json::from_json<ActionResponse>(string::into_bytes(json_str))
    }
    
    /// Get actions from ActionResponse
    public fun get_actions(response: &ActionResponse): &vector<ActionCall> {
        &response.actions
    }

    /// Get action name from ActionCall
    public fun get_action_name(action_call: &ActionCall): &String {
        &action_call.action
    }

    /// Get action arguments from ActionCall
    public fun get_action_args(action_call: &ActionCall): &String {
        &action_call.args
    }

    /// Create an action call with a raw string args
    public fun create_action_call(action: String, args_json: String): ActionCall {
        ActionCall { action, args: args_json }
    }

    /// Create an action call with any serializable args type
    /// This provides a type-safe way to create action calls
    public fun create_action_call_with_object<T: copy + drop>(action: String, args: T): ActionCall {
        let args_json = string::utf8(json::to_json(&args));
        ActionCall { action, args: args_json }
    }

    /// Build a response from a vector of action calls
    /// Useful for creating structured responses programmatically
    public fun create_response(actions: vector<ActionCall>): String {
        let response_obj = ActionResponse { actions };
        string::utf8(json::to_json(&response_obj))
    }

    /// Create a new empty ActionResponse
    public fun create_empty_response(): ActionResponse {
        ActionResponse { actions: vector::empty() }
    }

    /// Add an action to an ActionResponse
    public fun add_action(response: &mut ActionResponse, action_call: ActionCall) {
        vector::push_back(&mut response.actions, action_call);
    }

    /// Convert ActionResponse to JSON string
    public fun response_to_json(response: &ActionResponse): String {
        string::utf8(json::to_json(response))
    }

    #[test]
    fun test_dispatch_actions() {
        use nuwa_framework::agent;
        use nuwa_framework::action;
        use nuwa_framework::memory;
        use nuwa_framework::memory_action;
        use nuwa_framework::response_action;
        use nuwa_framework::channel;

        // Initialize
        action::init_for_test();
        memory_action::register_actions();
        response_action::register_actions();

        let (agent, cap) = agent::create_test_agent();
        let test_addr = @0x42;

        let channel_id = channel::create_ai_home_channel(agent);
        // Using type-specific constructors with serialization
        let memory_args = memory_action::create_add_memory_args(
            test_addr,
            string::utf8(b"User prefers detailed explanations"),
            memory_action::context_preference(),
            true
        );
        
        let response_args = response_action::create_say_args(
            channel_id,
            string::utf8(b"I understand you prefer detailed explanations.")
        );

        let memory_action = create_action_call_with_object(
            string::utf8(b"memory::add"), 
            memory_args
        );
        
        let response_action = create_action_call_with_object(
            string::utf8(b"response::say"), 
            response_args
        );

        // Alternative fluent API style
        let mut_response = create_empty_response();
        add_action(&mut mut_response, memory_action);
        add_action(&mut mut_response, response_action);
        let test_response = response_to_json(&mut_response);

        // Execute actions
        dispatch_actions(agent, test_response);

        // Verify memory was added
        let store = agent::borrow_memory_store(agent);
        let memories = memory::get_context_memories(store, test_addr);
        assert!(vector::length(&memories) == 1, 1);
        let memory = vector::borrow(&memories, 0);
        assert!(memory::get_content(memory) == string::utf8(b"User prefers detailed explanations"), 2);
        assert!(memory::get_context(memory) == string::utf8(b"preference"), 3);

        agent::destroy_agent_cap(cap);
    }

    #[test_only]
    #[data_struct]
    struct TestArgs has copy, drop {
        value: u64
    }

    #[test]
    fun test_response_builder() {
        // Test the fluent API for building responses
        let mut_response = create_empty_response();
        
        // Add a simple action with raw JSON
        add_action(&mut mut_response, create_action_call(
            string::utf8(b"response::say"),
            string::utf8(b"{\"content\":\"Hello world!\"}")
        ));
        
        add_action(&mut mut_response, create_action_call_with_object(
            string::utf8(b"test::action"),
            TestArgs { value: 42 }
        ));
        
        // Convert to JSON
        let json = response_to_json(&mut_response);
        
        // Parse back and verify
        let parsed = parse_response(json);
        let actions = get_actions(&parsed);
        assert!(vector::length(actions) == 2, 1);
        

        assert!(vector::borrow(actions, 0).action == string::utf8(b"response::say"), 2);
        assert!(vector::borrow(actions, 1).action == string::utf8(b"test::action"), 3);
    }
}