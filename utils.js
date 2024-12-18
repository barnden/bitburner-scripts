const ServerFlags = Object.freeze({
    PLAYER: 1 << 0,
    ROOT: 1 << 1,
    BACKDOOR: 1 << 2
})

function argmin(a) {
    var lowest = 0;
    for (var i = 1; i < a.length; i++)
        if (a[i] < a[lowest]) lowest = i

    return lowest
}

class NetworkMap {
    constructor(ns) {
        this.networkMap = JSON.parse(localStorage.getItem("networkMap"))
    }

    filter(options = {}) {
        const { includeFlags = Number.MAX_SAFE_INTEGER, excludeFlags = 0 } = options

        if (!(includeFlags | excludeFlags))
            return Array.from(Object.keys(this.networkMap.nodes))

        return Object.entries(this.networkMap.nodes)
            .filter(([_, v]) => (includeFlags & v.flags) && !(excludeFlags & v.flags))
            .map(([node, _]) => node)
    }

    data(serverName) {
        return this.networkMap.nodes[serverName].data
    }

    find(start, target, backdoorShortcut = true) {
        // Dijkstra's to find path from current host to server

        const networkMap = this.networkMap
        {
            // Augment graph with a pseudo-node with length 0 to current host and backdoored servers
            // This enables multi-source shortest path with Dijkstra
            const adjList = [start]
            networkMap.nodes["dijkstra_start"] = { flags: [] }

            if (backdoorShortcut)
                adjList.push(...this.filter({ includeFlags: ServerFlags.BACKDOOR }))

            networkMap.adjList["dijkstra_start"] = adjList
        }

        const unvisited = Object.keys(networkMap.nodes)
        const distances = Object.fromEntries(unvisited.map(k => [k, (k != "dijkstra_start") ? Infinity : -1]))
        const visited = new Set()
        const previous = {}

        const shortestNode = _ => {
            // Too lazy to implement a priority queue rn
            // O(n) min-element search is probably good enough ;)
            let minDistance = Infinity
            let minNode = null

            for (const [i, server] of Object.entries(unvisited)) {
                const distance = distances[server]

                if (distance >= minDistance)
                    continue

                minDistance = distance
                minNode = i
            }

            if (minDistance == Infinity)
                return null

            return unvisited.splice(minNode, 1)[0]
        }

        while (unvisited.length && !visited.has(target)) {
            const server = shortestNode()

            if (server == null) // All nodes are infinite in length
                break

            const children = networkMap.adjList[server]

            for (const child of children) {
                if (visited.has(child))
                    continue

                distances[child] = Math.min(distances[child], distances[server] + 1)
                previous[child] = server
            }

            visited.add(server)
        }

        let distance = distances[target]
        let node = target
        let path = []

        do {
            path.push(node)

            distance = distances[node]
            node = previous[node]
        } while (distance)

        return path.reverse().join(" -> ") + ` (dist: ${distances[target]})`
    }
}

export { argmin, NetworkMap, ServerFlags }