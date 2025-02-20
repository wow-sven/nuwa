module nuwa_framework::character {

    use std::string::{String};
    use std::vector;

    use moveos_std::object::{Self, Object};
    use moveos_std::json;
    use moveos_std::signer;


    /// Character represents an AI agent's personality and knowledge
    struct Character has key,store {
        name: String,
        username: String,
        description: String,
        bio: vector<String>,          // Character's background stories and personalities
        knowledge: vector<String>,    // Character's domain knowledge and capabilities
    }

    #[data_struct]
    /// Data structure for character creation
    struct CharacterData has copy, drop, store {
        name: String,
        username: String,
        description: String,
        bio: vector<String>,
        knowledge: vector<String>,
    }

    public fun new_character_data(
        name: String,
        username: String,
        description: String,
        bio: vector<String>,
        knowledge: vector<String>,
    ) : CharacterData {
        CharacterData {
            name,
            username,
            description,
            bio,
            knowledge,
        }
    }

    fun new_character(data: CharacterData) : Object<Character> {
        let character = Character {
            name: data.name,
            username: data.username,
            description: data.description,
            bio: data.bio,
            knowledge: data.knowledge,
        };
        // Every account only has one character
        object::new(character)
    }

    fun drop_character(c: Character) {
        let Character {
            name: _,
            username: _,
            description: _,
            bio: _,
            knowledge: _,
        } = c;
    }

    public fun create_character(caller: &signer, data: CharacterData){
        let caller_address = signer::address_of(caller);
        let co = new_character(data);
        object::transfer(co, caller_address);
    } 

    public entry fun create_character_from_json(caller: &signer, json: vector<u8>){
        let data = json::from_json<CharacterData>(json);
        create_character(caller, data);
    }

    public entry fun add_bio(co: &mut Object<Character>, bio: String) {
        let c = object::borrow_mut(co);
        if(vector::contains(&c.bio, &bio)){
            return
        };
        vector::push_back(&mut c.bio, bio);
    }

    public entry fun add_knowledge(co: &mut Object<Character>, knowledge: String) {
        let c = object::borrow_mut(co);
        if(vector::contains(&c.knowledge, &knowledge)){
            return
        };
        vector::push_back(&mut c.knowledge, knowledge);
    }

    public entry fun destroy_character(co: Object<Character>){
        let c = object::remove(co);
        drop_character(c);
    }

    public fun get_name(character: &Character): &String {
        &character.name
    }

    public fun get_description(character: &Character): &String {
        &character.description
    }

    public fun get_bio(character: &Character): &vector<String> {
        &character.bio
    }

    public fun get_knowledge(character: &Character): &vector<String> {
        &character.knowledge
    }

    #[test(caller = @0x42)]
    fun test_character(caller: &signer) {
        let agent_account = std::signer::address_of(caller);
        // Simplified test JSON that matches new structure
        let json_str = b"{\"name\":\"Dobby\",\"username\":\"dobby\",\"plugins\":[],\"modelProvider\":\"anthropic\",\"description\":\"You are Dobby, a helpful and loyal assistant.\",\"bio\":[\"Dobby is a free assistant who helps because of his enormous heart.\",\"Extremely devoted and will go to any length to help his friends.\",\"Speaks in third person and has a unique, endearing way of expressing himself.\",\"Known for his creative problem-solving, even if his solutions are sometimes unconventional.\",\"Once a house-elf, now a free helper who chooses to serve out of love and loyalty.\"],\"knowledge\":[\"Creative problem-solving\",\"Protective services\",\"Loyal assistance\",\"Unconventional solutions\"]}";
        create_character_from_json(caller, json_str);
        let created_character = object::borrow_mut(co); // 'co' needs to be defined or passed appropriately
        add_bio(created_character, b"Dobby excels at programming and system design");
    }
}
