// Appendix G: what Search turns up (2-4 rolls, once per site). 'relic' is a roll on the relic table.

export const LOOT: Record<string, [string, number, number?][]> = {
  galleries: [['scrap', 30], ['emptyCell', 20], ['film', 20], ['cell', 10], ['tallow', 10], ['bolt', 10, 3]],
  ducts: [['water', 25], ['cell', 20], ['scrap', 15], ['emptyCell', 15], ['brochure', 10], ['relic', 5], ['bolt', 10, 3]],
  stair: [['glassTooth', 25], ['cell', 15], ['scrap', 15], ['relic', 15], ['brochure', 10], ['water', 10], ['bolt', 10, 3]],
  hall: [['relic', 30], ['cell', 20], ['brochure', 20], ['glassTooth', 15], ['water', 15]],
  u0041: [['masonPlate', 30], ['scrap', 25], ['cell', 20], ['relic', 15], ['brochure', 10]],
}
