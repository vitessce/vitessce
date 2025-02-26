/* eslint-disable camelcase */
import { describe, expect, it } from 'vitest';
import {
  group as d3_group,
  rollup as d3_rollup,
  index as d3_index,
} from 'd3-array';
import { unnestMap } from './root.js';

// Reference: https://observablehq.com/@d3/d3-group
const athletes = [
  { name: 'Floyd Mayweather', sport: 'Boxing', nation: 'United States', earnings: 285 },
  { name: 'Lionel Messi', sport: 'Soccer', nation: 'Argentina', earnings: 111 },
  { name: 'Cristiano Ronaldo', sport: 'Soccer', nation: 'Portugal', earnings: 108 },
  { name: 'Conor McGregor', sport: 'MMA', nation: 'Ireland', earnings: 99 },
  { name: 'Neymar', sport: 'Soccer', nation: 'Brazil', earnings: 90 },
  { name: 'LeBron James', sport: 'Basketball', nation: 'United States', earnings: 85.5 },
  { name: 'Roger Federer', sport: 'Tennis', nation: 'Switzerland', earnings: 77.2 },
  { name: 'Stephen Curry', sport: 'Basketball', nation: 'United States', earnings: 76.9 },
  { name: 'Matt Ryan', sport: 'Football', nation: 'United States', earnings: 67.3 },
  { name: 'Matthew Stafford', sport: 'Football', nation: 'United States', earnings: 59.5 },
];

const athletesBySport = d3_group(athletes, d => d.sport);
const athletesBySportAndNation = d3_group(athletes, d => d.sport, d => d.nation);
const athletesByNationAndSport = d3_group(athletes, d => d.nation, d => d.sport);

