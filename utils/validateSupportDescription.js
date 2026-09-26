export const supportTextSecurityMessage =
    "Use plain text only. Markup and script-like content are not allowed.";

const unsafeSupportTextPattern =
    /[<>`]|[\u0000-\u001F\u007F]|(?:javascript\s*:|data\s*:\s*text\/html|\bon[a-z]+\s*=|\b(?:eval|Function)\s*\()/i;

export function hasUnsafeSupportText(value) {
    return unsafeSupportTextPattern.test(value);
}