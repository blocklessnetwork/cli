/**
 * Input sanitizer
 * 
 */
const sanitizer = /[^a-zA-Z0-9\-]/
export const sanitize = (input: string) => input.replace(sanitizer, "")

/**
 * Slugify string
 */
export const slugify = (...args: (string | number)[]): string => {
    const value = args.join(' ')

    return value
        .normalize('NFD') // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/-/g, '_')
        .replace(/[^a-z0-9 _]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, '-') // separator
}

/**
 * Parse NPM config version to string
 */
export const parseNpmConfigVersion = 
    (input: string) => 
    input.replace('version', '').trim()