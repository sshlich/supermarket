// Small helpers for writing HTML as text.

/** Text made safe to put in HTML, in an element or a quoted attribute. */
export const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
