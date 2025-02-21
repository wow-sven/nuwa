module nuwa_framework::action {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::table::{Self, Table};
    use moveos_std::object::{Self, Object};
    use moveos_std::type_info::{Self, TypeInfo};
    use moveos_std::hex;
    use std::bcs;

    /// Action description for AI
    struct ActionDescription has copy, drop, store {
        type_info: TypeInfo,     // Use TypeInfo to identify action type
        name: String,
        description: String,
        args: vector<ActionArgument>,
        example: String,
    }

    struct ActionArgument has copy, drop, store {
        name: String,
        type_desc: String,
        description: String,
        required: bool,
    }

    struct ActionRegistry has key {
        // Store action descriptions by type_info and name
        descriptions: Table<String, ActionDescription>,
    }

    const ERROR_ACTION_ALREADY_REGISTERED: u64 = 1;
    const ERROR_ACTION_NOT_FOUND: u64 = 2;

    fun init(){
        let registry = ActionRegistry {
            descriptions: table::new(),
        };
        let registry_obj = object::new_named_object(registry);
        object::to_shared(registry_obj);
    }

    fun borrow_mut_registry(): &mut ActionRegistry{
        let registry_obj_id = object::named_object_id<ActionRegistry>();
        let registry_obj = object::borrow_mut_object_extend<ActionRegistry>(registry_obj_id);
        object::borrow_mut(registry_obj)
    }

    /// Register a new action with its description
    public fun register_action<T>(
        name: String,
        description: String,
        args: vector<ActionArgument>,
        example: String,
    ) {
        let registry = borrow_mut_registry();
        let type_info = type_info::type_of<T>();
        let action_key = get_action_key(&type_info, &name);
        assert!(!table::contains(&registry.descriptions, action_key), ERROR_ACTION_ALREADY_REGISTERED);

        let action_desc = ActionDescription {
            type_info,
            name,
            description,
            args,
            example,
        };
        table::add(&mut registry.descriptions, action_key, action_desc);
    }

    /// Create a new action argument
    public fun new_action_argument(
        name: String,
        type_desc: String,
        description: String,
        required: bool,
    ): ActionArgument {
        ActionArgument {
            name,
            type_desc,
            description,
            required,
        }
    }

    /// Get action descriptions for the specified keys
    public fun get_action_descriptions(keys: &vector<String>): vector<ActionDescription> {
        let registry = borrow_mut_registry();
        let descriptions = vector::empty();
        let i = 0;
        let len = vector::length(keys);
        
        while (i < len) {
            let key = vector::borrow(keys, i);
            if (table::contains(&registry.descriptions, *key)) {
                let desc = table::borrow(&registry.descriptions, *key);
                vector::push_back(&mut descriptions, *desc);
            };
            i = i + 1;
        };
        
        descriptions
    }

    /// Get description for specific action
    public fun get_action_description<T: key>(name: &String): ActionDescription {
        let registry = borrow_mut_registry();
        let type_info = type_info::type_of<T>();
        let action_key = get_action_key(&type_info, name);
        assert!(table::contains(&registry.descriptions, action_key), ERROR_ACTION_NOT_FOUND);
        *table::borrow(&registry.descriptions, action_key)
    }

    /// Get action key by combining type_info components and function name
    fun get_action_key(type_info: &TypeInfo, function_name: &String): String {
        // Format: account_address::module_name::function_name
        let key = address_to_hex(type_info::account_address(type_info));
        string::append(&mut key, string::utf8(b"::"));
        string::append(&mut key, type_info::module_name(type_info));
        string::append(&mut key, string::utf8(b"::"));
        string::append(&mut key, *function_name);
        key
    }

    /// Convert address to hex string with 0x prefix
    fun address_to_hex(addr: address): String {
        let addr_bytes = bcs::to_bytes(&addr);
        let hex_bytes = hex::encode(addr_bytes);
        let hex_str = string::utf8(b"0x");
        string::append(&mut hex_str, string::utf8(hex_bytes));
        hex_str
    }

    #[test]
    fun test_register_memory_action() {
        use nuwa_framework::memory;
        
        // Register a memory action
        let args = vector[
            new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"Memory content"),
                true,
            )
        ];

        register_action<memory::Memory>(
            string::utf8(b"add_memory"),
            string::utf8(b"Add a new memory"),
            args,
            string::utf8(b"{\"action\":\"add_memory\",\"args\":[\"test memory\"]}"),
        );
    }

    #[test]
    fun test_action_key() {
        use nuwa_framework::memory::Memory;
        let type_info = type_info::type_of<Memory>();
        let function_name = string::utf8(b"add_memory");
        
        let key = get_action_key(&type_info, &function_name);
        // Format: account_address::module_name::function_name
        assert!(
            key == string::utf8(b"0x0000000000000000000000000000000000000002::memory::add_memory"), 
            1
        );
    }

    #[test]
    fun test_address_to_hex() {
        let addr = @0x42;
        let hex_str = address_to_hex(addr);
        assert!(hex_str == string::utf8(b"0x0000000000000000000000000000000000000042"), 1);
    }

    #[test]
    fun test_get_action_descriptions() {
        use nuwa_framework::memory;
        
        // Register a test action
        let args = vector[
            new_action_argument(
                string::utf8(b"content"),
                string::utf8(b"string"),
                string::utf8(b"Memory content"),
                true,
            )
        ];

        register_action<memory::Memory>(
            string::utf8(b"add_memory"),
            string::utf8(b"Add a new memory"),
            args,
            string::utf8(b"{\"action\":\"add_memory\",\"args\":[\"test memory\"]}"),
        );

        // Get the action key
        let type_info = type_info::type_of<memory::Memory>();
        let action_key = get_action_key(&type_info, &string::utf8(b"add_memory"));
        
        // Get descriptions using the key
        let keys = vector::singleton(action_key);
        let descriptions = get_action_descriptions(&keys);
        
        assert!(vector::length(&descriptions) == 1, 1);
        let desc = vector::borrow(&descriptions, 0);
        assert!(desc.name == string::utf8(b"add_memory"), 2);
    }
}
