// ruleid: no-inline-regex
const match = /abc/.exec('abc')

// ruleid: no-inline-regex
const builtInline = new RegExp('abc').test('abc')

// ruleid: no-inline-regex
const called = { pattern: /abc/.exec('abc') }

// ok: no-inline-regex
const LITERAL = /abc/

// ok: no-inline-regex
const BUILT = new RegExp('abc')

// ok: no-inline-regex
export const EXPORTED = /abc/i

// ok: no-inline-regex
const routes = { pattern: /abc/ }

// ok: no-inline-regex
export const exportedRoutes = { pattern: new RegExp('abc') }

void match
void called
void builtInline
void LITERAL
void BUILT
void EXPORTED
void routes
void exportedRoutes
