declare function foo(value: RegExp): void

// ruleid: regex-outside-constants
const match = /abc/.exec('abc')

function inlineTest(value: string): boolean {
  // ruleid: regex-outside-constants
  return /abc/.test(value)
}

// ruleid: regex-outside-constants
foo(new RegExp('abc'))

// ruleid: regex-outside-constants
const routes = { pattern: /abc/ }

// ruleid: regex-outside-constants
const LITERAL = /abc/

// ruleid: regex-outside-constants
const BUILT = new RegExp('abc')

// ruleid: regex-outside-constants
export const EXPORTED = /abc/i

// ruleid: regex-outside-constants
export const exportedRoutes = { pattern: new RegExp('abc') }

void match
void routes
void foo
void inlineTest
void LITERAL
void BUILT
void EXPORTED
void exportedRoutes
