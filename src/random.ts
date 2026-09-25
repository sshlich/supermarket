/** A random element of `list`. */
export const pickOne = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)]
