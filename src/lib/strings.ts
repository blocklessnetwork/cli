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
        .replace(/[^a-z0-9 _-]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/_/g, '-')
        .replace(/\s+/g, '-') // separator
}


export const normalizeFunctionName = (name: string) => {
  let formattedName = name
  
  if (formattedName) {
    formattedName = formattedName.trim()
    formattedName = formattedName.replace(/_/g, '-')
  }

  return formattedName
}