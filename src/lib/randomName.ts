import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
} from "unique-names-generator"

export const randomName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-'
    })
}
