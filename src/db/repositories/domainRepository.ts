import { prisma } from '../client.js';

export class DomainRepository {
  // Customer Queries
  static async getCustomerById(id: string, tenantId?: string) {
    return prisma.customer.findFirst({
      where: tenantId ? { id, tenantId } : { id },
      include: {
        orders: true,
        tickets: true,
        coupons: true,
      },
    });
  }

  // Order Queries
  static async getOrderById(id: string, tenantId?: string) {
    try {
      return await prisma.order.findFirst({
        where: tenantId ? { id, tenantId } : { id },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
          refunds: true,
        },
      });
    } catch (err: any) {
      if (err.message?.includes('Inconsistent query result')) {
        await new Promise((r) => setTimeout(r, 20));
        return await prisma.order.findFirst({
          where: tenantId ? { id, tenantId } : { id },
          include: {
            customer: true,
            items: {
              include: { product: true },
            },
            refunds: true,
          },
        });
      }
      throw err;
    }
  }

  // Product Inventory Check
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  // Ticket Queries
  static async getTicketById(id: string, tenantId?: string) {
    return prisma.ticket.findFirst({
      where: tenantId ? { id, tenantId } : { id },
      include: {
        customer: true,
        order: {
          include: { items: { include: { product: true } } },
        },
        agentRuns: {
          include: { traces: true },
        },
      },
    });
  }

  // Active Policy Query
  static async getActivePolicies() {
    return prisma.policy.findMany({
      where: { active: true },
      orderBy: { priority: 'asc' },
    });
  }
}
