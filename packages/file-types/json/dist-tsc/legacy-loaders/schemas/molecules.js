import { z } from 'zod';
export const moleculesSchema = z.record(z.array(
// XY coordinate
z.array(z.number()).length(2)));
