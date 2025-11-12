import { db } from "../db.js";
import { issueRepository } from "./issueRepository.js";
async function stats() {
  if (db.available) {
    const byStatus = await db.pool.query("select status, count(*)::int as count from issues group by status");
    const byNeighborhood = await db.pool.query("select neighborhood, count(*)::int as count from issues where neighborhood is not null and neighborhood <> '' group by neighborhood order by count desc limit 20");
    const byCategory = await db.pool.query("select c.slug as category, count(i.*)::int as count from issues i join issue_categories c on c.id=i.category_id group by c.slug order by count desc");
    return { byStatus: byStatus.rows, byNeighborhood: byNeighborhood.rows, byCategory: byCategory.rows };
  }
  const items = await issueRepository.list({});
  const byStatus = {};
  const byNeighborhood = {};
  const byCategory = {};
  for (const i of items) {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    if (i.neighborhood) byNeighborhood[i.neighborhood] = (byNeighborhood[i.neighborhood] || 0) + 1;
    byCategory[String(i.category_id)] = (byCategory[String(i.category_id)] || 0) + 1;
  }
  return {
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byNeighborhood: Object.entries(byNeighborhood).map(([neighborhood, count]) => ({ neighborhood, count })).sort((a,b)=>b.count-a.count).slice(0,20),
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })).sort((a,b)=>b.count-a.count)
  };
}
export const adminRepository = { stats };
