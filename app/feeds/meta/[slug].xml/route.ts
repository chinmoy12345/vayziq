// The public .xml address is rewritten to the parent route in next.config.ts.
// Keep this module as a compatibility entry for Next's route type generator.
export { GET } from "../route";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
