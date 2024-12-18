/**
 * Map the network, each node contains of root/backdoor/player-owned and server objects
 */

import { ServerFlags } from "utils.js"

function createMap(ns) {
    const networkMap = {
        nodes: {
            home: { flags: [] }
        },
        adjList: {
            home: []
        }
    }
    const servers = ns.scan().map(v => [v, ns.getHostname()])

    while (servers.length) {
        const [server, parent] = servers.pop()

        if (!networkMap.nodes.hasOwnProperty(server)) {
            let flags = 0

            const serverObj = ns.getServer(server)
            if (serverObj.purchasedByPlayer)
                flags |= ServerFlags.PLAYER

            if (ns.hasRootAccess(server)) {
                flags |= ServerFlags.ROOT

                if (serverObj.backdoorInstalled)
                    flags |= ServerFlags.BACKDOOR
            } else {
                ns.brutessh()
                ns.ftpcrack()
                ns.relaysmtp()
                ns.httpworm()
                ns.sqlinject()

                ns.nuke()
            }

            networkMap.nodes[server] = {
                flags: flags,
                data: serverObj,
            }

            networkMap.adjList[server] = []
            servers.push(...ns.scan(server).map(v => [v, server]))
        }

        networkMap.adjList[parent].push(server)
    }

    return networkMap
}

/** @param {NS} ns */
export async function main(ns) {
    const map = createMap(ns)
    localStorage.setItem("networkMap", JSON.stringify(map))
}