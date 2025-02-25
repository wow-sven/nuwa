module nuwa_framework::message {
    use std::string::String;
    use moveos_std::timestamp;
    use moveos_std::object::{Self, ObjectID};

    /// Message types
    const MESSAGE_TYPE_USER: u8 = 0;
    const MESSAGE_TYPE_AI: u8 = 1;

    /// The message object structure
    /// The message object is owned by the sender
    /// But it is no `store` ability, so the owner can't transfer it to another account
    struct Message has key, copy, drop {
        id: u64,
        channel_id: ObjectID,  // Added channel_id
        sender: address,
        content: String,
        timestamp: u64,
        message_type: u8,
    }

    /// Constructor - message belongs to the sender
    public fun new_message(
        id: u64, 
        channel_id: ObjectID,  // Added channel_id parameter
        sender: address, 
        content: String, 
        message_type: u8
    ): ObjectID {
        let message = Message {
            id,
            channel_id,
            sender,
            content,
            timestamp: timestamp::now_milliseconds(),
            message_type,
        };
        let msg_obj = object::new(message);
        let msg_id = object::id(&msg_obj);
        object::transfer_extend(msg_obj, sender);
        msg_id
    }

    // Getters
    public fun get_id(message: &Message): u64 {
        message.id
    }

    public fun get_channel_id(message: &Message): ObjectID {
        message.channel_id
    }

    public fun get_content(message: &Message): String {
        message.content
    }

    public fun get_type(message: &Message): u8 {
        message.message_type
    }

    public fun get_timestamp(message: &Message): u64 {
        message.timestamp
    }

    public fun get_sender(message: &Message): address {
        message.sender
    }

    // Constants
    public fun type_user(): u8 { MESSAGE_TYPE_USER }
    public fun type_ai(): u8 { MESSAGE_TYPE_AI }

    #[test]
    fun test_message_creation() {
        use std::string;
        
        //TODO provide a test function to generate ObjectID in object.move
        let test_channel_id = object::named_object_id<Message>();
        let msg_id = new_message(
            1, 
            test_channel_id, 
            @0x42, 
            string::utf8(b"test content"), 
            type_user()
        );
        let msg_obj = object::borrow_object<Message>(msg_id);
        let msg = object::borrow(msg_obj);
        
        assert!(get_id(msg) == 1, 0);
        assert!(get_channel_id(msg) == test_channel_id, 1);
        assert!(get_content(msg) == string::utf8(b"test content"), 2);
        assert!(get_type(msg) == type_user(), 3);
        assert!(get_sender(msg) == @0x42, 4);
        assert!(object::owner(msg_obj) == @0x42, 5);
    }
}