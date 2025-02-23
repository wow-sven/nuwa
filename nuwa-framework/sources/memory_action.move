module nuwa_framework::memory_action {
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use moveos_std::object::Object;
    use nuwa_framework::agent::{Self, Agent};
    use nuwa_framework::memory;
    use nuwa_framework::action;
    use nuwa_framework::address_utils;

    /// Memory action names using namespaced format
    const ACTION_NAME_ADD: vector<u8> = b"memory::add";
    const ACTION_NAME_UPDATE: vector<u8> = b"memory::update";
    const ACTION_NAME_DELETE: vector<u8> = b"memory::delete";

    /// Common property names
    const PROPERTY_PERSONALITY: vector<u8> = b"personality";
    const PROPERTY_INTEREST: vector<u8> = b"interest";
    const PROPERTY_COMMUNICATION_STYLE: vector<u8> = b"communication_style";
    const PROPERTY_TRUST_LEVEL: vector<u8> = b"trust_level";
    const PROPERTY_EXPERTISE: vector<u8> = b"expertise";

    /// Memory contexts
    const CONTEXT_PERSONAL: vector<u8> = b"personal";        // Personal information and preferences
    const CONTEXT_INTERACTION: vector<u8> = b"interaction";  // Direct interactions
    const CONTEXT_KNOWLEDGE: vector<u8> = b"knowledge";      // Knowledge or skills learned about user
    const CONTEXT_EMOTIONAL: vector<u8> = b"emotional";      // Emotional states or reactions
    const CONTEXT_GOAL: vector<u8> = b"goal";               // User goals or objectives
    const CONTEXT_PREFERENCE: vector<u8> = b"preference";    // User preferences
    const CONTEXT_FEEDBACK: vector<u8> = b"feedback";        // User feedback or ratings

    /// Public getters for contexts
    public fun context_personal(): String { string::utf8(CONTEXT_PERSONAL) }
    public fun context_interaction(): String { string::utf8(CONTEXT_INTERACTION) }
    public fun context_knowledge(): String { string::utf8(CONTEXT_KNOWLEDGE) }
    public fun context_emotional(): String { string::utf8(CONTEXT_EMOTIONAL) }
    public fun context_goal(): String { string::utf8(CONTEXT_GOAL) }
    public fun context_preference(): String { string::utf8(CONTEXT_PREFERENCE) }
    public fun context_feedback(): String { string::utf8(CONTEXT_FEEDBACK) }

    /// Validate if a context is valid
    public fun is_valid_context(context: &String): bool {
        let context_bytes = string::bytes(context);
        *context_bytes == CONTEXT_PERSONAL ||
        *context_bytes == CONTEXT_INTERACTION ||
        *context_bytes == CONTEXT_KNOWLEDGE ||
        *context_bytes == CONTEXT_EMOTIONAL ||
        *context_bytes == CONTEXT_GOAL ||
        *context_bytes == CONTEXT_PREFERENCE ||
        *context_bytes == CONTEXT_FEEDBACK
    }

    /// Get context description for AI prompt
    fun get_context_descriptions(): vector<String> {
        vector[
            string::utf8(b"personal - Personal information and identity"),
            string::utf8(b"interaction - Direct interaction history"),
            string::utf8(b"knowledge - User's knowledge and understanding"),
            string::utf8(b"emotional - Emotional states and responses"),
            string::utf8(b"goal - User's goals and objectives"),
            string::utf8(b"preference - User's preferences and choices"),
            string::utf8(b"feedback - User's feedback and ratings")
        ]
    }

    /// Register memory actions to the global registry
    public fun register_actions() {
        let contexts = string::utf8(b"Available contexts:\n");
        let context_list = get_context_descriptions();
        let i = 0;
        while (i < vector::length(&context_list)) {
            string::append(&mut contexts, string::utf8(b"- "));
            string::append(&mut contexts, *vector::borrow(&context_list, i));
            string::append(&mut contexts, string::utf8(b"\n"));
            i = i + 1;
        };

        // Register add_memory action
        let add_memory_args = vector[
            action::new_action_argument(
                string::utf8(b"target"),
                string::utf8(b"address"),
                string::utf8(b"The address to store memory for (user address or self address)"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"The content of the memory"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"context"),
                string::utf8(b"string"),
                contexts,
                true,
            ),
            action::new_action_argument(
                string::utf8(b"is_long_term"),
                string::utf8(b"bool"),
                string::utf8(b"Whether to store as long-term memory"),
                false,
            ),
        ];

        action::register_action(
            string::utf8(ACTION_NAME_ADD),
            string::utf8(b"Store a memory about yourself or a user"),
            add_memory_args,
            string::utf8(b"{\"action\":\"memory::add\",\"args\":[\"0x123\",\"User prefers technical explanations\",\"preference\",true]}"),
            string::utf8(b"Use this action to store memories. Choose the most appropriate context category to help with future retrieval."),
            string::utf8(b"Content should be factual and objective. Context must be one of: personal, interaction, knowledge, emotional, goal, preference, or feedback"),
        );

        // Register update_memory action
        let update_memory_args = vector[
            action::new_action_argument(
                string::utf8(b"target"),
                string::utf8(b"address"),
                string::utf8(b"The address whose memory to update"),
                true,
            ),
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
                string::utf8(b"context"),
                string::utf8(b"string"),
                string::utf8(b"The memory context"),
                true,
            ),
            action::new_action_argument(
                string::utf8(b"is_long_term"),
                string::utf8(b"bool"),
                string::utf8(b"Whether it's a long-term memory"),
                false,
            ),
        ];

        action::register_action(
            string::utf8(ACTION_NAME_UPDATE),
            string::utf8(b"Update an existing memory"),
            update_memory_args,
            string::utf8(b"{\"action\":\"memory::update\",\"args\":[\"old content\",\"new content\",\"context\",true]}"),
            string::utf8(b"Use this action to modify existing memories when user preferences or knowledge needs to be updated"),
            string::utf8(b"Old content must match an existing memory exactly. New content should be factual and objective"),
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

        action::register_action(
            string::utf8(ACTION_NAME_DELETE),
            string::utf8(b"Delete an existing memory"),
            delete_memory_args,
            string::utf8(b"{\"action\":\"memory::delete\",\"args\":[\"content to delete\",\"context\"]}"),
            string::utf8(b"Use this action to remove outdated or incorrect memories. Use with caution"),
            string::utf8(b"Only use for memories that are explicitly contradicted or no longer relevant"),
        );
    }

    /// Execute memory actions
    public fun execute(agent: &mut Object<Agent>, action_name: String, args: vector<String>) {
        let store = agent::borrow_memory_store_mut(agent);

        if (action_name == string::utf8(ACTION_NAME_ADD)) {
            assert!(vector::length(&args) >= 3, 1); // target, content and context are required
            let target = address_utils::parse_address(vector::borrow(&args, 0));
            let content = vector::borrow(&args, 1);
            let context = vector::borrow(&args, 2);
            assert!(is_valid_context(context), 1);
            let is_long_term = if (vector::length(&args) > 3) {
                string::utf8(b"true") == *vector::borrow(&args, 3)
            } else {
                false
            };

            memory::add_memory(
                store,
                target,
                *content,
                *context,
                is_long_term,
            );
        } else if (action_name == string::utf8(ACTION_NAME_UPDATE)) {
            assert!(vector::length(&args) >= 4, 1); // target, old_content, new_content, and context are required
            let target = address_utils::parse_address(vector::borrow(&args, 0));
            let old_content = *vector::borrow(&args, 1);
            let new_content = *vector::borrow(&args, 2);
            let context = *vector::borrow(&args, 3);
            let is_long_term = if (vector::length(&args) > 4) {
                string::utf8(b"true") == *vector::borrow(&args, 4)
            } else {
                false
            };

            update_memory(store, target, old_content, new_content, context, is_long_term);
        } else if (action_name == string::utf8(ACTION_NAME_DELETE)) {
            // TODO: Implement delete functionality
            assert!(vector::length(&args) >= 2, 1);
        };
    }

    /// Helper function to update memory
    fun update_memory(
        store: &mut memory::MemoryStore,
        user: address,
        old_content: String,
        new_content: String,
        context: String,
        is_long_term: bool,
    ) {
        let index_opt = memory::find_memory_index(
            store,
            user,
            &old_content,
            &context,
            is_long_term
        );
        
        if (option::is_some(&index_opt)) {
            let index = option::destroy_some(index_opt);
            memory::update_memory(
                store,
                user,
                index,
                new_content,
                option::some(context),
                is_long_term
            );
        };
    }

    #[test]
    fun test_memory_actions() {
        use nuwa_framework::agent;
        action::init_for_test();
        register_actions();

        let (agent,cap) = agent::create_test_agent();
        
        // Test add memory
        let add_args = vector[
            string::utf8(b"User likes detailed explanations"),
            string::utf8(b"preference"),
            string::utf8(b"true"),
        ];
        execute(agent, string::utf8(ACTION_NAME_ADD), add_args);

        // Test update memory
        let update_args = vector[
            string::utf8(b"User likes detailed explanations"),
            string::utf8(b"User prefers comprehensive explanations"),
            string::utf8(b"preference"),
            string::utf8(b"true"),
        ];
        execute(agent, string::utf8(ACTION_NAME_UPDATE), update_args);
        agent::destroy_agent_cap(cap);
    }
}