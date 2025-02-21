module nuwa_framework::memory {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector;
    use moveos_std::table::{Self, Table};
    use moveos_std::table_vec::{Self, TableVec};
    use moveos_std::timestamp;
    use moveos_std::string_utils;

    friend nuwa_framework::agent;

    /// Memory types (internal constants)
    const MEMORY_TYPE_INTERACTION: u8 = 0;
    const MEMORY_TYPE_KNOWLEDGE: u8 = 1;
    const MEMORY_TYPE_CORE: u8 = 2;

    /// Public getters for memory types
    public fun memory_type_interaction(): u8 { MEMORY_TYPE_INTERACTION }
    public fun memory_type_knowledge(): u8 { MEMORY_TYPE_KNOWLEDGE }
    public fun memory_type_core(): u8 { MEMORY_TYPE_CORE }

    /// Common property keys
    const PROPERTY_LANGUAGE: vector<u8> = b"language";
    const PROPERTY_INTERACTION_COUNT: vector<u8> = b"interaction_count";
    const PROPERTY_TRUST_LEVEL: vector<u8> = b"trust_level";
    const PROPERTY_LAST_SENTIMENT: vector<u8> = b"last_sentiment";
    const PROPERTY_PERSONALITY: vector<u8> = b"personality";
    const PROPERTY_PREFERENCE: vector<u8> = b"preference";

    /// Public getters for property keys
    public fun property_language(): String { string::utf8(PROPERTY_LANGUAGE) }
    public fun property_interaction_count(): String { string::utf8(PROPERTY_INTERACTION_COUNT) }
    public fun property_trust_level(): String { string::utf8(PROPERTY_TRUST_LEVEL) }
    public fun property_last_sentiment(): String { string::utf8(PROPERTY_LAST_SENTIMENT) }
    public fun property_personality(): String { string::utf8(PROPERTY_PERSONALITY) }
    public fun property_preference(): String { string::utf8(PROPERTY_PREFERENCE) }

    /// Context types (internal constants)
    const CONTEXT_PERSONAL: vector<u8> = b"personal";        // Personal information and preferences
    const CONTEXT_INTERACTION: vector<u8> = b"interaction";  // Direct interactions
    const CONTEXT_KNOWLEDGE: vector<u8> = b"knowledge";      // Knowledge or skills learned about user
    const CONTEXT_EMOTIONAL: vector<u8> = b"emotional";      // Emotional states or reactions
    const CONTEXT_GOAL: vector<u8> = b"goal";               // User goals or objectives
    const CONTEXT_PREFERENCE: vector<u8> = b"preference";    // User preferences
    const CONTEXT_FEEDBACK: vector<u8> = b"feedback";        // User feedback or ratings

    /// Public getters for context types that return String
    public fun context_personal(): String { string::utf8(CONTEXT_PERSONAL) }
    public fun context_interaction(): String { string::utf8(CONTEXT_INTERACTION) }
    public fun context_knowledge(): String { string::utf8(CONTEXT_KNOWLEDGE) }
    public fun context_emotional(): String { string::utf8(CONTEXT_EMOTIONAL) }
    public fun context_goal(): String { string::utf8(CONTEXT_GOAL) }
    public fun context_preference(): String { string::utf8(CONTEXT_PREFERENCE) }
    public fun context_feedback(): String { string::utf8(CONTEXT_FEEDBACK) }

    const ErrorMemoryNotFound: u64 = 1;

    /// Constants for memory retrieval
    const MAX_RECENT_MEMORIES: u64 = 5;
    const MAX_RELEVANT_MEMORIES: u64 = 10;

    /// Single memory entry
    struct Memory has copy, store, drop {
        content: String,
        memory_type: u8,
        context: String,
        timestamp: u64,
    }

    /// Meta memory for each user or agent itself
    struct MetaMemory has store {
        // Recent interactions or thoughts
        short_term: TableVec<Memory>,
        // Important memories that should be preserved
        long_term: TableVec<Memory>,
        // Last interaction timestamp
        last_interaction: u64,
        // User defined properties
        properties: Table<String, String>,
    }

    /// MemoryStore manages all memories for an agent
    struct MemoryStore has store {
        // Meta memories by user address (including agent's own memory)
        memories: Table<address, MetaMemory>,
    }

    public(friend) fun new_memory_store(): MemoryStore {
        let store = MemoryStore {
            memories: table::new(),
        };
        store
    }

    fun new_meta_memory(): MetaMemory {
        MetaMemory {
            short_term: table_vec::new(),
            long_term: table_vec::new(),
            last_interaction: timestamp::now_milliseconds(),
            properties: table::new(),
        }
    }

    /// Add a new memory for a specific user or agent itself
    public fun add_memory(
        store: &mut MemoryStore,
        user: address,
        content: String,
        memory_type: u8,
        context: String,
        is_long_term: bool,
    ) {
        if (!table::contains(&store.memories, user)) {
            table::add(&mut store.memories, user, new_meta_memory());
        };

        let meta_memory = table::borrow_mut(&mut store.memories, user);
        let memory = Memory {
            content,
            memory_type,
            context,
            timestamp: timestamp::now_milliseconds(),
        };

        if (is_long_term) {
            table_vec::push_back(&mut meta_memory.long_term, memory);
        } else {
            table_vec::push_back(&mut meta_memory.short_term, memory);
            // Keep short term memory size under control
            if (table_vec::length(&meta_memory.short_term) > 10) {
                table_vec::pop_back(&mut meta_memory.short_term);
            };
        };
        meta_memory.last_interaction = timestamp::now_milliseconds();
    }

    /// Get all memories for a specific context
    public fun get_memories_by_context(
        store: &MemoryStore,
        user: address,
        context: String,
        include_short_term: bool,
    ): vector<Memory> {
        let results = vector::empty<Memory>();
        if (!table::contains(&store.memories, user)) {
            return results
        };

        let meta_memory = table::borrow(&store.memories, user);
        
        // Add long term memories
        let i = 0;
        let len = table_vec::length(&meta_memory.long_term);
        while (i < len) {
            let memory = table_vec::borrow(&meta_memory.long_term, i);
            if (memory.context == context) {
                vector::push_back(&mut results, *memory);
            };
            i = i + 1;
        };

        // Add short term memories if requested
        if (include_short_term) {
            let i = 0;
            let len = table_vec::length(&meta_memory.short_term);
            while (i < len) {
                let memory = table_vec::borrow(&meta_memory.short_term, i);
                if (memory.context == context) {
                    vector::push_back(&mut results, *memory);
                };
                i = i + 1;
            };
        };

        results
    }

    /// Get all memories for a user (both short-term and long-term)
    public fun get_all_memories(
        store: &MemoryStore,
        user: address,
        include_short_term: bool,
    ): vector<Memory> {
        let results = vector::empty<Memory>();
        if (!table::contains(&store.memories, user)) {
            return results
        };

        let meta_memory = table::borrow(&store.memories, user);
        
        // Add all long term memories
        let i = 0;
        let len = table_vec::length(&meta_memory.long_term);
        while (i < len) {
            vector::push_back(&mut results, *table_vec::borrow(&meta_memory.long_term, i));
            i = i + 1;
        };

        // Add all short term memories if requested
        if (include_short_term) {
            let i = 0;
            let len = table_vec::length(&meta_memory.short_term);
            while (i < len) {
                vector::push_back(&mut results, *table_vec::borrow(&meta_memory.short_term, i));
                i = i + 1;
            };
        };

        results
    }

    /// Get memories by multiple contexts
    public fun get_memories_by_contexts(
        store: &MemoryStore,
        user: address,
        contexts: vector<String>,
        include_short_term: bool,
    ): vector<Memory> {
        let results = vector::empty<Memory>();
        let i = 0;
        let len = vector::length(&contexts);
        while (i < len) {
            let context_memories = get_memories_by_context(store, user, *vector::borrow(&contexts, i), include_short_term);
            vector::append(&mut results, context_memories);
            i = i + 1;
        };
        results
    }

    /// Validate if a context is standard
    public fun is_standard_context(context: &String): bool {
        let context_bytes = *string::bytes(context);
        context_bytes == CONTEXT_PERSONAL ||
        context_bytes == CONTEXT_INTERACTION ||
        context_bytes == CONTEXT_KNOWLEDGE ||
        context_bytes == CONTEXT_EMOTIONAL ||
        context_bytes == CONTEXT_GOAL ||
        context_bytes == CONTEXT_PREFERENCE ||
        context_bytes == CONTEXT_FEEDBACK
    }

    /// Set a property for a user's meta memory
    public fun set_meta_property(
        store: &mut MemoryStore,
        user: address,
        key: String,
        value: String,
    ) {
        if (!table::contains(&store.memories, user)) {
            table::add(&mut store.memories, user, new_meta_memory());
        };
        
        let meta_memory = table::borrow_mut(&mut store.memories, user);
        if (table::contains(&meta_memory.properties, key)) {
            *table::borrow_mut(&mut meta_memory.properties, key) = value;
        } else {
            table::add(&mut meta_memory.properties, key, value);
        };
    }

    /// Get a property value for a user's meta memory
    public fun get_property(
        store: &MemoryStore,
        user: address,
        key: &String,
    ): Option<String> {
        if (!table::contains(&store.memories, user)) {
            return option::none()
        };
        
        let meta_memory = table::borrow(&store.memories, user);
        if (table::contains(&meta_memory.properties, *key)) {
            option::some(*table::borrow(&meta_memory.properties, *key))
        } else {
            option::none()
        }
    }

    /// Increment a numeric property value
    public(friend) fun increment_property(
        store: &mut MemoryStore,
        user: address,
        key: String,
    ) {
        if (!table::contains(&store.memories, user)) {
            table::add(&mut store.memories, user, new_meta_memory());
        };
        
        let meta_memory = table::borrow_mut(&mut store.memories, user);
        let value = if (table::contains(&meta_memory.properties, key)) {
            let current = table::borrow(&meta_memory.properties, key);
            // Parse current value and increment
            let num = string_utils::parse_u64(current);
            string_utils::to_string_u64(num + 1)
        } else {
            string_utils::to_string_u64(1)
        };
        
        if (table::contains(&meta_memory.properties, key)) {
            *table::borrow_mut(&mut meta_memory.properties, key) = value;
        } else {
            table::add(&mut meta_memory.properties, key, value);
        };
    }

    /// Remove a property
    public fun remove_property(
        store: &mut MemoryStore,
        user: address,
        key: &String,
    ) {
        if (!table::contains(&store.memories, user)) {
            return
        };
        
        let meta_memory = table::borrow_mut(&mut store.memories, user);
        if (table::contains(&meta_memory.properties, *key)) {
            table::remove(&mut meta_memory.properties, *key);
        };
    }

    /// Update an existing memory in either short-term or long-term memory
    public fun update_memory(
        store: &mut MemoryStore,
        user: address,
        index: u64,
        new_content: String,
        new_context: Option<String>,
        is_long_term: bool,
    ) {
        assert!(table::contains(&store.memories, user), ErrorMemoryNotFound);
        let meta_memory = table::borrow_mut(&mut store.memories, user);
        
        let memories = if (is_long_term) {
            &mut meta_memory.long_term
        } else {
            &mut meta_memory.short_term
        };

        assert!(table_vec::length(memories) > index, ErrorMemoryNotFound);
        let memory = table_vec::borrow_mut(memories, index);
        
        // Update content
        memory.content = new_content;
        // Update context if provided
        if (option::is_some(&new_context)) {
            memory.context = option::destroy_some(new_context);
        };
        // Update timestamp
        memory.timestamp = timestamp::now_milliseconds();
        
        // Update last interaction time
        meta_memory.last_interaction = timestamp::now_milliseconds();
    }

    /// Find memory index by content and context
    public fun find_memory_index(
        store: &MemoryStore,
        user: address,
        content: &String,
        context: &String,
        is_long_term: bool,
    ): Option<u64> {
        if (!table::contains(&store.memories, user)) {
            return option::none()
        };
        
        let meta_memory = table::borrow(&store.memories, user);
        let memories = if (is_long_term) {
            &meta_memory.long_term
        } else {
            &meta_memory.short_term
        };

        let i = 0;
        let len = table_vec::length(memories);
        while (i < len) {
            let memory = table_vec::borrow(memories, i);
            if (memory.content == *content && memory.context == *context) {
                return option::some(i)
            };
            i = i + 1;
        };
        option::none()
    }

    /// Get relevant memories for AI context
    public fun get_context_memories(
        store: &MemoryStore,
        user: address,
    ): vector<Memory> {
        let results = vector::empty<Memory>();
        if (!table::contains(&store.memories, user)) {
            return results
        };

        let meta_memory = table::borrow(&store.memories, user);
        
        // 1. Always include recent short-term memories
        let i = 0;
        let len = table_vec::length(&meta_memory.short_term);
        let start = if (len > MAX_RECENT_MEMORIES) { len - MAX_RECENT_MEMORIES } else { 0 };
        while (i < len) {
            if (i >= start) {
                vector::push_back(&mut results, *table_vec::borrow(&meta_memory.short_term, i));
            };
            i = i + 1;
        };

        // 2. Add relevant long-term memories
        // First, get critical properties
        let _personality = get_property(store, user, &string::utf8(PROPERTY_PERSONALITY));
        let _trust_level = get_property(store, user, &string::utf8(PROPERTY_TRUST_LEVEL));
        let _preferences = get_property(store, user, &string::utf8(PROPERTY_PREFERENCE));

        // Then add related long-term memories
        let i = 0;
        let len = table_vec::length(&meta_memory.long_term);
        while (i < len && vector::length(&results) < MAX_RELEVANT_MEMORIES) {
            let memory = table_vec::borrow(&meta_memory.long_term, i);
            // Add memories that match critical contexts
            if (memory.context == string::utf8(CONTEXT_PERSONAL) ||
                memory.context == string::utf8(CONTEXT_PREFERENCE) ||
                memory.context == string::utf8(CONTEXT_EMOTIONAL)) {
                vector::push_back(&mut results, *memory);
            };
            i = i + 1;
        };

        results
    }

    /// Getter functions for Memory fields
    public fun get_content(memory: &Memory): String {
        memory.content
    }

    public fun get_context(memory: &Memory): String {
        memory.context
    }

    public fun get_timestamp(memory: &Memory): u64 {
        memory.timestamp
    }

    /// Struct to hold property key-value pair
    struct PropertyEntry has copy, drop, store {
        key: String,
        value: String,
    }

    /// Get all properties using iteration over table entries
    public fun get_all_properties(store: &MemoryStore, user: address): vector<PropertyEntry> {
        let results = vector::empty();
        if (!table::contains(&store.memories, user)) {
            return results
        };
        
        let meta_memory = table::borrow(&store.memories, user);
        let iterator = table::list_field_keys(&meta_memory.properties, option::none(), 1000);
        let len = table::field_keys_len(&iterator);
        let i = 0;
        while (i < len) {
            let (key, value) = table::next(&mut iterator);
            vector::push_back(&mut results, PropertyEntry { key: *key, value: *value });
            i = i + 1;
        };
        results
    }

    /// Get property key from PropertyEntry
    public fun get_property_key(prop: &PropertyEntry): String {
        prop.key
    }

    /// Get property value from PropertyEntry
    public fun get_property_value(prop: &PropertyEntry): String {
        prop.value
    }

    #[test_only]
    public fun destroy_memory_store_for_test(store: MemoryStore) {
        let MemoryStore { memories } = store;
        table::drop_unchecked(memories);
    }
    
    #[test_only]
    /// Create a new memory store for testing
    public fun new_test_memory_store(): MemoryStore {
        new_memory_store()
    }
}