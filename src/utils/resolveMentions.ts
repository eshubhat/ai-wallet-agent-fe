import { contactService } from '../services/contact.service';

/**
 * Replaces all @mentions in a string with their corresponding wallet addresses from the contact service.
 * Mentions that don't match any contact are left unchanged.
 * 
 * @param text The original chat input text
 * @returns The resolved text ready for AI intent parsing
 */
export async function resolveMentions(text: string): Promise<string> {
    if (!text) return text;

    // Match @ followed by alphanumeric characters and underscores
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;

    let result = text;
    const matches = Array.from(text.matchAll(mentionRegex));

    // Resolve mentions using contacts
    for (const match of matches) {
        const username = match[1];
        const contact = await contactService.findByName(username);
        if (contact) {
            // Use regex replacement strictly on the exact match to avoid replacing parts of words
            const exactMatchRegex = new RegExp(`@${username}\\b`, 'g');
            result = result.replace(exactMatchRegex, contact.address);
        }
    }

    return result;
}
