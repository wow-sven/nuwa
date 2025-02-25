module nuwa_framework::agent_input{
    use std::string::String;
    
    struct AgentInput<I> has copy, drop, store {
        sender: address,
        input_description: String,
        input_data: I,
    }


    public fun new_agent_input<I>(
        sender: address,
        input_description: String,
        input_data: I,
    ): AgentInput<I> {
        AgentInput {
            sender,
            input_description,
            input_data,
        }
    }

    public fun get_sender<I>(input: &AgentInput<I>): address {
        input.sender
    }

    public fun get_input_description<I>(input: &AgentInput<I>): &String {
        &input.input_description
    }

    public fun get_input_data<I>(input: &AgentInput<I>): &I {
        &input.input_data
    }

    public fun unpack<I>(input: AgentInput<I>) : (address, String, I) {
        let AgentInput { sender, input_description, input_data } = input;
        (sender, input_description, input_data)
    }
}