module nuwa_framework::ai_request {
    use std::string::{String};
    use moveos_std::json;

    #[data_struct]
    struct ChatMessage has store, copy, drop {
        /// Must be "user" or "assistant" in JSON
        role: String,
        content: String,
    }

    #[data_struct]
    struct ChatRequest has store, copy, drop {
        model: String,
        messages: vector<ChatMessage>,
        //TODO use Decimal type
        temperature: u64,
    }

    public fun new_chat_request(model: String, messages: vector<ChatMessage>): ChatRequest {
        ChatRequest {
            model,
            messages,
            temperature: 1,
        }
    }

    public fun to_json(request: &ChatRequest): vector<u8> {
        json::to_json(request)
    }

}