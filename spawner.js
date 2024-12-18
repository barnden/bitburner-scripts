/**
 * Automatically compute the max number of threads, and run "basic.js"
 */

import { NetworkMap } from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const nm = new NetworkMap()

    const server = ns.args?.[0] ?? ns.getHostname()
    const target = ns.args?.[1] ?? server

    const requiredRAM = ns.getScriptRam("basic.js")
    const usedRAM = ns.getServerUsedRam(server) - ns.getScriptRam("spawner.js")
    const availableRAM = nm.data(server).maxRam - usedRAM
    const numThreads = Math.floor(availableRAM / requiredRAM)

    ns.tprint(`(${server}) spawned ${numThreads} threads. target: ${target}`)
    ns.spawn("basic.js", {threads: numThreads}, target, numThreads)
}