describe('root.ts', () => {
  describe('unnestMap works as expected', () => {
    it('Can flatten a Map with one level', () => {
      const m = new Map([
        ['Boxing', 1],
        ['Soccer', 2],
        ['MMA', 3],
        ['Basketball', 50],
      ]);
      expect(unnestMap(m, ['sport', 'value'])).toEqual([
        { sport: 'Boxing', value: 1 },
        { sport: 'Soccer', value: 2 },
        { sport: 'MMA', value: 3 },
        { sport: 'Basketball', value: 50 },
      ]);
    });
    it('Can flatten a nested Map with one level', () => {
      expect(unnestMap(athletesBySport, ['sport', 'value'])).toEqual([
        {
          sport: 'Boxing',
          value: [
            {
              name: 'Floyd Mayweather',
              sport: 'Boxing',
              nation: 'United States',
              earnings: 285,
            },
          ],
        },
        {
          sport: 'Soccer',
          value: [
            {
              name: 'Lionel Messi',
              sport: 'Soccer',
              nation: 'Argentina',
              earnings: 111,
            },
            {
              name: 'Cristiano Ronaldo',
              sport: 'Soccer',
              nation: 'Portugal',
              earnings: 108,
            },
            {
              name: 'Neymar',
              sport: 'Soccer',
              nation: 'Brazil',
              earnings: 90,
            },
          ],
        },
        {
          sport: 'MMA',
          value: [
            {
              name: 'Conor McGregor',
              sport: 'MMA',
              nation: 'Ireland',
              earnings: 99,
            },
          ],
        },
        {
          sport: 'Basketball',
          value: [
            {
              name: 'LeBron James',
              sport: 'Basketball',
              nation: 'United States',
              earnings: 85.5,
            },
            {
              name: 'Stephen Curry',
              sport: 'Basketball',
              nation: 'United States',
              earnings: 76.9,
            },
          ],
        },
        {
          sport: 'Tennis',
          value: [
            {
              name: 'Roger Federer',
              sport: 'Tennis',
              nation: 'Switzerland',
              earnings: 77.2,
            },
          ],
        },
        {
          sport: 'Football',
          value: [
            {
              name: 'Matt Ryan',
              sport: 'Football',
              nation: 'United States',
              earnings: 67.3,
            },
            {
              name: 'Matthew Stafford',
              sport: 'Football',
              nation: 'United States',
              earnings: 59.5,
            },
          ],
        },
      ]);
    });
    it('Can flatten a nested Map with two levels', () => {
      expect(unnestMap(athletesBySportAndNation, ['sport', 'nation', 'value'])).toEqual([
        {
          sport: 'Boxing',
          nation: 'United States',
          value: [
            {
              name: 'Floyd Mayweather',
              sport: 'Boxing',
              nation: 'United States',
              earnings: 285,
            },
          ],
        },
        {
          sport: 'Soccer',
          nation: 'Argentina',
          value: [
            {
              name: 'Lionel Messi',
              sport: 'Soccer',
              nation: 'Argentina',
              earnings: 111,
            },
          ],
        },
        {
          sport: 'Soccer',
          nation: 'Portugal',
          value: [
            {
              name: 'Cristiano Ronaldo',
              sport: 'Soccer',
              nation: 'Portugal',
              earnings: 108,
            },
          ],
        },
        {
          sport: 'Soccer',
          nation: 'Brazil',
          value: [
            {
              name: 'Neymar',
              sport: 'Soccer',
              nation: 'Brazil',
              earnings: 90,
            },
          ],
        },
        {
          sport: 'MMA',
          nation: 'Ireland',
          value: [
            {
              name: 'Conor McGregor',
              sport: 'MMA',
              nation: 'Ireland',
              earnings: 99,
            },
          ],
        },
        {
          sport: 'Basketball',
          nation: 'United States',
          value: [
            {
              name: 'LeBron James',
              sport: 'Basketball',
              nation: 'United States',
              earnings: 85.5,
            },
            {
              name: 'Stephen Curry',
              sport: 'Basketball',
              nation: 'United States',
              earnings: 76.9,
            },
          ],
        },
        {
          sport: 'Tennis',
          nation: 'Switzerland',
          value: [
            {
              name: 'Roger Federer',
              sport: 'Tennis',
              nation: 'Switzerland',
              earnings: 77.2,
            },
          ],
        },
        {
          sport: 'Football',
          nation: 'United States',
          value: [
            {
              name: 'Matt Ryan',
              sport: 'Football',
              nation: 'United States',
              earnings: 67.3,
            },
            {
              name: 'Matthew Stafford',
              sport: 'Football',
              nation: 'United States',
              earnings: 59.5,
            },
          ],
        },
      ]);
    });
    it('Can flatten a nested Map with one level and an aggregation function', () => {
      expect(unnestMap(athletesBySport, ['sport', 'value'], (arr: any[]) => arr.length)).toEqual([
        {
          sport: 'Boxing',
          value: 1,
        },
        {
          sport: 'Soccer',
          value: 3,
        },
        {
          sport: 'MMA',
          value: 1,
        },
        {
          sport: 'Basketball',
          value: 2,
        },
        {
          sport: 'Tennis',
          value: 1,
        },
        {
          sport: 'Football',
          value: 2,
        },
      ]);
    });
    it('Works with d3.group to switch the order of the hierarchy levels', () => {
      const unnestResult = (
        unnestMap(athletesBySportAndNation, ['sport', 'nation', 'value'])
          .flatMap((v: any) => v.value)
      );
      const nationThenSport = d3_group(unnestResult, (d: any) => d.nation, (d: any) => d.sport);
      expect(nationThenSport).toEqual(athletesByNationAndSport);
    });
    it('Works with d3.index to go from Map -> array of objects -> Map', () => {
      const m = new Map([
        ['Boxing', 1],
        ['Soccer', 2],
        ['MMA', 3],
        ['Basketball', 50],
      ]);
      expect(
        unnestMap(
          d3_index(
            unnestMap(m, ['sport', 'value']),
            (d: any) => d.sport,
          ),
          ['sport', 'value'],
          (d: any) => d.value,
        ),
      ).toEqual([
        { sport: 'Boxing', value: 1 },
        { sport: 'Soccer', value: 2 },
        { sport: 'MMA', value: 3 },
        { sport: 'Basketball', value: 50 },
      ]);
    });
    it('Works with d3.rollup to go from Map -> array of objects -> Map', () => {
      const m = new Map([
        ['Boxing', 1],
        ['Soccer', 2],
        ['MMA', 3],
        ['Basketball', 50],
      ]);
      expect(
        Array.from(d3_rollup(
          unnestMap(m, ['sport', 'value']),
          (D: any) => D[0].value,
          (d: any) => d.sport,
        ).entries()),
      ).toEqual(Array.from(m.entries()));
    });
  });
});
