/**
 * Emulate crontab automation with seconds/minutes/hours
 */

function match(time, cron) {
    const selector = cron[0]
    const modulus = cron?.[1]

    if (selector == '*')
        return !modulus || ((time % modulus) == 0)

    return selector == time
}

/** @param {NS} ns */
export async function main(ns) {
    if (localStorage.getItem("cronlock") != null)
        ns.exit()

    localStorage.setItem("cronlock", true)
    ns.atExit(_ => localStorage.clear("cronlock"))

    while (true) {
        const lines = (await ns.read("crontab.txt")).split('\n').map(v => v.trim().split(' '))
        const time = new Date()

        for (const line of lines) {
            const [script, ...args] = line.splice(3)
            const [seconds, minutes, hours] = line.map(v => v.split('/'))

            if (!match(time.getHours(), hours, ns))
                continue

            if (!match(time.getMinutes(), minutes, ns))
                continue

            if (!match(time.getSeconds(), seconds, ns))
                continue

            console.log(`[${new Date()}] ns.exec(${script}, ${ns.getHostname()}, {}, ${args.join(',')})`)
            ns.exec(script, ns.getHostname(), {}, ...args)
        }

        await ns.asleep(1000)
    }
}