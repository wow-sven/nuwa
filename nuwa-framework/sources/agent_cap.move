// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0

module nuwa_framework::agent_cap {

    use moveos_std::object::{Self, Object, ObjectID};
    use moveos_std::event;
    
    const ErrorAgentCapNotFound: u64 = 1;
    const ErrorCallerHasNoMemoryCap: u64 = 2;
    const ErrorCallerHasNoMemoryCreateCap: u64 = 3;
    const ErrorCallerHasNoMemoryDeleteCap: u64 = 4;
    const ErrorCallerHasNoMemoryUpdateCap: u64 = 5;

    friend nuwa_framework::agent;

    struct AgentCap has store, key {
        agent_obj_id: ObjectID,
    }

    /// A cap for managing the memory of an agent.
    struct MemoryCap has store, key {
        agent_obj_id: ObjectID,
        create: bool,
        remove: bool,
        update: bool,
    }

    struct AgentCapDestroyedEvent has copy, drop, store {
        agent_obj_id: ObjectID,
    }

    struct MemoryCapDestroyedEvent has copy, drop, store {
        agent_obj_id: ObjectID,
        create: bool,
        remove: bool,
        update: bool,
    }

    public(friend) fun new_agent_cap(agent_obj_id: ObjectID) : Object<AgentCap> {
        let cap = AgentCap {
            agent_obj_id,
        };
        object::new(cap)
    }

    public(friend) fun new_memory_cap(agent_obj_id: ObjectID, create: bool, remove: bool, update: bool) : Object<MemoryCap> {
        let cap = MemoryCap {
            agent_obj_id,
            create,
            remove,
            update,
        };
        object::new(cap)
    }

    public entry fun destroy_agent_cap(cap: Object<AgentCap>) {
        let agent_cap = object::remove(cap);
        let AgentCap { agent_obj_id } = agent_cap;
        event::emit(AgentCapDestroyedEvent { agent_obj_id });
    }

    public entry fun destroy_memory_cap(cap: Object<MemoryCap>) {
        let memory_cap = object::remove(cap);
        let MemoryCap { agent_obj_id, create, remove, update } = memory_cap;
        event::emit(MemoryCapDestroyedEvent { agent_obj_id, create, remove, update });
    }

    public fun borrow_mut_agent_cap(caller: &signer, agent_obj_id: ObjectID) : &mut Object<AgentCap> {
        assert!(object::exists_object(agent_obj_id), ErrorAgentCapNotFound);
        object::borrow_mut_object<AgentCap>(caller, agent_obj_id)
    }

    public fun check_agent_cap(cap: &mut Object<AgentCap>) : ObjectID {
        let cap = object::borrow(cap);
        cap.agent_obj_id
    }

    public fun check_memory_create_cap(cap: &mut Object<MemoryCap>) : ObjectID {
        let cap = object::borrow(cap);
        assert!(cap.create, ErrorCallerHasNoMemoryCreateCap);
        cap.agent_obj_id
    }

    public fun check_memory_remove_cap(cap: &mut Object<MemoryCap>) : ObjectID {
        let cap = object::borrow(cap);
        assert!(cap.remove, ErrorCallerHasNoMemoryDeleteCap);
        cap.agent_obj_id
    }

    public fun check_memory_update_cap(cap: &mut Object<MemoryCap>) : ObjectID {
        let cap = object::borrow(cap);
        assert!(cap.update, ErrorCallerHasNoMemoryUpdateCap);
        cap.agent_obj_id
    }

    #[test_only]
    public fun issue_agent_cap_for_test(agent_obj_id: ObjectID) : Object<AgentCap> {
        new_agent_cap(agent_obj_id)
    }

    #[test_only]
    public fun issue_memory_cap_for_test(agent_obj_id: ObjectID, create: bool, remove: bool, update: bool) : Object<MemoryCap> {
        new_memory_cap(agent_obj_id, create, remove, update)
    }

}
