import { prisma } from '../packages/db/src/index.js';
async function main() {
  const events = await prisma.competitorEvent.findMany({
    where: { teamId: 'cmqp44yeo0002ygfbuesqcr0i', type: 'price_changed' }
  });
  for (const e of events) {
    const p = e.payload as Record<string, string>;
    if (p.oldPrice?.startsWith('USD ')) {
      await prisma.competitorEvent.update({
        where: { id: e.id },
        data: { payload: { ...p, oldPrice: p.oldPrice.replace('USD ', ''), newPrice: p.newPrice.replace('USD ', '') } }
      });
      console.log('fixed', e.id, '->', p.oldPrice.replace('USD ', ''), 'to', p.newPrice.replace('USD ', ''));
    }
  }
  await prisma.$disconnect();
}
main().catch(console.error);
