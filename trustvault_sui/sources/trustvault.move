module trustvault::registry;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::table::{Self, Table};

const E_ALREADY_EXISTS: u64 = 0;

public struct Registry has key {
    id: UID,
    proofs: Table<String, address>,
}

public struct ProofCreated has copy, drop {
    cid: String,
    owner: address,
    file_hash: String,
    timestamp_ms: u64,
}

fun init(ctx: &mut TxContext) {
    let registry = Registry {
        id: object::new(ctx),
        proofs: table::new(ctx),
    };
    transfer::share_object(registry);
}

public fun register_proof(
    registry: &mut Registry,
    cid: String,
    file_hash: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);

    assert!(!table::contains(&registry.proofs, cid), E_ALREADY_EXISTS);
    table::add(&mut registry.proofs, cid, sender);

    event::emit(ProofCreated {
        cid,
        owner: sender,
        file_hash,
        timestamp_ms: clock.timestamp_ms(),
    });
}

public fun exists(registry: &Registry, cid: String): bool {
    table::contains(&registry.proofs, cid)
}