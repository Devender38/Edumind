import { prisma } from '../client.js';

export class DomainRepository {
  // Customer Queries
  static async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        orders: true,
        tickets: true,
        coupons: true,
      },
    });
  }

  // Order Queries
  static async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        refunds: true,
      },
    });
  }

  // Product Inventory Check
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  // Ticket Queries
  static async getTicketById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
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
