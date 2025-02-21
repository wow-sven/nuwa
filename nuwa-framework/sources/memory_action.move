module nuwa_framework::memory_action {
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use moveos_std::object::Object;
    use nuwa_framework::agent::{Self, Agent};
    use nuwa_framework::memory;
    use nuwa_framework::action;


    // Define action struct with all required fields
    struct MemoryAction has copy, drop, store {
        operation: u8,
        user: address,
        content: String,
        context: String,
        is_long_term: bool,
    }

    /// Memory operation types
    const ACTION_ADD_MEMORY: u8 = 0;
    const ACTION_UPDATE_MEMORY: u8 = 1;
    const ACTION_DELETE_MEMORY: u8 = 2;

    // Create new memory action
    public fun new_memory_action(
        operation: u8,
        user: address,
        content: String,
        context: String,
        is_long_term: bool,
    ): MemoryAction {
        MemoryAction {
            operation,
            user,
            content,
            context,
            is_long_term,
        }
    }

    /// Common property names
    const PROPERTY_PERSONALITY: vector<u8> = b"personality";
    const PROPERTY_INTEREST: vector<u8> = b"interest";
    const PROPERTY_COMMUNICATION_STYLE: vector<u8> = b"communication_style";
    const PROPERTY_TRUST_LEVEL: vector<u8> = b"trust_level";
    const PROPERTY_EXPERTISE: vector<u8> = b"expertise";

    /// Register memory actions to the global registry
    public fun register_actions() {
        // Register add_memory action
        let add_memory_args = vector[
            action::new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"The content of the memory"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"context"),
                string::utf8(b"string"),
                string::utf8(b"The context category of the memory"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"is_long_term"),
                string::utf8(b"bool"),
                string::utf8(b"Whether to store as long-term memory"),
                false,
            ),
        ];

        action::register_action<MemoryAction>(
            string::utf8(b"add_memory"),
            string::utf8(b"Store a new memory about the user or interaction"),
            add_memory_args,
            string::utf8(b"{\"action\":\"add_memory\",\"args\":[\"User prefers technical explanations\",\"preference\",true]}"),
        );

        // Register update_memory action
        let update_memory_args = vector[
            action::new_action_argument(
                string::utf8(b"old_content"),
                string::utf8(b"string"),
                string::utf8(b"The content to update"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"new_content"),
                string::utf8(b"string"),
                string::utf8(b"The new content"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"new_context"),
                string::utf8(b"string"),
                string::utf8(b"The new context (optional)"),
                false,
            ),
        ];

        action::register_action<MemoryAction>(
            string::utf8(b"update_memory"),
            string::utf8(b"Update an existing memory"),
            update_memory_args,
            string::utf8(b"{\"action\":\"update_memory\",\"args\":[\"old content\",\"new content\",\"new context\"]}"),
        );

        // Register delete_memory action
        let delete_memory_args = vector[
            action::new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"The content of the memory to delete"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"context"),
                string::utf8(b"string"),
                string::utf8(b"The context of the memory"),
                true,
            ),
        ];

        action::register_action<MemoryAction>(
            string::utf8(b"delete_memory"),
            string::utf8(b"Delete an existing memory"),
            delete_memory_args,
            string::utf8(b"{\"action\":\"delete_memory\",\"args\":[\"content to delete\",\"context\"]}"),
        );
    }

    /// Execute memory action
    public fun execute(_agent: &mut Object<Agent>, action_name: String, args: vector<String>) {
        if (action_name == string::utf8(b"add_memory")) {
            assert!(vector::length(&args) >= 2, 1); // content and context are required
            let _is_long_term = if (vector::length(&args) > 2) {
                string::utf8(b"true") == *vector::borrow(&args, 2)
            } else {
                false
            };

            // memory::add_memory(
            //     &mut agent.memory_store,
            //     *vector::borrow(&args, 0), // content
            //     memory::MEMORY_TYPE_KNOWLEDGE,
            //     *vector::borrow(&args, 1), // context
            //     is_long_term,
            // );
        } else if (action_name == string::utf8(b"update_memory")) {
            // ... handle update
        } else if (action_name == string::utf8(b"delete_memory")) {
            // ... handle delete
        };
    }

    // public fun execute_property_action(
    //     agent: &mut Object<Agent>, 
    //     action: UpdatePropertyAction
    // ) {
    //     let store = agent::borrow_memory_store_mut(agent);
    //     memory::set_meta_property(
    //         store,
    //         action.user,
    //         action.property_name,
    //         action.property_value,
    //     );
    // }

    public(friend) fun execute_memory_action(
        store: &mut memory::MemoryStore,
        action: MemoryAction
    ) {
        if (action.operation == ACTION_ADD_MEMORY) {
            memory::add_memory(
                store,
                action.user,
                action.content,
                memory::memory_type_knowledge(), // Using getter instead of constant
                action.context,
                action.is_long_term,
            );
        } else if (action.operation == ACTION_UPDATE_MEMORY) {
            // Handle update using memory module functions
            let index_opt = memory::find_memory_index(
                store,
                action.user,
                &action.content,
                &action.context,
                action.is_long_term
            );
            
            if (option::is_some(&index_opt)) {
                let index = option::destroy_some(index_opt);
                memory::update_memory(
                    store,
                    action.user,
                    index,
                    action.content,
                    option::some(action.context),
                    action.is_long_term
                );
            };
        };
    }

    public fun update_memory_action(
        agent: &mut Object<Agent>,
        user: address,
        old_content: String,
        old_context: String,
        new_content: String,
        new_context: Option<String>,
        is_long_term: bool,
    ) {
        let store = agent::borrow_memory_store_mut(agent);
        let index_opt = memory::find_memory_index(
            store,
            user,
            &old_content,
            &old_context,
            is_long_term
        );
        
        if (option::is_some(&index_opt)) {
            let index = option::destroy_some(index_opt);
            memory::update_memory(
                store,
                user,
                index,
                new_content,
                new_context,
                is_long_term
            );
        };
    }

}