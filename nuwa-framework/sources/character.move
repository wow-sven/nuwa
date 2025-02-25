module nuwa_framework::character {

    use std::string::String;
    use std::vector;

    use moveos_std::object::{Self, Object};
    use moveos_std::json;
    use moveos_std::signer;


    /// Character represents an AI agent's personality and knowledge
    struct Character has key,store {
        name: String,
        username: String,
        description: String,      // The character's system prompt
        bio: vector<String>,      // Character's background stories and personalities
        knowledge: vector<String>,// Character's domain knowledge and capabilities
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

    public fun create_character(data: CharacterData): Object<Character> {
        let co = new_character(data);
        co
    } 

    public entry fun create_character_from_json(caller: &signer, json: vector<u8>){
        let data = json::from_json<CharacterData>(json);
        let co = create_character(data);
        object::transfer(co, signer::address_of(caller));
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

    public fun get_username(character: &Character): &String {
        &character.username
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
    fun test_character() {
        use std::string;
        // Create test character
        let data = new_character_data(
            string::utf8(b"Dobby"),
            string::utf8(b"dobby"),
            string::utf8(b"You are Dobby, a helpful and loyal assistant."),
            vector[string::utf8(b"Dobby is a free assistant who helps because of his enormous heart.")],
            vector[string::utf8(b"Creative problem-solving")]
        );
        
        let character_obj = create_character(data);
        let character = object::borrow(&character_obj);
        
        // Verify character fields
        assert!(*get_name(character) == string::utf8(b"Dobby"), 1);
        assert!(*get_description(character) == string::utf8(b"You are Dobby, a helpful and loyal assistant."), 2);
        assert!(vector::length(get_bio(character)) == 1, 3);
        assert!(vector::length(get_knowledge(character)) == 1, 4);
       
        // Test add_bio
        add_bio(&mut character_obj, string::utf8(b"Dobby excels at programming and system design"));
        let character = object::borrow(&character_obj);
        assert!(vector::length(get_bio(character)) == 2, 6);

        // Test add_knowledge
        add_knowledge(&mut character_obj, string::utf8(b"System architecture"));
        let character = object::borrow(&character_obj);
        assert!(vector::length(get_knowledge(character)) == 2, 7);

        // Clean up
        destroy_character(character_obj);
    }
}
