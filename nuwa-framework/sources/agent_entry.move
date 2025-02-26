module nuwa_framework::agent_entry {
    use std::signer;
    use moveos_std::object::{Self, Object};
    use nuwa_framework::character::{Character};
    use nuwa_framework::agent::{Self, Agent};
    use nuwa_framework::agent_cap;
    use nuwa_framework::channel;

    public entry fun create_agent_entry(creater: &signer, character: Object<Character>) {
        let creater_addr = signer::address_of(creater);
        let agent_cap = agent::create_agent(character);
        let agent_id = agent_cap::get_agent_obj_id(&agent_cap);
        let agent = object::borrow_mut_object_shared<Agent>(agent_id);
        let _channel_id = channel::create_ai_home_channel(agent);
        object::transfer(agent_cap, creater_addr);    
    }
}