/**
 * Propagate "basic.js" and "spawner.js" to every nuked server, and run "spawner.js"
 */

import { NetworkMap, ServerFlags, argmin } from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const nm = new NetworkMap(ns)
    const blacklist = new Set()
    let numTargets = parseInt(ns.args?.[0] ?? 1)

    if (isNaN(numTargets)) {
        ns.args.slice(1).forEach(v => blacklist.add(v))
    } else {
        ns.args.forEach(v => blacklist.add(v))
    }

    const serverMap = new Map()
    {
        const scriptRAM = ns.getScriptRam("basic.js")
        const servers = nm.filter({ includeFlags: ServerFlags.ROOT })
        for (const server of servers) {
            if (blacklist.has(server))
                continue

            const serverThreads = Math.floor(nm.data(server).maxRam / scriptRAM)

            serverMap.set(server, serverThreads)
        }
    }

    /**
     * Want targets
     * 1) not owned by player
     * 2) is hackable at our current skill
     * 3) is not included in our blacklist
     * 4) in order of most growth
     */
    const possibleTargets = nm
        .filter({ excludeFlags: ServerFlags.PLAYER })
        .filter(v => nm.data(v).requiredHackingSkill <= ns.getPlayer().skills.hacking)
        .filter(v => !blacklist.has(v))
    possibleTargets.sort((a, b) => nm.data(b).serverGrowth - nm.data(a).serverGrowth)

    const targets = possibleTargets.slice(0, numTargets)
    const targetThreads = new Uint32Array(numTargets)

    /**
     * We want k-subsets (k=numTargets) with roughly totalThreads/k threads per subset
     */
    const servers = Array.from(serverMap.entries())
    servers.sort((a, b) => b - a)

    for (const [server, serverThreads] of servers) {
        const targetIdx = argmin(targetThreads)
        const target = targets[targetIdx]

        targetThreads[targetIdx] += serverThreads

        ns.killall(server, true)
        ns.scp("basic.js", server)
        ns.scp("utils.js", server)
        ns.scp("spawner.js", server)
        ns.exec("spawner.js", server, {}, server, target)
    }

    ns.tprint("target info ", targets.map((v, i) => [v, nm.data(v).serverGrowth, targetThreads[i]]))
}