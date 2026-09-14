
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  email: 'email',
  tier: 'tier',
  riskScore: 'riskScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  price: 'price',
  stockQuantity: 'stockQuantity',
  replacementEligible: 'replacementEligible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  customerId: 'customerId',
  status: 'status',
  totalAmount: 'totalAmount',
  currency: 'currency',
  deliveryDate: 'deliveryDate',
  shippingStatus: 'shippingStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  quantity: 'quantity',
  unitPrice: 'unitPrice'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  customerId: 'customerId',
  orderId: 'orderId',
  issueType: 'issueType',
  customerMessage: 'customerMessage',
  status: 'status',
  resolutionSummary: 'resolutionSummary',
  refundAmount: 'refundAmount',
  replacementSku: 'replacementSku',
  requiresApproval: 'requiresApproval',
  requiresConsent: 'requiresConsent',
  approvalStatus: 'approvalStatus',
  consentStatus: 'consentStatus',
  approvalToken: 'approvalToken',
  idempotencyKey: 'idempotencyKey',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PolicyVersionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  policyId: 'policyId',
  version: 'version',
  rulesJson: 'rulesJson',
  isActive: 'isActive',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentRunScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  ticketId: 'ticketId',
  status: 'status',
  intent: 'intent',
  confidence: 'confidence',
  executedTools: 'executedTools',
  overallOutcome: 'overallOutcome',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentTraceScalarFieldEnum = {
  id: 'id',
  agentRunId: 'agentRunId',
  ticketId: 'ticketId',
  step: 'step',
  evidenceDetails: 'evidenceDetails',
  actor: 'actor',
  timestamp: 'timestamp'
};

exports.Prisma.CaseRecordScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  ticketId: 'ticketId',
  orderId: 'orderId',
  customerId: 'customerId',
  issueType: 'issueType',
  customerMessage: 'customerMessage',
  status: 'status',
  resolutionSummary: 'resolutionSummary',
  requiresCustomerAction: 'requiresCustomerAction',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefundTransactionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  orderId: 'orderId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  customerId: 'customerId',
  code: 'code',
  discount: 'discount',
  isRedeemed: 'isRedeemed',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  customerId: 'customerId',
  type: 'type',
  message: 'message',
  channel: 'channel',
  status: 'status',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.ExecutionJobScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  runId: 'runId',
  status: 'status',
  payloadJson: 'payloadJson',
  attemptCount: 'attemptCount',
  maxAttempts: 'maxAttempts',
  lastError: 'lastError',
  workerId: 'workerId',
  leaseGeneration: 'leaseGeneration',
  leaseExpiresAt: 'leaseExpiresAt',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MetricSnapshotScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  metricName: 'metricName',
  value: 'value',
  labelsJson: 'labelsJson',
  timestamp: 'timestamp'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  correlationId: 'correlationId',
  action: 'action',
  actor: 'actor',
  detailsJson: 'detailsJson',
  timestamp: 'timestamp'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};


exports.Prisma.ModelName = {
  Customer: 'Customer',
  Product: 'Product',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Ticket: 'Ticket',
  PolicyVersion: 'PolicyVersion',
  AgentRun: 'AgentRun',
  AgentTrace: 'AgentTrace',
  CaseRecord: 'CaseRecord',
  RefundTransaction: 'RefundTransaction',
  Coupon: 'Coupon',
  Notification: 'Notification',
  ExecutionJob: 'ExecutionJob',
  MetricSnapshot: 'MetricSnapshot',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
