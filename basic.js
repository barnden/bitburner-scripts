/**
 * Basic weaken-grow-hack loop
 * 
 * TODO: Implement timer-based script
 */
import { NetworkMap } from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const nm = new NetworkMap(ns)
    const target = ns.args[0]
    const numThreads = ns.args?.[1] ?? 1
    const server = ns.getHostname()
    const minSecurity = nm.data(server).minDifficulty
    const maxMoney = nm.data(server).moneyMax

    while (true) {
        if (ns.getServerSecurityLevel(target) >= (0.050 * numThreads) + minSecurity) {
            await ns.weaken(target)
        } else if (ns.getServerMoneyAvailable(target) <= .9 * maxMoney) {
            await ns.grow(target)
        } else {
            await ns.hack(target)
        }
    }
}