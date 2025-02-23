module nuwa_framework::string_utils{
    use std::vector;
    use std::string::{Self, String};

    friend nuwa_framework::action_dispatcher;

    //TODO migrate to std::string::starts_with
    public(friend) fun starts_with(haystack_str: &String, needle: &vector<u8>): bool {
        let haystack = string::bytes(haystack_str);
        let haystack_len = vector::length(haystack);
        let needle_len = vector::length(needle);

        if (needle_len > haystack_len) {
            return false
        };

        let i = 0;
        while (i < needle_len) {
            if (vector::borrow(haystack, i) != vector::borrow(needle, i)) {
                return false
            };
            i = i + 1;
        };

        true
    }
}