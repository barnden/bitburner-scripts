/**
 * 1) Find route to serverName if args[0] != "contracts"
 * 2) TODO: Find all contract files
 */

import { NetworkMap } from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const serverName = ns.args[0]
    const nm = new NetworkMap(ns)

    if (serverName == "contracts") {
        // FIXME: Implement
    } else {
        ns.tprint(nm.find(ns.getHostname(), serverName))
    }
}