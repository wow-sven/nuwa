module nuwa_framework::channel {
    use std::string::String;
    use std::vector;
    use moveos_std::table::{Self, Table};
    use moveos_std::object::{Self, Object, ObjectID};
    use moveos_std::timestamp;
    use moveos_std::signer;
    use nuwa_framework::message::{Self, Message};

    // Error codes
    const ErrorChannelNotFound: u64 = 1;
    const ErrorChannelAlreadyExists: u64 = 2;
    const ErrorNotAuthorized: u64 = 3;
    const ErrorChannelInactive: u64 = 4;
    const ErrorMaxMembersReached: u64 = 5;
    const ErrorInvalidChannelName: u64 = 6;
    const ErrorInvalidChannelType: u64 = 7;
    const ErrorNotMember: u64 = 8;

    /// Channel status constants
    const CHANNEL_STATUS_ACTIVE: u8 = 0;
    const CHANNEL_STATUS_CLOSED: u8 = 1;
    const CHANNEL_STATUS_BANNED: u8 = 2;

    // Add channel type constants
    const CHANNEL_TYPE_NORMAL: u8 = 0;
    const CHANNEL_TYPE_AI: u8 = 1;

    // Channel type constants with built-in visibility
    const CHANNEL_TYPE_AI_HOME: u8 = 0;   // AI's home channel, always public
    const CHANNEL_TYPE_AI_PEER: u8 = 1;   // 1:1 AI-User channel, always private

    // Public functions to expose constants
    public fun channel_type_normal(): u8 { CHANNEL_TYPE_NORMAL }
    public fun channel_type_ai(): u8 { CHANNEL_TYPE_AI }

    /// Member structure to store member information
    struct Member has store, drop {
        address: address,
        joined_at: u64,    // Now in milliseconds
        last_active: u64,  // Now in milliseconds
    }

    /// Channel structure for chat functionality
    /// Note on privacy:
    /// - All messages in the channel are visible on-chain, regardless of channel privacy settings
    /// - is_public: true  => Anyone can join the channel automatically when sending their first message
    /// - is_public: false => Only admins can add members, and only members can send messages
    struct Channel has key {
        title: String,
        creator: address,        // For AI_HOME: AI agent address, For AI_PEER: user address
        members: Table<address, Member>,  // Changed from vector to Table
        messages: Table<u64, ObjectID>,  // Changed from Table<u64, Message> to Table<u64, ObjectID>
        message_counter: u64,
        created_at: u64,    // Now in milliseconds
        last_active: u64,   // Now in milliseconds
        status: u8,
        channel_type: u8,  // AI_HOME or AI_PEER
    }

    /// Initialize a new AI home channel
    public fun create_ai_home_channel(
        agent_account: &signer,
        title: String,
    ): ObjectID {
        let creator = signer::address_of(agent_account);
        let now = timestamp::now_milliseconds();
        
        let channel = Channel {
            title,
            creator,  // AI agent's address
            members: table::new(),
            messages: table::new(),
            message_counter: 0,
            created_at: now,
            last_active: now,
            status: CHANNEL_STATUS_ACTIVE,
            channel_type: CHANNEL_TYPE_AI_HOME,
        };

        // Add AI as member
        add_member_internal(&mut channel, creator, now);
        
        let channel_obj = object::new(channel);
        let channel_id = object::id(&channel_obj);
        object::to_shared(channel_obj);
        channel_id
    }

    /// Initialize a new AI peer channel
    public fun create_ai_peer_channel(
        user_account: &signer,
        agent_address: address,
        title: String,
    ): ObjectID {
        let creator = signer::address_of(user_account);
        let now = timestamp::now_milliseconds();
        
        let channel = Channel {
            title,
            creator,  // User's address
            members: table::new(),
            messages: table::new(),
            message_counter: 0,
            created_at: now,
            last_active: now,
            status: CHANNEL_STATUS_ACTIVE,
            channel_type: CHANNEL_TYPE_AI_PEER,
        };

        // Add both user and AI as members
        add_member_internal(&mut channel, creator, now);
        add_member_internal(&mut channel, agent_address, now);
        
        let channel_obj = object::new(channel);
        let channel_id = object::id(&channel_obj);
        object::to_shared(channel_obj);
        channel_id
    }

    /// Add message to channel - use message_counter as id
    fun add_message(channel: &mut Channel, sender: address, content: String, message_type: u8) {
        let msg_id = message::new_message(
            channel.message_counter,
            sender,
            content,
            message_type
        );
        table::add(&mut channel.messages, channel.message_counter, msg_id);
        channel.message_counter = channel.message_counter + 1;
    }

    /// Send a message and trigger AI response if needed
    public fun send_message(
        account: &signer,
        channel_obj: &mut Object<Channel>,
        content: String,
    ) {
        let sender = signer::address_of(account);
        let now = timestamp::now_milliseconds();
        let channel = object::borrow_mut(channel_obj);

        // Check if sender is a member
        assert!(table::contains(&channel.members, sender), ErrorNotMember);
        assert!(channel.status == CHANNEL_STATUS_ACTIVE, ErrorChannelInactive);
        
        add_message(channel, sender, content, message::type_user());
        
        // Update member's last active time
        let member = table::borrow_mut(&mut channel.members, sender);
        member.last_active = now;
        channel.last_active = now;
    }

    /// Add AI response to the channel (will be implemented by the framework)
    public(friend) fun add_ai_response(channel: &mut Channel, response_message: String, ai_agent_address: address){
        add_message(channel, ai_agent_address, response_message, message::type_ai());
    }

    /// Get all messages in the channel
    public fun get_messages(channel: &Object<Channel>): vector<Message> {
        let channel_ref = object::borrow(channel);
        let messages = vector::empty<Message>();
        let i = 0;
        while (i < channel_ref.message_counter) {
            let msg_id = table::borrow(&channel_ref.messages, i);
            let msg_obj = object::borrow_object<Message>(*msg_id);
            vector::push_back(&mut messages, *object::borrow(msg_obj));
            i = i + 1;
        };
        messages
    }

    /// Get messages with pagination
    public fun get_messages_paginated(
        channel: &Object<Channel>, 
        start_index: u64,
        limit: u64
    ): vector<Message> {
        let channel_ref = object::borrow(channel);
        let messages = vector::empty<Message>();
        
        // Check if start_index is valid
        if (start_index >= channel_ref.message_counter) {
            return messages
        };
        
        // Calculate end index
        let end_index = if (start_index + limit > channel_ref.message_counter) {
            channel_ref.message_counter
        } else {
            start_index + limit
        };
        
        let i = start_index;
        while (i < end_index) {
            let msg_id = table::borrow(&channel_ref.messages, i);
            let msg_obj = object::borrow_object<Message>(*msg_id);
            vector::push_back(&mut messages, *object::borrow(msg_obj));
            i = i + 1;
        };
        messages
    }

    /// Get total message count in the channel
    public fun get_message_count(channel: &Object<Channel>): u64 {
        let channel_ref = object::borrow(channel);
        channel_ref.message_counter
    }

    /// Get last N messages from the channel
    public fun get_last_messages(channel_obj: &Object<Channel>, limit: u64): vector<Message> {
        let channel = object::borrow(channel_obj);
        let messages = vector::empty();
        let start = if (channel.message_counter > limit) {
            channel.message_counter - limit
        } else {
            0
        };
        
        let i = start;
        while (i < channel.message_counter) {
            let msg_id = table::borrow(&channel.messages, i);
            let msg_obj = object::borrow_object<Message>(*msg_id);
            vector::push_back(&mut messages, *object::borrow(msg_obj));
            i = i + 1;
        };
        messages
    }

    /// Check if address is member of channel
    public fun is_member(channel: &Object<Channel>, addr: address): bool {
        let channel_ref = object::borrow(channel);
        table::contains(&channel_ref.members, addr)
    }

    /// Get member info
    public fun get_member_info(channel: &Object<Channel>, addr: address): (u64, u64) {
        let channel_ref = object::borrow(channel);
        assert!(table::contains(&channel_ref.members, addr), ErrorNotAuthorized);
        let member = table::borrow(&channel_ref.members, addr);
        (
            member.joined_at,
            member.last_active
        )
    }

    /// Send a message and trigger AI response if needed
    public entry fun send_message_entry(
        account: &signer,
        channel_obj: &mut Object<Channel>,
        content: String
    ) {
        // let channel_id = object::id(channel_obj);
        // let is_ai_channel = object::borrow(channel_obj).channel_type == CHANNEL_TYPE_AI;
        
        // // If it's an AI channel, request AI response
        // if (is_ai_channel) {
        //     //TODO make the number of messages to fetch configurable
        //     let message_limit: u64 = 10;
        //     let prev_messages = get_last_messages(channel_obj, message_limit);
        //     ai_service::request_ai_response(
        //         account,
        //         channel_id,
        //         content,
        //         prev_messages
        //     );
        // };
        send_message(account, channel_obj, content);
    }

    /// Update channel title
    public(friend) fun update_channel_title(channel_obj: &mut Channel, new_title: String) {
        channel_obj.title = new_title;
    }

     /// Add member to channel
    fun add_member_internal(
        channel: &mut Channel, 
        member_addr: address,
        now: u64,
    ) {
        if (!table::contains(&channel.members, member_addr)) {
            let member = Member {
                address: member_addr,
                joined_at: now,
                last_active: now,
            };
            table::add(&mut channel.members, member_addr, member);
        }
    }

    /// Join channel for AI_HOME type
    public fun join_channel(
        account: &signer,
        channel_obj: &mut Object<Channel>,
    ) {
        let sender = signer::address_of(account);
        let channel = object::borrow_mut(channel_obj);
        
        // Only AI_HOME channels can be joined directly
        assert!(channel.channel_type == CHANNEL_TYPE_AI_HOME, ErrorNotAuthorized);
        
        let now = timestamp::now_milliseconds();
        add_member_internal(channel, sender, now);
    }

    /// Entry function for joining a channel
    public entry fun join_channel_entry(
        account: &signer,
        channel_obj: &mut Object<Channel>,
    ) {
        join_channel(account, channel_obj);
    }

    // =================== Test helpers ===================

    #[test_only]
    /// Test helper function to delete a channel, only available in test mode
    fun force_delete_channel(channel: Object<Channel>) {
        let Channel { 
            title: _,
            creator: _,
            members,
            messages,
            message_counter: _,
            created_at: _,
            last_active: _,
            status: _,
            channel_type: _,
        } = object::remove(channel);
        
        table::drop(members);
        table::drop(messages);
    }

    #[test_only]
    /// Public test helper function to delete a channel
    public fun delete_channel_for_testing(channel_id: ObjectID) {
        let channel = object::take_object_extend<Channel>(channel_id);
        force_delete_channel(channel);
    }

}