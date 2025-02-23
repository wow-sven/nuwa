module nuwa_framework::memory_action {
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use moveos_std::address;
    use moveos_std::object::Object;
    use nuwa_framework::agent::{Self, Agent};
    use nuwa_framework::memory;
    use nuwa_framework::action;

    /// Memory action names using namespaced format
    const ACTION_NAME_ADD: vector<u8> = b"memory::add";
    const ACTION_NAME_UPDATE: vector<u8> = b"memory::update";
    const ACTION_NAME_DELETE: vector<u8> = b"memory::delete";


    /// Memory operation types
    const ACTION_ADD_MEMORY: u8 = 0;
    const ACTION_UPDATE_MEMORY: u8 = 1;
    const ACTION_DELETE_MEMORY: u8 = 2;

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

        action::register_action(
            string::utf8(ACTION_NAME_ADD),
            string::utf8(b"Store a memory about yourself or a user"),
            add_memory_args,
            string::utf8(b"{\"action\":\"memory::add\",\"args\":[\"0x123\",\"User prefers technical explanations\",\"preference\",true]}"),
            string::utf8(b"Use this action to store memories. Use your own address for self-memories, user's address for user-related memories"),
            string::utf8(b"Content should be factual and objective. Context must be one of the predefined categories"),
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
        //let agent_address = agent::get_agent_address(agent);
        let store = agent::borrow_memory_store_mut(agent);

        if (action_name == string::utf8(ACTION_NAME_ADD)) {
            assert!(vector::length(&args) >= 3, 1); // target, content and context are required
            //TODO check the target_opt
            let target = parse_address(vector::borrow(&args, 0));
            let content = vector::borrow(&args, 1);
            let context = vector::borrow(&args, 2);
            let is_long_term = if (vector::length(&args) > 3) {
                string::utf8(b"true") == *vector::borrow(&args, 3)
            } else {
                false
            };

            memory::add_memory(
                store,
                target,
                *content,
                memory::memory_type_knowledge(),
                *context,
                is_long_term,
            );
        } else if (action_name == string::utf8(ACTION_NAME_UPDATE)) {
            assert!(vector::length(&args) >= 4, 1); // target, old_content, new_content, and context are required
            let target = parse_address(vector::borrow(&args, 0));
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

    //TODO Migrate this function to address.move module
    /// Convert string address to Move address, handling both short and full-length addresses
    fun parse_address(arg: &String): address {
        let bytes = *string::bytes(arg);
        let result = vector::empty();
        
        // Remove "0x" prefix if present
        if (vector::length(&bytes) >= 2 && 
            *vector::borrow(&bytes, 0) == 0x30 && 
            *vector::borrow(&bytes, 1) == 0x78) {
            let i = 2;
            while (i < vector::length(&bytes)) {
                vector::push_back(&mut result, *vector::borrow(&bytes, i));
                i = i + 1;
            };
        } else {
            result = bytes;
        };

        // Left pad with zeros to make it 64 characters long
        let padded = vector::empty();
        let needed_zeros = 64 - vector::length(&result);
        while (needed_zeros > 0) {
            vector::push_back(&mut padded, 0x30); // '0' in ASCII
            needed_zeros = needed_zeros - 1;
        };
        vector::append(&mut padded, result);
        
        address::from_ascii_bytes(&padded)
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

    #[test]
    fun test_parse_address() {
        // Test short address
        let address_str = string::utf8(b"0x42");
        let address = parse_address(&address_str);
        assert!(address == @0x42, 1);

        // Test short address without prefix
        let address_str = string::utf8(b"42");
        let address = parse_address(&address_str);
        assert!(address == @0x42, 2);

        // Test full length address
        let address_str = string::utf8(b"0x0000000000000000000000000000000000000000000000000000000000000042");
        let address = parse_address(&address_str);
        assert!(address == @0x42, 3);
    }
}