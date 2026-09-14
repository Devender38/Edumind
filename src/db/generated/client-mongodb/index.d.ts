
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderItem
 * 
 */
export type OrderItem = $Result.DefaultSelection<Prisma.$OrderItemPayload>
/**
 * Model Ticket
 * 
 */
export type Ticket = $Result.DefaultSelection<Prisma.$TicketPayload>
/**
 * Model PolicyVersion
 * 
 */
export type PolicyVersion = $Result.DefaultSelection<Prisma.$PolicyVersionPayload>
/**
 * Model AgentRun
 * 
 */
export type AgentRun = $Result.DefaultSelection<Prisma.$AgentRunPayload>
/**
 * Model AgentTrace
 * 
 */
export type AgentTrace = $Result.DefaultSelection<Prisma.$AgentTracePayload>
/**
 * Model CaseRecord
 * 
 */
export type CaseRecord = $Result.DefaultSelection<Prisma.$CaseRecordPayload>
/**
 * Model RefundTransaction
 * 
 */
export type RefundTransaction = $Result.DefaultSelection<Prisma.$RefundTransactionPayload>
/**
 * Model Coupon
 * 
 */
export type Coupon = $Result.DefaultSelection<Prisma.$CouponPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model ExecutionJob
 * 
 */
export type ExecutionJob = $Result.DefaultSelection<Prisma.$ExecutionJobPayload>
/**
 * Model MetricSnapshot
 * 
 */
export type MetricSnapshot = $Result.DefaultSelection<Prisma.$MetricSnapshotPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Customers
 * const customers = await prisma.customer.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Customers
   * const customers = await prisma.customer.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs, $Utils.Call<Prisma.TypeMapCb, {
    extArgs: ExtArgs
  }>, ClientOptions>

      /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderItems
    * const orderItems = await prisma.orderItem.findMany()
    * ```
    */
  get orderItem(): Prisma.OrderItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ticket`: Exposes CRUD operations for the **Ticket** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tickets
    * const tickets = await prisma.ticket.findMany()
    * ```
    */
  get ticket(): Prisma.TicketDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.policyVersion`: Exposes CRUD operations for the **PolicyVersion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PolicyVersions
    * const policyVersions = await prisma.policyVersion.findMany()
    * ```
    */
  get policyVersion(): Prisma.PolicyVersionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentRun`: Exposes CRUD operations for the **AgentRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentRuns
    * const agentRuns = await prisma.agentRun.findMany()
    * ```
    */
  get agentRun(): Prisma.AgentRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentTrace`: Exposes CRUD operations for the **AgentTrace** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentTraces
    * const agentTraces = await prisma.agentTrace.findMany()
    * ```
    */
  get agentTrace(): Prisma.AgentTraceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.caseRecord`: Exposes CRUD operations for the **CaseRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CaseRecords
    * const caseRecords = await prisma.caseRecord.findMany()
    * ```
    */
  get caseRecord(): Prisma.CaseRecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.refundTransaction`: Exposes CRUD operations for the **RefundTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RefundTransactions
    * const refundTransactions = await prisma.refundTransaction.findMany()
    * ```
    */
  get refundTransaction(): Prisma.RefundTransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.coupon`: Exposes CRUD operations for the **Coupon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coupons
    * const coupons = await prisma.coupon.findMany()
    * ```
    */
  get coupon(): Prisma.CouponDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.executionJob`: Exposes CRUD operations for the **ExecutionJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExecutionJobs
    * const executionJobs = await prisma.executionJob.findMany()
    * ```
    */
  get executionJob(): Prisma.ExecutionJobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.metricSnapshot`: Exposes CRUD operations for the **MetricSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MetricSnapshots
    * const metricSnapshots = await prisma.metricSnapshot.findMany()
    * ```
    */
  get metricSnapshot(): Prisma.MetricSnapshotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.4.1
   * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "customer" | "product" | "order" | "orderItem" | "ticket" | "policyVersion" | "agentRun" | "agentTrace" | "caseRecord" | "refundTransaction" | "coupon" | "notification" | "executionJob" | "metricSnapshot" | "auditLog"
      txIsolationLevel: never
    }
    model: {
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.CustomerFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.CustomerAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ProductFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ProductAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.OrderFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.OrderAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderItem: {
        payload: Prisma.$OrderItemPayload<ExtArgs>
        fields: Prisma.OrderItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findFirst: {
            args: Prisma.OrderItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findMany: {
            args: Prisma.OrderItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          create: {
            args: Prisma.OrderItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          createMany: {
            args: Prisma.OrderItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrderItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          update: {
            args: Prisma.OrderItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          aggregate: {
            args: Prisma.OrderItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderItem>
          }
          groupBy: {
            args: Prisma.OrderItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderItemGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.OrderItemFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.OrderItemAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.OrderItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderItemCountAggregateOutputType> | number
          }
        }
      }
      Ticket: {
        payload: Prisma.$TicketPayload<ExtArgs>
        fields: Prisma.TicketFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TicketFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TicketFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findFirst: {
            args: Prisma.TicketFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TicketFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findMany: {
            args: Prisma.TicketFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          create: {
            args: Prisma.TicketCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          createMany: {
            args: Prisma.TicketCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TicketDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          update: {
            args: Prisma.TicketUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          deleteMany: {
            args: Prisma.TicketDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TicketUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TicketUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          aggregate: {
            args: Prisma.TicketAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTicket>
          }
          groupBy: {
            args: Prisma.TicketGroupByArgs<ExtArgs>
            result: $Utils.Optional<TicketGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.TicketFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.TicketAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.TicketCountArgs<ExtArgs>
            result: $Utils.Optional<TicketCountAggregateOutputType> | number
          }
        }
      }
      PolicyVersion: {
        payload: Prisma.$PolicyVersionPayload<ExtArgs>
        fields: Prisma.PolicyVersionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PolicyVersionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PolicyVersionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          findFirst: {
            args: Prisma.PolicyVersionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PolicyVersionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          findMany: {
            args: Prisma.PolicyVersionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>[]
          }
          create: {
            args: Prisma.PolicyVersionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          createMany: {
            args: Prisma.PolicyVersionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PolicyVersionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          update: {
            args: Prisma.PolicyVersionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          deleteMany: {
            args: Prisma.PolicyVersionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PolicyVersionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PolicyVersionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyVersionPayload>
          }
          aggregate: {
            args: Prisma.PolicyVersionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePolicyVersion>
          }
          groupBy: {
            args: Prisma.PolicyVersionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PolicyVersionGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.PolicyVersionFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.PolicyVersionAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.PolicyVersionCountArgs<ExtArgs>
            result: $Utils.Optional<PolicyVersionCountAggregateOutputType> | number
          }
        }
      }
      AgentRun: {
        payload: Prisma.$AgentRunPayload<ExtArgs>
        fields: Prisma.AgentRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findFirst: {
            args: Prisma.AgentRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findMany: {
            args: Prisma.AgentRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          create: {
            args: Prisma.AgentRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          createMany: {
            args: Prisma.AgentRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AgentRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          update: {
            args: Prisma.AgentRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          deleteMany: {
            args: Prisma.AgentRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgentRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          aggregate: {
            args: Prisma.AgentRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentRun>
          }
          groupBy: {
            args: Prisma.AgentRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentRunGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AgentRunFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AgentRunAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AgentRunCountArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCountAggregateOutputType> | number
          }
        }
      }
      AgentTrace: {
        payload: Prisma.$AgentTracePayload<ExtArgs>
        fields: Prisma.AgentTraceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentTraceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentTraceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          findFirst: {
            args: Prisma.AgentTraceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentTraceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          findMany: {
            args: Prisma.AgentTraceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>[]
          }
          create: {
            args: Prisma.AgentTraceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          createMany: {
            args: Prisma.AgentTraceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AgentTraceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          update: {
            args: Prisma.AgentTraceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          deleteMany: {
            args: Prisma.AgentTraceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentTraceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgentTraceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentTracePayload>
          }
          aggregate: {
            args: Prisma.AgentTraceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentTrace>
          }
          groupBy: {
            args: Prisma.AgentTraceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentTraceGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AgentTraceFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AgentTraceAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AgentTraceCountArgs<ExtArgs>
            result: $Utils.Optional<AgentTraceCountAggregateOutputType> | number
          }
        }
      }
      CaseRecord: {
        payload: Prisma.$CaseRecordPayload<ExtArgs>
        fields: Prisma.CaseRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CaseRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CaseRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          findFirst: {
            args: Prisma.CaseRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CaseRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          findMany: {
            args: Prisma.CaseRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>[]
          }
          create: {
            args: Prisma.CaseRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          createMany: {
            args: Prisma.CaseRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CaseRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          update: {
            args: Prisma.CaseRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          deleteMany: {
            args: Prisma.CaseRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CaseRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CaseRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseRecordPayload>
          }
          aggregate: {
            args: Prisma.CaseRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCaseRecord>
          }
          groupBy: {
            args: Prisma.CaseRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<CaseRecordGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.CaseRecordFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.CaseRecordAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.CaseRecordCountArgs<ExtArgs>
            result: $Utils.Optional<CaseRecordCountAggregateOutputType> | number
          }
        }
      }
      RefundTransaction: {
        payload: Prisma.$RefundTransactionPayload<ExtArgs>
        fields: Prisma.RefundTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RefundTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RefundTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          findFirst: {
            args: Prisma.RefundTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RefundTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          findMany: {
            args: Prisma.RefundTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>[]
          }
          create: {
            args: Prisma.RefundTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          createMany: {
            args: Prisma.RefundTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.RefundTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          update: {
            args: Prisma.RefundTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          deleteMany: {
            args: Prisma.RefundTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RefundTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RefundTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefundTransactionPayload>
          }
          aggregate: {
            args: Prisma.RefundTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRefundTransaction>
          }
          groupBy: {
            args: Prisma.RefundTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RefundTransactionGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.RefundTransactionFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.RefundTransactionAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.RefundTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<RefundTransactionCountAggregateOutputType> | number
          }
        }
      }
      Coupon: {
        payload: Prisma.$CouponPayload<ExtArgs>
        fields: Prisma.CouponFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CouponFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CouponFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          findFirst: {
            args: Prisma.CouponFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CouponFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          findMany: {
            args: Prisma.CouponFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>[]
          }
          create: {
            args: Prisma.CouponCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          createMany: {
            args: Prisma.CouponCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CouponDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          update: {
            args: Prisma.CouponUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          deleteMany: {
            args: Prisma.CouponDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CouponUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CouponUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponPayload>
          }
          aggregate: {
            args: Prisma.CouponAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoupon>
          }
          groupBy: {
            args: Prisma.CouponGroupByArgs<ExtArgs>
            result: $Utils.Optional<CouponGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.CouponFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.CouponAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.CouponCountArgs<ExtArgs>
            result: $Utils.Optional<CouponCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.NotificationFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.NotificationAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      ExecutionJob: {
        payload: Prisma.$ExecutionJobPayload<ExtArgs>
        fields: Prisma.ExecutionJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExecutionJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExecutionJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          findFirst: {
            args: Prisma.ExecutionJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExecutionJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          findMany: {
            args: Prisma.ExecutionJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>[]
          }
          create: {
            args: Prisma.ExecutionJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          createMany: {
            args: Prisma.ExecutionJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ExecutionJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          update: {
            args: Prisma.ExecutionJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          deleteMany: {
            args: Prisma.ExecutionJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExecutionJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExecutionJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionJobPayload>
          }
          aggregate: {
            args: Prisma.ExecutionJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExecutionJob>
          }
          groupBy: {
            args: Prisma.ExecutionJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExecutionJobGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ExecutionJobFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ExecutionJobAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ExecutionJobCountArgs<ExtArgs>
            result: $Utils.Optional<ExecutionJobCountAggregateOutputType> | number
          }
        }
      }
      MetricSnapshot: {
        payload: Prisma.$MetricSnapshotPayload<ExtArgs>
        fields: Prisma.MetricSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MetricSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MetricSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          findFirst: {
            args: Prisma.MetricSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MetricSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          findMany: {
            args: Prisma.MetricSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>[]
          }
          create: {
            args: Prisma.MetricSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          createMany: {
            args: Prisma.MetricSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MetricSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          update: {
            args: Prisma.MetricSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.MetricSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MetricSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MetricSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricSnapshotPayload>
          }
          aggregate: {
            args: Prisma.MetricSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMetricSnapshot>
          }
          groupBy: {
            args: Prisma.MetricSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<MetricSnapshotGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.MetricSnapshotFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.MetricSnapshotAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.MetricSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<MetricSnapshotCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AuditLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AuditLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    customer?: CustomerOmit
    product?: ProductOmit
    order?: OrderOmit
    orderItem?: OrderItemOmit
    ticket?: TicketOmit
    policyVersion?: PolicyVersionOmit
    agentRun?: AgentRunOmit
    agentTrace?: AgentTraceOmit
    caseRecord?: CaseRecordOmit
    refundTransaction?: RefundTransactionOmit
    coupon?: CouponOmit
    notification?: NotificationOmit
    executionJob?: ExecutionJobOmit
    metricSnapshot?: MetricSnapshotOmit
    auditLog?: AuditLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    orders: number
    tickets: number
    coupons: number
    notifications: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | CustomerCountOutputTypeCountOrdersArgs
    tickets?: boolean | CustomerCountOutputTypeCountTicketsArgs
    coupons?: boolean | CustomerCountOutputTypeCountCouponsArgs
    notifications?: boolean | CustomerCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountCouponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CouponWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    orderItems: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | ProductCountOutputTypeCountOrderItemsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    items: number
    tickets: number
    refunds: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | OrderCountOutputTypeCountItemsArgs
    tickets?: boolean | OrderCountOutputTypeCountTicketsArgs
    refunds?: boolean | OrderCountOutputTypeCountRefundsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountRefundsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefundTransactionWhereInput
  }


  /**
   * Count Type TicketCountOutputType
   */

  export type TicketCountOutputType = {
    agentRuns: number
    traces: number
    caseRecords: number
  }

  export type TicketCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agentRuns?: boolean | TicketCountOutputTypeCountAgentRunsArgs
    traces?: boolean | TicketCountOutputTypeCountTracesArgs
    caseRecords?: boolean | TicketCountOutputTypeCountCaseRecordsArgs
  }

  // Custom InputTypes
  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketCountOutputType
     */
    select?: TicketCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeCountAgentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
  }

  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeCountTracesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentTraceWhereInput
  }

  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeCountCaseRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaseRecordWhereInput
  }


  /**
   * Count Type AgentRunCountOutputType
   */

  export type AgentRunCountOutputType = {
    traces: number
  }

  export type AgentRunCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    traces?: boolean | AgentRunCountOutputTypeCountTracesArgs
  }

  // Custom InputTypes
  /**
   * AgentRunCountOutputType without action
   */
  export type AgentRunCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCountOutputType
     */
    select?: AgentRunCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AgentRunCountOutputType without action
   */
  export type AgentRunCountOutputTypeCountTracesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentTraceWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerAvgAggregateOutputType = {
    riskScore: number | null
  }

  export type CustomerSumAggregateOutputType = {
    riskScore: number | null
  }

  export type CustomerMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    tier: string | null
    riskScore: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    tier: string | null
    riskScore: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    email: number
    tier: number
    riskScore: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomerAvgAggregateInputType = {
    riskScore?: true
  }

  export type CustomerSumAggregateInputType = {
    riskScore?: true
  }

  export type CustomerMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    tier?: true
    riskScore?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    tier?: true
    riskScore?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    tier?: true
    riskScore?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _avg?: CustomerAvgAggregateInputType
    _sum?: CustomerSumAggregateInputType
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    email: string
    tier: string
    riskScore: number
    createdAt: Date
    updatedAt: Date
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    tier?: boolean
    riskScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orders?: boolean | Customer$ordersArgs<ExtArgs>
    tickets?: boolean | Customer$ticketsArgs<ExtArgs>
    coupons?: boolean | Customer$couponsArgs<ExtArgs>
    notifications?: boolean | Customer$notificationsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>



  export type CustomerSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    tier?: boolean
    riskScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "email" | "tier" | "riskScore" | "createdAt" | "updatedAt", ExtArgs["result"]["customer"]>
  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | Customer$ordersArgs<ExtArgs>
    tickets?: boolean | Customer$ticketsArgs<ExtArgs>
    coupons?: boolean | Customer$couponsArgs<ExtArgs>
    notifications?: boolean | Customer$notificationsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      orders: Prisma.$OrderPayload<ExtArgs>[]
      tickets: Prisma.$TicketPayload<ExtArgs>[]
      coupons: Prisma.$CouponPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      email: string
      tier: string
      riskScore: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Customers that matches the filter.
     * @param {CustomerFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const customer = await prisma.customer.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: CustomerFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Customer.
     * @param {CustomerAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const customer = await prisma.customer.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: CustomerAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orders<T extends Customer$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Customer$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    tickets<T extends Customer$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    coupons<T extends Customer$couponsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$couponsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    notifications<T extends Customer$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */ 
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'String'>
    readonly tenantId: FieldRef<"Customer", 'String'>
    readonly name: FieldRef<"Customer", 'String'>
    readonly email: FieldRef<"Customer", 'String'>
    readonly tier: FieldRef<"Customer", 'String'>
    readonly riskScore: FieldRef<"Customer", 'Float'>
    readonly createdAt: FieldRef<"Customer", 'DateTime'>
    readonly updatedAt: FieldRef<"Customer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to delete.
     */
    limit?: number
  }

  /**
   * Customer findRaw
   */
  export type CustomerFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Customer aggregateRaw
   */
  export type CustomerAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Customer.orders
   */
  export type Customer$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Customer.tickets
   */
  export type Customer$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    cursor?: TicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Customer.coupons
   */
  export type Customer$couponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    where?: CouponWhereInput
    orderBy?: CouponOrderByWithRelationInput | CouponOrderByWithRelationInput[]
    cursor?: CouponWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CouponScalarFieldEnum | CouponScalarFieldEnum[]
  }

  /**
   * Customer.notifications
   */
  export type Customer$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    price: number | null
    stockQuantity: number | null
  }

  export type ProductSumAggregateOutputType = {
    price: number | null
    stockQuantity: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    price: number | null
    stockQuantity: number | null
    replacementEligible: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    price: number | null
    stockQuantity: number | null
    replacementEligible: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    category: number
    price: number
    stockQuantity: number
    replacementEligible: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    price?: true
    stockQuantity?: true
  }

  export type ProductSumAggregateInputType = {
    price?: true
    stockQuantity?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    price?: true
    stockQuantity?: true
    replacementEligible?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    price?: true
    stockQuantity?: true
    replacementEligible?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    price?: true
    stockQuantity?: true
    replacementEligible?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity: number
    replacementEligible: boolean
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    price?: boolean
    stockQuantity?: boolean
    replacementEligible?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orderItems?: boolean | Product$orderItemsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>



  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    price?: boolean
    stockQuantity?: boolean
    replacementEligible?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "category" | "price" | "stockQuantity" | "replacementEligible" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | Product$orderItemsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: string
      price: number
      stockQuantity: number
      replacementEligible: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Products that matches the filter.
     * @param {ProductFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const product = await prisma.product.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ProductFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Product.
     * @param {ProductAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const product = await prisma.product.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ProductAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItems<T extends Product$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */ 
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly category: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Float'>
    readonly stockQuantity: FieldRef<"Product", 'Int'>
    readonly replacementEligible: FieldRef<"Product", 'Boolean'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product findRaw
   */
  export type ProductFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Product aggregateRaw
   */
  export type ProductAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Product.orderItems
   */
  export type Product$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    totalAmount: number | null
  }

  export type OrderSumAggregateOutputType = {
    totalAmount: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    status: string | null
    totalAmount: number | null
    currency: string | null
    deliveryDate: Date | null
    shippingStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    status: string | null
    totalAmount: number | null
    currency: string | null
    deliveryDate: Date | null
    shippingStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    tenantId: number
    customerId: number
    status: number
    totalAmount: number
    currency: number
    deliveryDate: number
    shippingStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    totalAmount?: true
  }

  export type OrderSumAggregateInputType = {
    totalAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    status?: true
    totalAmount?: true
    currency?: true
    deliveryDate?: true
    shippingStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    status?: true
    totalAmount?: true
    currency?: true
    deliveryDate?: true
    shippingStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    status?: true
    totalAmount?: true
    currency?: true
    deliveryDate?: true
    shippingStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    tenantId: string
    customerId: string
    status: string
    totalAmount: number
    currency: string
    deliveryDate: Date | null
    shippingStatus: string
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    status?: boolean
    totalAmount?: boolean
    currency?: boolean
    deliveryDate?: boolean
    shippingStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    items?: boolean | Order$itemsArgs<ExtArgs>
    tickets?: boolean | Order$ticketsArgs<ExtArgs>
    refunds?: boolean | Order$refundsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>



  export type OrderSelectScalar = {
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    status?: boolean
    totalAmount?: boolean
    currency?: boolean
    deliveryDate?: boolean
    shippingStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "customerId" | "status" | "totalAmount" | "currency" | "deliveryDate" | "shippingStatus" | "createdAt" | "updatedAt", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    items?: boolean | Order$itemsArgs<ExtArgs>
    tickets?: boolean | Order$ticketsArgs<ExtArgs>
    refunds?: boolean | Order$refundsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
      items: Prisma.$OrderItemPayload<ExtArgs>[]
      tickets: Prisma.$TicketPayload<ExtArgs>[]
      refunds: Prisma.$RefundTransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      customerId: string
      status: string
      totalAmount: number
      currency: string
      deliveryDate: Date | null
      shippingStatus: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * @param {OrderFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const order = await prisma.order.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: OrderFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Order.
     * @param {OrderAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const order = await prisma.order.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: OrderAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    items<T extends Order$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Order$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    tickets<T extends Order$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, Order$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    refunds<T extends Order$refundsArgs<ExtArgs> = {}>(args?: Subset<T, Order$refundsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */ 
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly tenantId: FieldRef<"Order", 'String'>
    readonly customerId: FieldRef<"Order", 'String'>
    readonly status: FieldRef<"Order", 'String'>
    readonly totalAmount: FieldRef<"Order", 'Float'>
    readonly currency: FieldRef<"Order", 'String'>
    readonly deliveryDate: FieldRef<"Order", 'DateTime'>
    readonly shippingStatus: FieldRef<"Order", 'String'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order findRaw
   */
  export type OrderFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Order aggregateRaw
   */
  export type OrderAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Order.items
   */
  export type Order$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Order.tickets
   */
  export type Order$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    cursor?: TicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Order.refunds
   */
  export type Order$refundsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    where?: RefundTransactionWhereInput
    orderBy?: RefundTransactionOrderByWithRelationInput | RefundTransactionOrderByWithRelationInput[]
    cursor?: RefundTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RefundTransactionScalarFieldEnum | RefundTransactionScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderItem
   */

  export type AggregateOrderItem = {
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  export type OrderItemAvgAggregateOutputType = {
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemSumAggregateOutputType = {
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemCountAggregateOutputType = {
    id: number
    orderId: number
    productId: number
    quantity: number
    unitPrice: number
    _all: number
  }


  export type OrderItemAvgAggregateInputType = {
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemSumAggregateInputType = {
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemMinAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemMaxAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemCountAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    quantity?: true
    unitPrice?: true
    _all?: true
  }

  export type OrderItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItem to aggregate.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderItems
    **/
    _count?: true | OrderItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderItemMaxAggregateInputType
  }

  export type GetOrderItemAggregateType<T extends OrderItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderItem[P]>
      : GetScalarType<T[P], AggregateOrderItem[P]>
  }




  export type OrderItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithAggregationInput | OrderItemOrderByWithAggregationInput[]
    by: OrderItemScalarFieldEnum[] | OrderItemScalarFieldEnum
    having?: OrderItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderItemCountAggregateInputType | true
    _avg?: OrderItemAvgAggregateInputType
    _sum?: OrderItemSumAggregateInputType
    _min?: OrderItemMinAggregateInputType
    _max?: OrderItemMaxAggregateInputType
  }

  export type OrderItemGroupByOutputType = {
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: number
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  type GetOrderItemGroupByPayload<T extends OrderItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    quantity?: boolean
    unitPrice?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>



  export type OrderItemSelectScalar = {
    id?: boolean
    orderId?: boolean
    productId?: boolean
    quantity?: boolean
    unitPrice?: boolean
  }

  export type OrderItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderId" | "productId" | "quantity" | "unitPrice", ExtArgs["result"]["orderItem"]>
  export type OrderItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $OrderItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderItem"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      productId: string
      quantity: number
      unitPrice: number
    }, ExtArgs["result"]["orderItem"]>
    composites: {}
  }

  type OrderItemGetPayload<S extends boolean | null | undefined | OrderItemDefaultArgs> = $Result.GetResult<Prisma.$OrderItemPayload, S>

  type OrderItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderItemCountAggregateInputType | true
    }

  export interface OrderItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderItem'], meta: { name: 'OrderItem' } }
    /**
     * Find zero or one OrderItem that matches the filter.
     * @param {OrderItemFindUniqueArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderItemFindUniqueArgs>(args: SelectSubset<T, OrderItemFindUniqueArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one OrderItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderItemFindUniqueOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first OrderItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderItemFindFirstArgs>(args?: SelectSubset<T, OrderItemFindFirstArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first OrderItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more OrderItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderItems
     * const orderItems = await prisma.orderItem.findMany()
     * 
     * // Get first 10 OrderItems
     * const orderItems = await prisma.orderItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderItemFindManyArgs>(args?: SelectSubset<T, OrderItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a OrderItem.
     * @param {OrderItemCreateArgs} args - Arguments to create a OrderItem.
     * @example
     * // Create one OrderItem
     * const OrderItem = await prisma.orderItem.create({
     *   data: {
     *     // ... data to create a OrderItem
     *   }
     * })
     * 
     */
    create<T extends OrderItemCreateArgs>(args: SelectSubset<T, OrderItemCreateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many OrderItems.
     * @param {OrderItemCreateManyArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderItemCreateManyArgs>(args?: SelectSubset<T, OrderItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OrderItem.
     * @param {OrderItemDeleteArgs} args - Arguments to delete one OrderItem.
     * @example
     * // Delete one OrderItem
     * const OrderItem = await prisma.orderItem.delete({
     *   where: {
     *     // ... filter to delete one OrderItem
     *   }
     * })
     * 
     */
    delete<T extends OrderItemDeleteArgs>(args: SelectSubset<T, OrderItemDeleteArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one OrderItem.
     * @param {OrderItemUpdateArgs} args - Arguments to update one OrderItem.
     * @example
     * // Update one OrderItem
     * const orderItem = await prisma.orderItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderItemUpdateArgs>(args: SelectSubset<T, OrderItemUpdateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more OrderItems.
     * @param {OrderItemDeleteManyArgs} args - Arguments to filter OrderItems to delete.
     * @example
     * // Delete a few OrderItems
     * const { count } = await prisma.orderItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderItemDeleteManyArgs>(args?: SelectSubset<T, OrderItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderItemUpdateManyArgs>(args: SelectSubset<T, OrderItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrderItem.
     * @param {OrderItemUpsertArgs} args - Arguments to update or create a OrderItem.
     * @example
     * // Update or create a OrderItem
     * const orderItem = await prisma.orderItem.upsert({
     *   create: {
     *     // ... data to create a OrderItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderItemUpsertArgs>(args: SelectSubset<T, OrderItemUpsertArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more OrderItems that matches the filter.
     * @param {OrderItemFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const orderItem = await prisma.orderItem.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: OrderItemFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a OrderItem.
     * @param {OrderItemAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const orderItem = await prisma.orderItem.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: OrderItemAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemCountArgs} args - Arguments to filter OrderItems to count.
     * @example
     * // Count the number of OrderItems
     * const count = await prisma.orderItem.count({
     *   where: {
     *     // ... the filter for the OrderItems we want to count
     *   }
     * })
    **/
    count<T extends OrderItemCountArgs>(
      args?: Subset<T, OrderItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderItemAggregateArgs>(args: Subset<T, OrderItemAggregateArgs>): Prisma.PrismaPromise<GetOrderItemAggregateType<T>>

    /**
     * Group by OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderItem model
   */
  readonly fields: OrderItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrderItem model
   */ 
  interface OrderItemFieldRefs {
    readonly id: FieldRef<"OrderItem", 'String'>
    readonly orderId: FieldRef<"OrderItem", 'String'>
    readonly productId: FieldRef<"OrderItem", 'String'>
    readonly quantity: FieldRef<"OrderItem", 'Int'>
    readonly unitPrice: FieldRef<"OrderItem", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * OrderItem findUnique
   */
  export type OrderItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findUniqueOrThrow
   */
  export type OrderItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findFirst
   */
  export type OrderItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findFirstOrThrow
   */
  export type OrderItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findMany
   */
  export type OrderItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItems to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem create
   */
  export type OrderItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderItem.
     */
    data: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
  }

  /**
   * OrderItem createMany
   */
  export type OrderItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
  }

  /**
   * OrderItem update
   */
  export type OrderItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderItem.
     */
    data: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
    /**
     * Choose, which OrderItem to update.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem updateMany
   */
  export type OrderItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to update.
     */
    limit?: number
  }

  /**
   * OrderItem upsert
   */
  export type OrderItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderItem to update in case it exists.
     */
    where: OrderItemWhereUniqueInput
    /**
     * In case the OrderItem found by the `where` argument doesn't exist, create a new OrderItem with this data.
     */
    create: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
    /**
     * In case the OrderItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
  }

  /**
   * OrderItem delete
   */
  export type OrderItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter which OrderItem to delete.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem deleteMany
   */
  export type OrderItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItems to delete
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to delete.
     */
    limit?: number
  }

  /**
   * OrderItem findRaw
   */
  export type OrderItemFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * OrderItem aggregateRaw
   */
  export type OrderItemAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * OrderItem without action
   */
  export type OrderItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
  }


  /**
   * Model Ticket
   */

  export type AggregateTicket = {
    _count: TicketCountAggregateOutputType | null
    _avg: TicketAvgAggregateOutputType | null
    _sum: TicketSumAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  export type TicketAvgAggregateOutputType = {
    refundAmount: number | null
  }

  export type TicketSumAggregateOutputType = {
    refundAmount: number | null
  }

  export type TicketMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    orderId: string | null
    issueType: string | null
    customerMessage: string | null
    status: string | null
    resolutionSummary: string | null
    refundAmount: number | null
    replacementSku: string | null
    requiresApproval: boolean | null
    requiresConsent: boolean | null
    approvalStatus: string | null
    consentStatus: string | null
    approvalToken: string | null
    idempotencyKey: string | null
    resolvedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TicketMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    orderId: string | null
    issueType: string | null
    customerMessage: string | null
    status: string | null
    resolutionSummary: string | null
    refundAmount: number | null
    replacementSku: string | null
    requiresApproval: boolean | null
    requiresConsent: boolean | null
    approvalStatus: string | null
    consentStatus: string | null
    approvalToken: string | null
    idempotencyKey: string | null
    resolvedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TicketCountAggregateOutputType = {
    id: number
    tenantId: number
    customerId: number
    orderId: number
    issueType: number
    customerMessage: number
    status: number
    resolutionSummary: number
    refundAmount: number
    replacementSku: number
    requiresApproval: number
    requiresConsent: number
    approvalStatus: number
    consentStatus: number
    approvalToken: number
    idempotencyKey: number
    resolvedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TicketAvgAggregateInputType = {
    refundAmount?: true
  }

  export type TicketSumAggregateInputType = {
    refundAmount?: true
  }

  export type TicketMinAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    orderId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    refundAmount?: true
    replacementSku?: true
    requiresApproval?: true
    requiresConsent?: true
    approvalStatus?: true
    consentStatus?: true
    approvalToken?: true
    idempotencyKey?: true
    resolvedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TicketMaxAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    orderId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    refundAmount?: true
    replacementSku?: true
    requiresApproval?: true
    requiresConsent?: true
    approvalStatus?: true
    consentStatus?: true
    approvalToken?: true
    idempotencyKey?: true
    resolvedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TicketCountAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    orderId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    refundAmount?: true
    replacementSku?: true
    requiresApproval?: true
    requiresConsent?: true
    approvalStatus?: true
    consentStatus?: true
    approvalToken?: true
    idempotencyKey?: true
    resolvedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TicketAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ticket to aggregate.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tickets
    **/
    _count?: true | TicketCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TicketAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TicketSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TicketMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TicketMaxAggregateInputType
  }

  export type GetTicketAggregateType<T extends TicketAggregateArgs> = {
        [P in keyof T & keyof AggregateTicket]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTicket[P]>
      : GetScalarType<T[P], AggregateTicket[P]>
  }




  export type TicketGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithAggregationInput | TicketOrderByWithAggregationInput[]
    by: TicketScalarFieldEnum[] | TicketScalarFieldEnum
    having?: TicketScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TicketCountAggregateInputType | true
    _avg?: TicketAvgAggregateInputType
    _sum?: TicketSumAggregateInputType
    _min?: TicketMinAggregateInputType
    _max?: TicketMaxAggregateInputType
  }

  export type TicketGroupByOutputType = {
    id: string
    tenantId: string
    customerId: string
    orderId: string | null
    issueType: string
    customerMessage: string
    status: string
    resolutionSummary: string | null
    refundAmount: number | null
    replacementSku: string | null
    requiresApproval: boolean
    requiresConsent: boolean
    approvalStatus: string | null
    consentStatus: string | null
    approvalToken: string | null
    idempotencyKey: string | null
    resolvedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: TicketCountAggregateOutputType | null
    _avg: TicketAvgAggregateOutputType | null
    _sum: TicketSumAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  type GetTicketGroupByPayload<T extends TicketGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TicketGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TicketGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TicketGroupByOutputType[P]>
            : GetScalarType<T[P], TicketGroupByOutputType[P]>
        }
      >
    >


  export type TicketSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    orderId?: boolean
    issueType?: boolean
    customerMessage?: boolean
    status?: boolean
    resolutionSummary?: boolean
    refundAmount?: boolean
    replacementSku?: boolean
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: boolean
    consentStatus?: boolean
    approvalToken?: boolean
    idempotencyKey?: boolean
    resolvedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    order?: boolean | Ticket$orderArgs<ExtArgs>
    agentRuns?: boolean | Ticket$agentRunsArgs<ExtArgs>
    traces?: boolean | Ticket$tracesArgs<ExtArgs>
    caseRecords?: boolean | Ticket$caseRecordsArgs<ExtArgs>
    _count?: boolean | TicketCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>



  export type TicketSelectScalar = {
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    orderId?: boolean
    issueType?: boolean
    customerMessage?: boolean
    status?: boolean
    resolutionSummary?: boolean
    refundAmount?: boolean
    replacementSku?: boolean
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: boolean
    consentStatus?: boolean
    approvalToken?: boolean
    idempotencyKey?: boolean
    resolvedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TicketOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "customerId" | "orderId" | "issueType" | "customerMessage" | "status" | "resolutionSummary" | "refundAmount" | "replacementSku" | "requiresApproval" | "requiresConsent" | "approvalStatus" | "consentStatus" | "approvalToken" | "idempotencyKey" | "resolvedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["ticket"]>
  export type TicketInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    order?: boolean | Ticket$orderArgs<ExtArgs>
    agentRuns?: boolean | Ticket$agentRunsArgs<ExtArgs>
    traces?: boolean | Ticket$tracesArgs<ExtArgs>
    caseRecords?: boolean | Ticket$caseRecordsArgs<ExtArgs>
    _count?: boolean | TicketCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $TicketPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ticket"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
      order: Prisma.$OrderPayload<ExtArgs> | null
      agentRuns: Prisma.$AgentRunPayload<ExtArgs>[]
      traces: Prisma.$AgentTracePayload<ExtArgs>[]
      caseRecords: Prisma.$CaseRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      customerId: string
      orderId: string | null
      issueType: string
      customerMessage: string
      status: string
      resolutionSummary: string | null
      refundAmount: number | null
      replacementSku: string | null
      requiresApproval: boolean
      requiresConsent: boolean
      approvalStatus: string | null
      consentStatus: string | null
      approvalToken: string | null
      idempotencyKey: string | null
      resolvedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ticket"]>
    composites: {}
  }

  type TicketGetPayload<S extends boolean | null | undefined | TicketDefaultArgs> = $Result.GetResult<Prisma.$TicketPayload, S>

  type TicketCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TicketFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TicketCountAggregateInputType | true
    }

  export interface TicketDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ticket'], meta: { name: 'Ticket' } }
    /**
     * Find zero or one Ticket that matches the filter.
     * @param {TicketFindUniqueArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TicketFindUniqueArgs>(args: SelectSubset<T, TicketFindUniqueArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Ticket that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TicketFindUniqueOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TicketFindUniqueOrThrowArgs>(args: SelectSubset<T, TicketFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Ticket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TicketFindFirstArgs>(args?: SelectSubset<T, TicketFindFirstArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Ticket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TicketFindFirstOrThrowArgs>(args?: SelectSubset<T, TicketFindFirstOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Tickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tickets
     * const tickets = await prisma.ticket.findMany()
     * 
     * // Get first 10 Tickets
     * const tickets = await prisma.ticket.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ticketWithIdOnly = await prisma.ticket.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TicketFindManyArgs>(args?: SelectSubset<T, TicketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Ticket.
     * @param {TicketCreateArgs} args - Arguments to create a Ticket.
     * @example
     * // Create one Ticket
     * const Ticket = await prisma.ticket.create({
     *   data: {
     *     // ... data to create a Ticket
     *   }
     * })
     * 
     */
    create<T extends TicketCreateArgs>(args: SelectSubset<T, TicketCreateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Tickets.
     * @param {TicketCreateManyArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const ticket = await prisma.ticket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TicketCreateManyArgs>(args?: SelectSubset<T, TicketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ticket.
     * @param {TicketDeleteArgs} args - Arguments to delete one Ticket.
     * @example
     * // Delete one Ticket
     * const Ticket = await prisma.ticket.delete({
     *   where: {
     *     // ... filter to delete one Ticket
     *   }
     * })
     * 
     */
    delete<T extends TicketDeleteArgs>(args: SelectSubset<T, TicketDeleteArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Ticket.
     * @param {TicketUpdateArgs} args - Arguments to update one Ticket.
     * @example
     * // Update one Ticket
     * const ticket = await prisma.ticket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TicketUpdateArgs>(args: SelectSubset<T, TicketUpdateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Tickets.
     * @param {TicketDeleteManyArgs} args - Arguments to filter Tickets to delete.
     * @example
     * // Delete a few Tickets
     * const { count } = await prisma.ticket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TicketDeleteManyArgs>(args?: SelectSubset<T, TicketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tickets
     * const ticket = await prisma.ticket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TicketUpdateManyArgs>(args: SelectSubset<T, TicketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ticket.
     * @param {TicketUpsertArgs} args - Arguments to update or create a Ticket.
     * @example
     * // Update or create a Ticket
     * const ticket = await prisma.ticket.upsert({
     *   create: {
     *     // ... data to create a Ticket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ticket we want to update
     *   }
     * })
     */
    upsert<T extends TicketUpsertArgs>(args: SelectSubset<T, TicketUpsertArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Tickets that matches the filter.
     * @param {TicketFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const ticket = await prisma.ticket.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: TicketFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Ticket.
     * @param {TicketAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const ticket = await prisma.ticket.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: TicketAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketCountArgs} args - Arguments to filter Tickets to count.
     * @example
     * // Count the number of Tickets
     * const count = await prisma.ticket.count({
     *   where: {
     *     // ... the filter for the Tickets we want to count
     *   }
     * })
    **/
    count<T extends TicketCountArgs>(
      args?: Subset<T, TicketCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TicketCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TicketAggregateArgs>(args: Subset<T, TicketAggregateArgs>): Prisma.PrismaPromise<GetTicketAggregateType<T>>

    /**
     * Group by Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TicketGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TicketGroupByArgs['orderBy'] }
        : { orderBy?: TicketGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TicketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTicketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ticket model
   */
  readonly fields: TicketFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ticket.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TicketClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    order<T extends Ticket$orderArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$orderArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | null, null, ExtArgs, ClientOptions>
    agentRuns<T extends Ticket$agentRunsArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$agentRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    traces<T extends Ticket$tracesArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$tracesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    caseRecords<T extends Ticket$caseRecordsArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$caseRecordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ticket model
   */ 
  interface TicketFieldRefs {
    readonly id: FieldRef<"Ticket", 'String'>
    readonly tenantId: FieldRef<"Ticket", 'String'>
    readonly customerId: FieldRef<"Ticket", 'String'>
    readonly orderId: FieldRef<"Ticket", 'String'>
    readonly issueType: FieldRef<"Ticket", 'String'>
    readonly customerMessage: FieldRef<"Ticket", 'String'>
    readonly status: FieldRef<"Ticket", 'String'>
    readonly resolutionSummary: FieldRef<"Ticket", 'String'>
    readonly refundAmount: FieldRef<"Ticket", 'Float'>
    readonly replacementSku: FieldRef<"Ticket", 'String'>
    readonly requiresApproval: FieldRef<"Ticket", 'Boolean'>
    readonly requiresConsent: FieldRef<"Ticket", 'Boolean'>
    readonly approvalStatus: FieldRef<"Ticket", 'String'>
    readonly consentStatus: FieldRef<"Ticket", 'String'>
    readonly approvalToken: FieldRef<"Ticket", 'String'>
    readonly idempotencyKey: FieldRef<"Ticket", 'String'>
    readonly resolvedAt: FieldRef<"Ticket", 'DateTime'>
    readonly createdAt: FieldRef<"Ticket", 'DateTime'>
    readonly updatedAt: FieldRef<"Ticket", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Ticket findUnique
   */
  export type TicketFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findUniqueOrThrow
   */
  export type TicketFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findFirst
   */
  export type TicketFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findFirstOrThrow
   */
  export type TicketFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findMany
   */
  export type TicketFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Tickets to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket create
   */
  export type TicketCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to create a Ticket.
     */
    data: XOR<TicketCreateInput, TicketUncheckedCreateInput>
  }

  /**
   * Ticket createMany
   */
  export type TicketCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tickets.
     */
    data: TicketCreateManyInput | TicketCreateManyInput[]
  }

  /**
   * Ticket update
   */
  export type TicketUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to update a Ticket.
     */
    data: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
    /**
     * Choose, which Ticket to update.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket updateMany
   */
  export type TicketUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tickets.
     */
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyInput>
    /**
     * Filter which Tickets to update
     */
    where?: TicketWhereInput
    /**
     * Limit how many Tickets to update.
     */
    limit?: number
  }

  /**
   * Ticket upsert
   */
  export type TicketUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The filter to search for the Ticket to update in case it exists.
     */
    where: TicketWhereUniqueInput
    /**
     * In case the Ticket found by the `where` argument doesn't exist, create a new Ticket with this data.
     */
    create: XOR<TicketCreateInput, TicketUncheckedCreateInput>
    /**
     * In case the Ticket was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
  }

  /**
   * Ticket delete
   */
  export type TicketDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter which Ticket to delete.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket deleteMany
   */
  export type TicketDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tickets to delete
     */
    where?: TicketWhereInput
    /**
     * Limit how many Tickets to delete.
     */
    limit?: number
  }

  /**
   * Ticket findRaw
   */
  export type TicketFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Ticket aggregateRaw
   */
  export type TicketAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Ticket.order
   */
  export type Ticket$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
  }

  /**
   * Ticket.agentRuns
   */
  export type Ticket$agentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    cursor?: AgentRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * Ticket.traces
   */
  export type Ticket$tracesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    where?: AgentTraceWhereInput
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    cursor?: AgentTraceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentTraceScalarFieldEnum | AgentTraceScalarFieldEnum[]
  }

  /**
   * Ticket.caseRecords
   */
  export type Ticket$caseRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    where?: CaseRecordWhereInput
    orderBy?: CaseRecordOrderByWithRelationInput | CaseRecordOrderByWithRelationInput[]
    cursor?: CaseRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CaseRecordScalarFieldEnum | CaseRecordScalarFieldEnum[]
  }

  /**
   * Ticket without action
   */
  export type TicketDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
  }


  /**
   * Model PolicyVersion
   */

  export type AggregatePolicyVersion = {
    _count: PolicyVersionCountAggregateOutputType | null
    _avg: PolicyVersionAvgAggregateOutputType | null
    _sum: PolicyVersionSumAggregateOutputType | null
    _min: PolicyVersionMinAggregateOutputType | null
    _max: PolicyVersionMaxAggregateOutputType | null
  }

  export type PolicyVersionAvgAggregateOutputType = {
    version: number | null
  }

  export type PolicyVersionSumAggregateOutputType = {
    version: number | null
  }

  export type PolicyVersionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    policyId: string | null
    version: number | null
    rulesJson: string | null
    isActive: boolean | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PolicyVersionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    policyId: string | null
    version: number | null
    rulesJson: string | null
    isActive: boolean | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PolicyVersionCountAggregateOutputType = {
    id: number
    tenantId: number
    policyId: number
    version: number
    rulesJson: number
    isActive: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PolicyVersionAvgAggregateInputType = {
    version?: true
  }

  export type PolicyVersionSumAggregateInputType = {
    version?: true
  }

  export type PolicyVersionMinAggregateInputType = {
    id?: true
    tenantId?: true
    policyId?: true
    version?: true
    rulesJson?: true
    isActive?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PolicyVersionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    policyId?: true
    version?: true
    rulesJson?: true
    isActive?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PolicyVersionCountAggregateInputType = {
    id?: true
    tenantId?: true
    policyId?: true
    version?: true
    rulesJson?: true
    isActive?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PolicyVersionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyVersion to aggregate.
     */
    where?: PolicyVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PolicyVersions to fetch.
     */
    orderBy?: PolicyVersionOrderByWithRelationInput | PolicyVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PolicyVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PolicyVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PolicyVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PolicyVersions
    **/
    _count?: true | PolicyVersionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PolicyVersionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PolicyVersionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PolicyVersionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PolicyVersionMaxAggregateInputType
  }

  export type GetPolicyVersionAggregateType<T extends PolicyVersionAggregateArgs> = {
        [P in keyof T & keyof AggregatePolicyVersion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePolicyVersion[P]>
      : GetScalarType<T[P], AggregatePolicyVersion[P]>
  }




  export type PolicyVersionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyVersionWhereInput
    orderBy?: PolicyVersionOrderByWithAggregationInput | PolicyVersionOrderByWithAggregationInput[]
    by: PolicyVersionScalarFieldEnum[] | PolicyVersionScalarFieldEnum
    having?: PolicyVersionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PolicyVersionCountAggregateInputType | true
    _avg?: PolicyVersionAvgAggregateInputType
    _sum?: PolicyVersionSumAggregateInputType
    _min?: PolicyVersionMinAggregateInputType
    _max?: PolicyVersionMaxAggregateInputType
  }

  export type PolicyVersionGroupByOutputType = {
    id: string
    tenantId: string
    policyId: string
    version: number
    rulesJson: string
    isActive: boolean
    createdById: string
    createdAt: Date
    updatedAt: Date
    _count: PolicyVersionCountAggregateOutputType | null
    _avg: PolicyVersionAvgAggregateOutputType | null
    _sum: PolicyVersionSumAggregateOutputType | null
    _min: PolicyVersionMinAggregateOutputType | null
    _max: PolicyVersionMaxAggregateOutputType | null
  }

  type GetPolicyVersionGroupByPayload<T extends PolicyVersionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PolicyVersionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PolicyVersionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PolicyVersionGroupByOutputType[P]>
            : GetScalarType<T[P], PolicyVersionGroupByOutputType[P]>
        }
      >
    >


  export type PolicyVersionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    policyId?: boolean
    version?: boolean
    rulesJson?: boolean
    isActive?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["policyVersion"]>



  export type PolicyVersionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    policyId?: boolean
    version?: boolean
    rulesJson?: boolean
    isActive?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PolicyVersionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "policyId" | "version" | "rulesJson" | "isActive" | "createdById" | "createdAt" | "updatedAt", ExtArgs["result"]["policyVersion"]>

  export type $PolicyVersionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PolicyVersion"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      policyId: string
      version: number
      rulesJson: string
      isActive: boolean
      createdById: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["policyVersion"]>
    composites: {}
  }

  type PolicyVersionGetPayload<S extends boolean | null | undefined | PolicyVersionDefaultArgs> = $Result.GetResult<Prisma.$PolicyVersionPayload, S>

  type PolicyVersionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PolicyVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PolicyVersionCountAggregateInputType | true
    }

  export interface PolicyVersionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PolicyVersion'], meta: { name: 'PolicyVersion' } }
    /**
     * Find zero or one PolicyVersion that matches the filter.
     * @param {PolicyVersionFindUniqueArgs} args - Arguments to find a PolicyVersion
     * @example
     * // Get one PolicyVersion
     * const policyVersion = await prisma.policyVersion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PolicyVersionFindUniqueArgs>(args: SelectSubset<T, PolicyVersionFindUniqueArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one PolicyVersion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PolicyVersionFindUniqueOrThrowArgs} args - Arguments to find a PolicyVersion
     * @example
     * // Get one PolicyVersion
     * const policyVersion = await prisma.policyVersion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PolicyVersionFindUniqueOrThrowArgs>(args: SelectSubset<T, PolicyVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first PolicyVersion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionFindFirstArgs} args - Arguments to find a PolicyVersion
     * @example
     * // Get one PolicyVersion
     * const policyVersion = await prisma.policyVersion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PolicyVersionFindFirstArgs>(args?: SelectSubset<T, PolicyVersionFindFirstArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first PolicyVersion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionFindFirstOrThrowArgs} args - Arguments to find a PolicyVersion
     * @example
     * // Get one PolicyVersion
     * const policyVersion = await prisma.policyVersion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PolicyVersionFindFirstOrThrowArgs>(args?: SelectSubset<T, PolicyVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more PolicyVersions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PolicyVersions
     * const policyVersions = await prisma.policyVersion.findMany()
     * 
     * // Get first 10 PolicyVersions
     * const policyVersions = await prisma.policyVersion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const policyVersionWithIdOnly = await prisma.policyVersion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PolicyVersionFindManyArgs>(args?: SelectSubset<T, PolicyVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a PolicyVersion.
     * @param {PolicyVersionCreateArgs} args - Arguments to create a PolicyVersion.
     * @example
     * // Create one PolicyVersion
     * const PolicyVersion = await prisma.policyVersion.create({
     *   data: {
     *     // ... data to create a PolicyVersion
     *   }
     * })
     * 
     */
    create<T extends PolicyVersionCreateArgs>(args: SelectSubset<T, PolicyVersionCreateArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many PolicyVersions.
     * @param {PolicyVersionCreateManyArgs} args - Arguments to create many PolicyVersions.
     * @example
     * // Create many PolicyVersions
     * const policyVersion = await prisma.policyVersion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PolicyVersionCreateManyArgs>(args?: SelectSubset<T, PolicyVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PolicyVersion.
     * @param {PolicyVersionDeleteArgs} args - Arguments to delete one PolicyVersion.
     * @example
     * // Delete one PolicyVersion
     * const PolicyVersion = await prisma.policyVersion.delete({
     *   where: {
     *     // ... filter to delete one PolicyVersion
     *   }
     * })
     * 
     */
    delete<T extends PolicyVersionDeleteArgs>(args: SelectSubset<T, PolicyVersionDeleteArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one PolicyVersion.
     * @param {PolicyVersionUpdateArgs} args - Arguments to update one PolicyVersion.
     * @example
     * // Update one PolicyVersion
     * const policyVersion = await prisma.policyVersion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PolicyVersionUpdateArgs>(args: SelectSubset<T, PolicyVersionUpdateArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more PolicyVersions.
     * @param {PolicyVersionDeleteManyArgs} args - Arguments to filter PolicyVersions to delete.
     * @example
     * // Delete a few PolicyVersions
     * const { count } = await prisma.policyVersion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PolicyVersionDeleteManyArgs>(args?: SelectSubset<T, PolicyVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PolicyVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PolicyVersions
     * const policyVersion = await prisma.policyVersion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PolicyVersionUpdateManyArgs>(args: SelectSubset<T, PolicyVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PolicyVersion.
     * @param {PolicyVersionUpsertArgs} args - Arguments to update or create a PolicyVersion.
     * @example
     * // Update or create a PolicyVersion
     * const policyVersion = await prisma.policyVersion.upsert({
     *   create: {
     *     // ... data to create a PolicyVersion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PolicyVersion we want to update
     *   }
     * })
     */
    upsert<T extends PolicyVersionUpsertArgs>(args: SelectSubset<T, PolicyVersionUpsertArgs<ExtArgs>>): Prisma__PolicyVersionClient<$Result.GetResult<Prisma.$PolicyVersionPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more PolicyVersions that matches the filter.
     * @param {PolicyVersionFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const policyVersion = await prisma.policyVersion.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: PolicyVersionFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a PolicyVersion.
     * @param {PolicyVersionAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const policyVersion = await prisma.policyVersion.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: PolicyVersionAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of PolicyVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionCountArgs} args - Arguments to filter PolicyVersions to count.
     * @example
     * // Count the number of PolicyVersions
     * const count = await prisma.policyVersion.count({
     *   where: {
     *     // ... the filter for the PolicyVersions we want to count
     *   }
     * })
    **/
    count<T extends PolicyVersionCountArgs>(
      args?: Subset<T, PolicyVersionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PolicyVersionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PolicyVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PolicyVersionAggregateArgs>(args: Subset<T, PolicyVersionAggregateArgs>): Prisma.PrismaPromise<GetPolicyVersionAggregateType<T>>

    /**
     * Group by PolicyVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyVersionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PolicyVersionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PolicyVersionGroupByArgs['orderBy'] }
        : { orderBy?: PolicyVersionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PolicyVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPolicyVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PolicyVersion model
   */
  readonly fields: PolicyVersionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PolicyVersion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PolicyVersionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PolicyVersion model
   */ 
  interface PolicyVersionFieldRefs {
    readonly id: FieldRef<"PolicyVersion", 'String'>
    readonly tenantId: FieldRef<"PolicyVersion", 'String'>
    readonly policyId: FieldRef<"PolicyVersion", 'String'>
    readonly version: FieldRef<"PolicyVersion", 'Int'>
    readonly rulesJson: FieldRef<"PolicyVersion", 'String'>
    readonly isActive: FieldRef<"PolicyVersion", 'Boolean'>
    readonly createdById: FieldRef<"PolicyVersion", 'String'>
    readonly createdAt: FieldRef<"PolicyVersion", 'DateTime'>
    readonly updatedAt: FieldRef<"PolicyVersion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PolicyVersion findUnique
   */
  export type PolicyVersionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter, which PolicyVersion to fetch.
     */
    where: PolicyVersionWhereUniqueInput
  }

  /**
   * PolicyVersion findUniqueOrThrow
   */
  export type PolicyVersionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter, which PolicyVersion to fetch.
     */
    where: PolicyVersionWhereUniqueInput
  }

  /**
   * PolicyVersion findFirst
   */
  export type PolicyVersionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter, which PolicyVersion to fetch.
     */
    where?: PolicyVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PolicyVersions to fetch.
     */
    orderBy?: PolicyVersionOrderByWithRelationInput | PolicyVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PolicyVersions.
     */
    cursor?: PolicyVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PolicyVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PolicyVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PolicyVersions.
     */
    distinct?: PolicyVersionScalarFieldEnum | PolicyVersionScalarFieldEnum[]
  }

  /**
   * PolicyVersion findFirstOrThrow
   */
  export type PolicyVersionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter, which PolicyVersion to fetch.
     */
    where?: PolicyVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PolicyVersions to fetch.
     */
    orderBy?: PolicyVersionOrderByWithRelationInput | PolicyVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PolicyVersions.
     */
    cursor?: PolicyVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PolicyVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PolicyVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PolicyVersions.
     */
    distinct?: PolicyVersionScalarFieldEnum | PolicyVersionScalarFieldEnum[]
  }

  /**
   * PolicyVersion findMany
   */
  export type PolicyVersionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter, which PolicyVersions to fetch.
     */
    where?: PolicyVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PolicyVersions to fetch.
     */
    orderBy?: PolicyVersionOrderByWithRelationInput | PolicyVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PolicyVersions.
     */
    cursor?: PolicyVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PolicyVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PolicyVersions.
     */
    skip?: number
    distinct?: PolicyVersionScalarFieldEnum | PolicyVersionScalarFieldEnum[]
  }

  /**
   * PolicyVersion create
   */
  export type PolicyVersionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * The data needed to create a PolicyVersion.
     */
    data: XOR<PolicyVersionCreateInput, PolicyVersionUncheckedCreateInput>
  }

  /**
   * PolicyVersion createMany
   */
  export type PolicyVersionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PolicyVersions.
     */
    data: PolicyVersionCreateManyInput | PolicyVersionCreateManyInput[]
  }

  /**
   * PolicyVersion update
   */
  export type PolicyVersionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * The data needed to update a PolicyVersion.
     */
    data: XOR<PolicyVersionUpdateInput, PolicyVersionUncheckedUpdateInput>
    /**
     * Choose, which PolicyVersion to update.
     */
    where: PolicyVersionWhereUniqueInput
  }

  /**
   * PolicyVersion updateMany
   */
  export type PolicyVersionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PolicyVersions.
     */
    data: XOR<PolicyVersionUpdateManyMutationInput, PolicyVersionUncheckedUpdateManyInput>
    /**
     * Filter which PolicyVersions to update
     */
    where?: PolicyVersionWhereInput
    /**
     * Limit how many PolicyVersions to update.
     */
    limit?: number
  }

  /**
   * PolicyVersion upsert
   */
  export type PolicyVersionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * The filter to search for the PolicyVersion to update in case it exists.
     */
    where: PolicyVersionWhereUniqueInput
    /**
     * In case the PolicyVersion found by the `where` argument doesn't exist, create a new PolicyVersion with this data.
     */
    create: XOR<PolicyVersionCreateInput, PolicyVersionUncheckedCreateInput>
    /**
     * In case the PolicyVersion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PolicyVersionUpdateInput, PolicyVersionUncheckedUpdateInput>
  }

  /**
   * PolicyVersion delete
   */
  export type PolicyVersionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
    /**
     * Filter which PolicyVersion to delete.
     */
    where: PolicyVersionWhereUniqueInput
  }

  /**
   * PolicyVersion deleteMany
   */
  export type PolicyVersionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyVersions to delete
     */
    where?: PolicyVersionWhereInput
    /**
     * Limit how many PolicyVersions to delete.
     */
    limit?: number
  }

  /**
   * PolicyVersion findRaw
   */
  export type PolicyVersionFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PolicyVersion aggregateRaw
   */
  export type PolicyVersionAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PolicyVersion without action
   */
  export type PolicyVersionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyVersion
     */
    select?: PolicyVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyVersion
     */
    omit?: PolicyVersionOmit<ExtArgs> | null
  }


  /**
   * Model AgentRun
   */

  export type AggregateAgentRun = {
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  export type AgentRunAvgAggregateOutputType = {
    confidence: number | null
  }

  export type AgentRunSumAggregateOutputType = {
    confidence: number | null
  }

  export type AgentRunMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    ticketId: string | null
    status: string | null
    intent: string | null
    confidence: number | null
    executedTools: string | null
    overallOutcome: string | null
    idempotencyKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    ticketId: string | null
    status: string | null
    intent: string | null
    confidence: number | null
    executedTools: string | null
    overallOutcome: string | null
    idempotencyKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunCountAggregateOutputType = {
    id: number
    tenantId: number
    ticketId: number
    status: number
    intent: number
    confidence: number
    executedTools: number
    overallOutcome: number
    idempotencyKey: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AgentRunAvgAggregateInputType = {
    confidence?: true
  }

  export type AgentRunSumAggregateInputType = {
    confidence?: true
  }

  export type AgentRunMinAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    status?: true
    intent?: true
    confidence?: true
    executedTools?: true
    overallOutcome?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunMaxAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    status?: true
    intent?: true
    confidence?: true
    executedTools?: true
    overallOutcome?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunCountAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    status?: true
    intent?: true
    confidence?: true
    executedTools?: true
    overallOutcome?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AgentRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRun to aggregate.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentRuns
    **/
    _count?: true | AgentRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgentRunAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgentRunSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentRunMaxAggregateInputType
  }

  export type GetAgentRunAggregateType<T extends AgentRunAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentRun[P]>
      : GetScalarType<T[P], AggregateAgentRun[P]>
  }




  export type AgentRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithAggregationInput | AgentRunOrderByWithAggregationInput[]
    by: AgentRunScalarFieldEnum[] | AgentRunScalarFieldEnum
    having?: AgentRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentRunCountAggregateInputType | true
    _avg?: AgentRunAvgAggregateInputType
    _sum?: AgentRunSumAggregateInputType
    _min?: AgentRunMinAggregateInputType
    _max?: AgentRunMaxAggregateInputType
  }

  export type AgentRunGroupByOutputType = {
    id: string
    tenantId: string
    ticketId: string
    status: string
    intent: string | null
    confidence: number | null
    executedTools: string | null
    overallOutcome: string | null
    idempotencyKey: string | null
    createdAt: Date
    updatedAt: Date
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  type GetAgentRunGroupByPayload<T extends AgentRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
            : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
        }
      >
    >


  export type AgentRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    ticketId?: boolean
    status?: boolean
    intent?: boolean
    confidence?: boolean
    executedTools?: boolean
    overallOutcome?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
    traces?: boolean | AgentRun$tracesArgs<ExtArgs>
    _count?: boolean | AgentRunCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>



  export type AgentRunSelectScalar = {
    id?: boolean
    tenantId?: boolean
    ticketId?: boolean
    status?: boolean
    intent?: boolean
    confidence?: boolean
    executedTools?: boolean
    overallOutcome?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AgentRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "ticketId" | "status" | "intent" | "confidence" | "executedTools" | "overallOutcome" | "idempotencyKey" | "createdAt" | "updatedAt", ExtArgs["result"]["agentRun"]>
  export type AgentRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
    traces?: boolean | AgentRun$tracesArgs<ExtArgs>
    _count?: boolean | AgentRunCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $AgentRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentRun"
    objects: {
      ticket: Prisma.$TicketPayload<ExtArgs>
      traces: Prisma.$AgentTracePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      ticketId: string
      status: string
      intent: string | null
      confidence: number | null
      executedTools: string | null
      overallOutcome: string | null
      idempotencyKey: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["agentRun"]>
    composites: {}
  }

  type AgentRunGetPayload<S extends boolean | null | undefined | AgentRunDefaultArgs> = $Result.GetResult<Prisma.$AgentRunPayload, S>

  type AgentRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentRunCountAggregateInputType | true
    }

  export interface AgentRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentRun'], meta: { name: 'AgentRun' } }
    /**
     * Find zero or one AgentRun that matches the filter.
     * @param {AgentRunFindUniqueArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentRunFindUniqueArgs>(args: SelectSubset<T, AgentRunFindUniqueArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one AgentRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentRunFindUniqueOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentRunFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first AgentRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentRunFindFirstArgs>(args?: SelectSubset<T, AgentRunFindFirstArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first AgentRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentRunFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AgentRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentRuns
     * const agentRuns = await prisma.agentRun.findMany()
     * 
     * // Get first 10 AgentRuns
     * const agentRuns = await prisma.agentRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentRunFindManyArgs>(args?: SelectSubset<T, AgentRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a AgentRun.
     * @param {AgentRunCreateArgs} args - Arguments to create a AgentRun.
     * @example
     * // Create one AgentRun
     * const AgentRun = await prisma.agentRun.create({
     *   data: {
     *     // ... data to create a AgentRun
     *   }
     * })
     * 
     */
    create<T extends AgentRunCreateArgs>(args: SelectSubset<T, AgentRunCreateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many AgentRuns.
     * @param {AgentRunCreateManyArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentRunCreateManyArgs>(args?: SelectSubset<T, AgentRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AgentRun.
     * @param {AgentRunDeleteArgs} args - Arguments to delete one AgentRun.
     * @example
     * // Delete one AgentRun
     * const AgentRun = await prisma.agentRun.delete({
     *   where: {
     *     // ... filter to delete one AgentRun
     *   }
     * })
     * 
     */
    delete<T extends AgentRunDeleteArgs>(args: SelectSubset<T, AgentRunDeleteArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one AgentRun.
     * @param {AgentRunUpdateArgs} args - Arguments to update one AgentRun.
     * @example
     * // Update one AgentRun
     * const agentRun = await prisma.agentRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentRunUpdateArgs>(args: SelectSubset<T, AgentRunUpdateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more AgentRuns.
     * @param {AgentRunDeleteManyArgs} args - Arguments to filter AgentRuns to delete.
     * @example
     * // Delete a few AgentRuns
     * const { count } = await prisma.agentRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentRunDeleteManyArgs>(args?: SelectSubset<T, AgentRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentRunUpdateManyArgs>(args: SelectSubset<T, AgentRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AgentRun.
     * @param {AgentRunUpsertArgs} args - Arguments to update or create a AgentRun.
     * @example
     * // Update or create a AgentRun
     * const agentRun = await prisma.agentRun.upsert({
     *   create: {
     *     // ... data to create a AgentRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentRun we want to update
     *   }
     * })
     */
    upsert<T extends AgentRunUpsertArgs>(args: SelectSubset<T, AgentRunUpsertArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AgentRuns that matches the filter.
     * @param {AgentRunFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const agentRun = await prisma.agentRun.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AgentRunFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AgentRun.
     * @param {AgentRunAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const agentRun = await prisma.agentRun.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AgentRunAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCountArgs} args - Arguments to filter AgentRuns to count.
     * @example
     * // Count the number of AgentRuns
     * const count = await prisma.agentRun.count({
     *   where: {
     *     // ... the filter for the AgentRuns we want to count
     *   }
     * })
    **/
    count<T extends AgentRunCountArgs>(
      args?: Subset<T, AgentRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentRunAggregateArgs>(args: Subset<T, AgentRunAggregateArgs>): Prisma.PrismaPromise<GetAgentRunAggregateType<T>>

    /**
     * Group by AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentRunGroupByArgs['orderBy'] }
        : { orderBy?: AgentRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentRun model
   */
  readonly fields: AgentRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ticket<T extends TicketDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TicketDefaultArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    traces<T extends AgentRun$tracesArgs<ExtArgs> = {}>(args?: Subset<T, AgentRun$tracesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentRun model
   */ 
  interface AgentRunFieldRefs {
    readonly id: FieldRef<"AgentRun", 'String'>
    readonly tenantId: FieldRef<"AgentRun", 'String'>
    readonly ticketId: FieldRef<"AgentRun", 'String'>
    readonly status: FieldRef<"AgentRun", 'String'>
    readonly intent: FieldRef<"AgentRun", 'String'>
    readonly confidence: FieldRef<"AgentRun", 'Float'>
    readonly executedTools: FieldRef<"AgentRun", 'String'>
    readonly overallOutcome: FieldRef<"AgentRun", 'String'>
    readonly idempotencyKey: FieldRef<"AgentRun", 'String'>
    readonly createdAt: FieldRef<"AgentRun", 'DateTime'>
    readonly updatedAt: FieldRef<"AgentRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentRun findUnique
   */
  export type AgentRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findUniqueOrThrow
   */
  export type AgentRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findFirst
   */
  export type AgentRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findFirstOrThrow
   */
  export type AgentRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findMany
   */
  export type AgentRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRuns to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun create
   */
  export type AgentRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to create a AgentRun.
     */
    data: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
  }

  /**
   * AgentRun createMany
   */
  export type AgentRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
  }

  /**
   * AgentRun update
   */
  export type AgentRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to update a AgentRun.
     */
    data: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
    /**
     * Choose, which AgentRun to update.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun updateMany
   */
  export type AgentRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
  }

  /**
   * AgentRun upsert
   */
  export type AgentRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The filter to search for the AgentRun to update in case it exists.
     */
    where: AgentRunWhereUniqueInput
    /**
     * In case the AgentRun found by the `where` argument doesn't exist, create a new AgentRun with this data.
     */
    create: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
    /**
     * In case the AgentRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
  }

  /**
   * AgentRun delete
   */
  export type AgentRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter which AgentRun to delete.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun deleteMany
   */
  export type AgentRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRuns to delete
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to delete.
     */
    limit?: number
  }

  /**
   * AgentRun findRaw
   */
  export type AgentRunFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AgentRun aggregateRaw
   */
  export type AgentRunAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AgentRun.traces
   */
  export type AgentRun$tracesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    where?: AgentTraceWhereInput
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    cursor?: AgentTraceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentTraceScalarFieldEnum | AgentTraceScalarFieldEnum[]
  }

  /**
   * AgentRun without action
   */
  export type AgentRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
  }


  /**
   * Model AgentTrace
   */

  export type AggregateAgentTrace = {
    _count: AgentTraceCountAggregateOutputType | null
    _min: AgentTraceMinAggregateOutputType | null
    _max: AgentTraceMaxAggregateOutputType | null
  }

  export type AgentTraceMinAggregateOutputType = {
    id: string | null
    agentRunId: string | null
    ticketId: string | null
    step: string | null
    evidenceDetails: string | null
    actor: string | null
    timestamp: Date | null
  }

  export type AgentTraceMaxAggregateOutputType = {
    id: string | null
    agentRunId: string | null
    ticketId: string | null
    step: string | null
    evidenceDetails: string | null
    actor: string | null
    timestamp: Date | null
  }

  export type AgentTraceCountAggregateOutputType = {
    id: number
    agentRunId: number
    ticketId: number
    step: number
    evidenceDetails: number
    actor: number
    timestamp: number
    _all: number
  }


  export type AgentTraceMinAggregateInputType = {
    id?: true
    agentRunId?: true
    ticketId?: true
    step?: true
    evidenceDetails?: true
    actor?: true
    timestamp?: true
  }

  export type AgentTraceMaxAggregateInputType = {
    id?: true
    agentRunId?: true
    ticketId?: true
    step?: true
    evidenceDetails?: true
    actor?: true
    timestamp?: true
  }

  export type AgentTraceCountAggregateInputType = {
    id?: true
    agentRunId?: true
    ticketId?: true
    step?: true
    evidenceDetails?: true
    actor?: true
    timestamp?: true
    _all?: true
  }

  export type AgentTraceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentTrace to aggregate.
     */
    where?: AgentTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentTraces to fetch.
     */
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentTraces
    **/
    _count?: true | AgentTraceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentTraceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentTraceMaxAggregateInputType
  }

  export type GetAgentTraceAggregateType<T extends AgentTraceAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentTrace]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentTrace[P]>
      : GetScalarType<T[P], AggregateAgentTrace[P]>
  }




  export type AgentTraceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentTraceWhereInput
    orderBy?: AgentTraceOrderByWithAggregationInput | AgentTraceOrderByWithAggregationInput[]
    by: AgentTraceScalarFieldEnum[] | AgentTraceScalarFieldEnum
    having?: AgentTraceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentTraceCountAggregateInputType | true
    _min?: AgentTraceMinAggregateInputType
    _max?: AgentTraceMaxAggregateInputType
  }

  export type AgentTraceGroupByOutputType = {
    id: string
    agentRunId: string
    ticketId: string | null
    step: string
    evidenceDetails: string
    actor: string
    timestamp: Date
    _count: AgentTraceCountAggregateOutputType | null
    _min: AgentTraceMinAggregateOutputType | null
    _max: AgentTraceMaxAggregateOutputType | null
  }

  type GetAgentTraceGroupByPayload<T extends AgentTraceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentTraceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentTraceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentTraceGroupByOutputType[P]>
            : GetScalarType<T[P], AgentTraceGroupByOutputType[P]>
        }
      >
    >


  export type AgentTraceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentRunId?: boolean
    ticketId?: boolean
    step?: boolean
    evidenceDetails?: boolean
    actor?: boolean
    timestamp?: boolean
    agentRun?: boolean | AgentRunDefaultArgs<ExtArgs>
    ticket?: boolean | AgentTrace$ticketArgs<ExtArgs>
  }, ExtArgs["result"]["agentTrace"]>



  export type AgentTraceSelectScalar = {
    id?: boolean
    agentRunId?: boolean
    ticketId?: boolean
    step?: boolean
    evidenceDetails?: boolean
    actor?: boolean
    timestamp?: boolean
  }

  export type AgentTraceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "agentRunId" | "ticketId" | "step" | "evidenceDetails" | "actor" | "timestamp", ExtArgs["result"]["agentTrace"]>
  export type AgentTraceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agentRun?: boolean | AgentRunDefaultArgs<ExtArgs>
    ticket?: boolean | AgentTrace$ticketArgs<ExtArgs>
  }

  export type $AgentTracePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentTrace"
    objects: {
      agentRun: Prisma.$AgentRunPayload<ExtArgs>
      ticket: Prisma.$TicketPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      agentRunId: string
      ticketId: string | null
      step: string
      evidenceDetails: string
      actor: string
      timestamp: Date
    }, ExtArgs["result"]["agentTrace"]>
    composites: {}
  }

  type AgentTraceGetPayload<S extends boolean | null | undefined | AgentTraceDefaultArgs> = $Result.GetResult<Prisma.$AgentTracePayload, S>

  type AgentTraceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentTraceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentTraceCountAggregateInputType | true
    }

  export interface AgentTraceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentTrace'], meta: { name: 'AgentTrace' } }
    /**
     * Find zero or one AgentTrace that matches the filter.
     * @param {AgentTraceFindUniqueArgs} args - Arguments to find a AgentTrace
     * @example
     * // Get one AgentTrace
     * const agentTrace = await prisma.agentTrace.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentTraceFindUniqueArgs>(args: SelectSubset<T, AgentTraceFindUniqueArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one AgentTrace that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentTraceFindUniqueOrThrowArgs} args - Arguments to find a AgentTrace
     * @example
     * // Get one AgentTrace
     * const agentTrace = await prisma.agentTrace.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentTraceFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentTraceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first AgentTrace that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceFindFirstArgs} args - Arguments to find a AgentTrace
     * @example
     * // Get one AgentTrace
     * const agentTrace = await prisma.agentTrace.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentTraceFindFirstArgs>(args?: SelectSubset<T, AgentTraceFindFirstArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first AgentTrace that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceFindFirstOrThrowArgs} args - Arguments to find a AgentTrace
     * @example
     * // Get one AgentTrace
     * const agentTrace = await prisma.agentTrace.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentTraceFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentTraceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AgentTraces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentTraces
     * const agentTraces = await prisma.agentTrace.findMany()
     * 
     * // Get first 10 AgentTraces
     * const agentTraces = await prisma.agentTrace.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentTraceWithIdOnly = await prisma.agentTrace.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentTraceFindManyArgs>(args?: SelectSubset<T, AgentTraceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a AgentTrace.
     * @param {AgentTraceCreateArgs} args - Arguments to create a AgentTrace.
     * @example
     * // Create one AgentTrace
     * const AgentTrace = await prisma.agentTrace.create({
     *   data: {
     *     // ... data to create a AgentTrace
     *   }
     * })
     * 
     */
    create<T extends AgentTraceCreateArgs>(args: SelectSubset<T, AgentTraceCreateArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many AgentTraces.
     * @param {AgentTraceCreateManyArgs} args - Arguments to create many AgentTraces.
     * @example
     * // Create many AgentTraces
     * const agentTrace = await prisma.agentTrace.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentTraceCreateManyArgs>(args?: SelectSubset<T, AgentTraceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AgentTrace.
     * @param {AgentTraceDeleteArgs} args - Arguments to delete one AgentTrace.
     * @example
     * // Delete one AgentTrace
     * const AgentTrace = await prisma.agentTrace.delete({
     *   where: {
     *     // ... filter to delete one AgentTrace
     *   }
     * })
     * 
     */
    delete<T extends AgentTraceDeleteArgs>(args: SelectSubset<T, AgentTraceDeleteArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one AgentTrace.
     * @param {AgentTraceUpdateArgs} args - Arguments to update one AgentTrace.
     * @example
     * // Update one AgentTrace
     * const agentTrace = await prisma.agentTrace.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentTraceUpdateArgs>(args: SelectSubset<T, AgentTraceUpdateArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more AgentTraces.
     * @param {AgentTraceDeleteManyArgs} args - Arguments to filter AgentTraces to delete.
     * @example
     * // Delete a few AgentTraces
     * const { count } = await prisma.agentTrace.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentTraceDeleteManyArgs>(args?: SelectSubset<T, AgentTraceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentTraces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentTraces
     * const agentTrace = await prisma.agentTrace.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentTraceUpdateManyArgs>(args: SelectSubset<T, AgentTraceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AgentTrace.
     * @param {AgentTraceUpsertArgs} args - Arguments to update or create a AgentTrace.
     * @example
     * // Update or create a AgentTrace
     * const agentTrace = await prisma.agentTrace.upsert({
     *   create: {
     *     // ... data to create a AgentTrace
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentTrace we want to update
     *   }
     * })
     */
    upsert<T extends AgentTraceUpsertArgs>(args: SelectSubset<T, AgentTraceUpsertArgs<ExtArgs>>): Prisma__AgentTraceClient<$Result.GetResult<Prisma.$AgentTracePayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AgentTraces that matches the filter.
     * @param {AgentTraceFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const agentTrace = await prisma.agentTrace.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AgentTraceFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AgentTrace.
     * @param {AgentTraceAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const agentTrace = await prisma.agentTrace.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AgentTraceAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AgentTraces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceCountArgs} args - Arguments to filter AgentTraces to count.
     * @example
     * // Count the number of AgentTraces
     * const count = await prisma.agentTrace.count({
     *   where: {
     *     // ... the filter for the AgentTraces we want to count
     *   }
     * })
    **/
    count<T extends AgentTraceCountArgs>(
      args?: Subset<T, AgentTraceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentTraceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentTrace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentTraceAggregateArgs>(args: Subset<T, AgentTraceAggregateArgs>): Prisma.PrismaPromise<GetAgentTraceAggregateType<T>>

    /**
     * Group by AgentTrace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentTraceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentTraceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentTraceGroupByArgs['orderBy'] }
        : { orderBy?: AgentTraceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentTraceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentTraceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentTrace model
   */
  readonly fields: AgentTraceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentTrace.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentTraceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agentRun<T extends AgentRunDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgentRunDefaultArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    ticket<T extends AgentTrace$ticketArgs<ExtArgs> = {}>(args?: Subset<T, AgentTrace$ticketArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | null, null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentTrace model
   */ 
  interface AgentTraceFieldRefs {
    readonly id: FieldRef<"AgentTrace", 'String'>
    readonly agentRunId: FieldRef<"AgentTrace", 'String'>
    readonly ticketId: FieldRef<"AgentTrace", 'String'>
    readonly step: FieldRef<"AgentTrace", 'String'>
    readonly evidenceDetails: FieldRef<"AgentTrace", 'String'>
    readonly actor: FieldRef<"AgentTrace", 'String'>
    readonly timestamp: FieldRef<"AgentTrace", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentTrace findUnique
   */
  export type AgentTraceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter, which AgentTrace to fetch.
     */
    where: AgentTraceWhereUniqueInput
  }

  /**
   * AgentTrace findUniqueOrThrow
   */
  export type AgentTraceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter, which AgentTrace to fetch.
     */
    where: AgentTraceWhereUniqueInput
  }

  /**
   * AgentTrace findFirst
   */
  export type AgentTraceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter, which AgentTrace to fetch.
     */
    where?: AgentTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentTraces to fetch.
     */
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentTraces.
     */
    cursor?: AgentTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentTraces.
     */
    distinct?: AgentTraceScalarFieldEnum | AgentTraceScalarFieldEnum[]
  }

  /**
   * AgentTrace findFirstOrThrow
   */
  export type AgentTraceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter, which AgentTrace to fetch.
     */
    where?: AgentTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentTraces to fetch.
     */
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentTraces.
     */
    cursor?: AgentTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentTraces.
     */
    distinct?: AgentTraceScalarFieldEnum | AgentTraceScalarFieldEnum[]
  }

  /**
   * AgentTrace findMany
   */
  export type AgentTraceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter, which AgentTraces to fetch.
     */
    where?: AgentTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentTraces to fetch.
     */
    orderBy?: AgentTraceOrderByWithRelationInput | AgentTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentTraces.
     */
    cursor?: AgentTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentTraces.
     */
    skip?: number
    distinct?: AgentTraceScalarFieldEnum | AgentTraceScalarFieldEnum[]
  }

  /**
   * AgentTrace create
   */
  export type AgentTraceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * The data needed to create a AgentTrace.
     */
    data: XOR<AgentTraceCreateInput, AgentTraceUncheckedCreateInput>
  }

  /**
   * AgentTrace createMany
   */
  export type AgentTraceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentTraces.
     */
    data: AgentTraceCreateManyInput | AgentTraceCreateManyInput[]
  }

  /**
   * AgentTrace update
   */
  export type AgentTraceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * The data needed to update a AgentTrace.
     */
    data: XOR<AgentTraceUpdateInput, AgentTraceUncheckedUpdateInput>
    /**
     * Choose, which AgentTrace to update.
     */
    where: AgentTraceWhereUniqueInput
  }

  /**
   * AgentTrace updateMany
   */
  export type AgentTraceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentTraces.
     */
    data: XOR<AgentTraceUpdateManyMutationInput, AgentTraceUncheckedUpdateManyInput>
    /**
     * Filter which AgentTraces to update
     */
    where?: AgentTraceWhereInput
    /**
     * Limit how many AgentTraces to update.
     */
    limit?: number
  }

  /**
   * AgentTrace upsert
   */
  export type AgentTraceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * The filter to search for the AgentTrace to update in case it exists.
     */
    where: AgentTraceWhereUniqueInput
    /**
     * In case the AgentTrace found by the `where` argument doesn't exist, create a new AgentTrace with this data.
     */
    create: XOR<AgentTraceCreateInput, AgentTraceUncheckedCreateInput>
    /**
     * In case the AgentTrace was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentTraceUpdateInput, AgentTraceUncheckedUpdateInput>
  }

  /**
   * AgentTrace delete
   */
  export type AgentTraceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
    /**
     * Filter which AgentTrace to delete.
     */
    where: AgentTraceWhereUniqueInput
  }

  /**
   * AgentTrace deleteMany
   */
  export type AgentTraceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentTraces to delete
     */
    where?: AgentTraceWhereInput
    /**
     * Limit how many AgentTraces to delete.
     */
    limit?: number
  }

  /**
   * AgentTrace findRaw
   */
  export type AgentTraceFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AgentTrace aggregateRaw
   */
  export type AgentTraceAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AgentTrace.ticket
   */
  export type AgentTrace$ticketArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
  }

  /**
   * AgentTrace without action
   */
  export type AgentTraceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentTrace
     */
    select?: AgentTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentTrace
     */
    omit?: AgentTraceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentTraceInclude<ExtArgs> | null
  }


  /**
   * Model CaseRecord
   */

  export type AggregateCaseRecord = {
    _count: CaseRecordCountAggregateOutputType | null
    _min: CaseRecordMinAggregateOutputType | null
    _max: CaseRecordMaxAggregateOutputType | null
  }

  export type CaseRecordMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    ticketId: string | null
    orderId: string | null
    customerId: string | null
    issueType: string | null
    customerMessage: string | null
    status: string | null
    resolutionSummary: string | null
    requiresCustomerAction: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CaseRecordMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    ticketId: string | null
    orderId: string | null
    customerId: string | null
    issueType: string | null
    customerMessage: string | null
    status: string | null
    resolutionSummary: string | null
    requiresCustomerAction: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CaseRecordCountAggregateOutputType = {
    id: number
    tenantId: number
    ticketId: number
    orderId: number
    customerId: number
    issueType: number
    customerMessage: number
    status: number
    resolutionSummary: number
    requiresCustomerAction: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CaseRecordMinAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    orderId?: true
    customerId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    requiresCustomerAction?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CaseRecordMaxAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    orderId?: true
    customerId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    requiresCustomerAction?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CaseRecordCountAggregateInputType = {
    id?: true
    tenantId?: true
    ticketId?: true
    orderId?: true
    customerId?: true
    issueType?: true
    customerMessage?: true
    status?: true
    resolutionSummary?: true
    requiresCustomerAction?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CaseRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaseRecord to aggregate.
     */
    where?: CaseRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseRecords to fetch.
     */
    orderBy?: CaseRecordOrderByWithRelationInput | CaseRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CaseRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CaseRecords
    **/
    _count?: true | CaseRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CaseRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CaseRecordMaxAggregateInputType
  }

  export type GetCaseRecordAggregateType<T extends CaseRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateCaseRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCaseRecord[P]>
      : GetScalarType<T[P], AggregateCaseRecord[P]>
  }




  export type CaseRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaseRecordWhereInput
    orderBy?: CaseRecordOrderByWithAggregationInput | CaseRecordOrderByWithAggregationInput[]
    by: CaseRecordScalarFieldEnum[] | CaseRecordScalarFieldEnum
    having?: CaseRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CaseRecordCountAggregateInputType | true
    _min?: CaseRecordMinAggregateInputType
    _max?: CaseRecordMaxAggregateInputType
  }

  export type CaseRecordGroupByOutputType = {
    id: string
    tenantId: string
    ticketId: string
    orderId: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status: string
    resolutionSummary: string | null
    requiresCustomerAction: boolean
    createdAt: Date
    updatedAt: Date
    _count: CaseRecordCountAggregateOutputType | null
    _min: CaseRecordMinAggregateOutputType | null
    _max: CaseRecordMaxAggregateOutputType | null
  }

  type GetCaseRecordGroupByPayload<T extends CaseRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CaseRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CaseRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CaseRecordGroupByOutputType[P]>
            : GetScalarType<T[P], CaseRecordGroupByOutputType[P]>
        }
      >
    >


  export type CaseRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    ticketId?: boolean
    orderId?: boolean
    customerId?: boolean
    issueType?: boolean
    customerMessage?: boolean
    status?: boolean
    resolutionSummary?: boolean
    requiresCustomerAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["caseRecord"]>



  export type CaseRecordSelectScalar = {
    id?: boolean
    tenantId?: boolean
    ticketId?: boolean
    orderId?: boolean
    customerId?: boolean
    issueType?: boolean
    customerMessage?: boolean
    status?: boolean
    resolutionSummary?: boolean
    requiresCustomerAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CaseRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "ticketId" | "orderId" | "customerId" | "issueType" | "customerMessage" | "status" | "resolutionSummary" | "requiresCustomerAction" | "createdAt" | "updatedAt", ExtArgs["result"]["caseRecord"]>
  export type CaseRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }

  export type $CaseRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CaseRecord"
    objects: {
      ticket: Prisma.$TicketPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      ticketId: string
      orderId: string | null
      customerId: string
      issueType: string
      customerMessage: string
      status: string
      resolutionSummary: string | null
      requiresCustomerAction: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["caseRecord"]>
    composites: {}
  }

  type CaseRecordGetPayload<S extends boolean | null | undefined | CaseRecordDefaultArgs> = $Result.GetResult<Prisma.$CaseRecordPayload, S>

  type CaseRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CaseRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CaseRecordCountAggregateInputType | true
    }

  export interface CaseRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CaseRecord'], meta: { name: 'CaseRecord' } }
    /**
     * Find zero or one CaseRecord that matches the filter.
     * @param {CaseRecordFindUniqueArgs} args - Arguments to find a CaseRecord
     * @example
     * // Get one CaseRecord
     * const caseRecord = await prisma.caseRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CaseRecordFindUniqueArgs>(args: SelectSubset<T, CaseRecordFindUniqueArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one CaseRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CaseRecordFindUniqueOrThrowArgs} args - Arguments to find a CaseRecord
     * @example
     * // Get one CaseRecord
     * const caseRecord = await prisma.caseRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CaseRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, CaseRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first CaseRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordFindFirstArgs} args - Arguments to find a CaseRecord
     * @example
     * // Get one CaseRecord
     * const caseRecord = await prisma.caseRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CaseRecordFindFirstArgs>(args?: SelectSubset<T, CaseRecordFindFirstArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first CaseRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordFindFirstOrThrowArgs} args - Arguments to find a CaseRecord
     * @example
     * // Get one CaseRecord
     * const caseRecord = await prisma.caseRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CaseRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, CaseRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more CaseRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CaseRecords
     * const caseRecords = await prisma.caseRecord.findMany()
     * 
     * // Get first 10 CaseRecords
     * const caseRecords = await prisma.caseRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const caseRecordWithIdOnly = await prisma.caseRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CaseRecordFindManyArgs>(args?: SelectSubset<T, CaseRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a CaseRecord.
     * @param {CaseRecordCreateArgs} args - Arguments to create a CaseRecord.
     * @example
     * // Create one CaseRecord
     * const CaseRecord = await prisma.caseRecord.create({
     *   data: {
     *     // ... data to create a CaseRecord
     *   }
     * })
     * 
     */
    create<T extends CaseRecordCreateArgs>(args: SelectSubset<T, CaseRecordCreateArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many CaseRecords.
     * @param {CaseRecordCreateManyArgs} args - Arguments to create many CaseRecords.
     * @example
     * // Create many CaseRecords
     * const caseRecord = await prisma.caseRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CaseRecordCreateManyArgs>(args?: SelectSubset<T, CaseRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CaseRecord.
     * @param {CaseRecordDeleteArgs} args - Arguments to delete one CaseRecord.
     * @example
     * // Delete one CaseRecord
     * const CaseRecord = await prisma.caseRecord.delete({
     *   where: {
     *     // ... filter to delete one CaseRecord
     *   }
     * })
     * 
     */
    delete<T extends CaseRecordDeleteArgs>(args: SelectSubset<T, CaseRecordDeleteArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one CaseRecord.
     * @param {CaseRecordUpdateArgs} args - Arguments to update one CaseRecord.
     * @example
     * // Update one CaseRecord
     * const caseRecord = await prisma.caseRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CaseRecordUpdateArgs>(args: SelectSubset<T, CaseRecordUpdateArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more CaseRecords.
     * @param {CaseRecordDeleteManyArgs} args - Arguments to filter CaseRecords to delete.
     * @example
     * // Delete a few CaseRecords
     * const { count } = await prisma.caseRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CaseRecordDeleteManyArgs>(args?: SelectSubset<T, CaseRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CaseRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CaseRecords
     * const caseRecord = await prisma.caseRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CaseRecordUpdateManyArgs>(args: SelectSubset<T, CaseRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CaseRecord.
     * @param {CaseRecordUpsertArgs} args - Arguments to update or create a CaseRecord.
     * @example
     * // Update or create a CaseRecord
     * const caseRecord = await prisma.caseRecord.upsert({
     *   create: {
     *     // ... data to create a CaseRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CaseRecord we want to update
     *   }
     * })
     */
    upsert<T extends CaseRecordUpsertArgs>(args: SelectSubset<T, CaseRecordUpsertArgs<ExtArgs>>): Prisma__CaseRecordClient<$Result.GetResult<Prisma.$CaseRecordPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more CaseRecords that matches the filter.
     * @param {CaseRecordFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const caseRecord = await prisma.caseRecord.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: CaseRecordFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a CaseRecord.
     * @param {CaseRecordAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const caseRecord = await prisma.caseRecord.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: CaseRecordAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of CaseRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordCountArgs} args - Arguments to filter CaseRecords to count.
     * @example
     * // Count the number of CaseRecords
     * const count = await prisma.caseRecord.count({
     *   where: {
     *     // ... the filter for the CaseRecords we want to count
     *   }
     * })
    **/
    count<T extends CaseRecordCountArgs>(
      args?: Subset<T, CaseRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CaseRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CaseRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CaseRecordAggregateArgs>(args: Subset<T, CaseRecordAggregateArgs>): Prisma.PrismaPromise<GetCaseRecordAggregateType<T>>

    /**
     * Group by CaseRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CaseRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CaseRecordGroupByArgs['orderBy'] }
        : { orderBy?: CaseRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CaseRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCaseRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CaseRecord model
   */
  readonly fields: CaseRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CaseRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CaseRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ticket<T extends TicketDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TicketDefaultArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CaseRecord model
   */ 
  interface CaseRecordFieldRefs {
    readonly id: FieldRef<"CaseRecord", 'String'>
    readonly tenantId: FieldRef<"CaseRecord", 'String'>
    readonly ticketId: FieldRef<"CaseRecord", 'String'>
    readonly orderId: FieldRef<"CaseRecord", 'String'>
    readonly customerId: FieldRef<"CaseRecord", 'String'>
    readonly issueType: FieldRef<"CaseRecord", 'String'>
    readonly customerMessage: FieldRef<"CaseRecord", 'String'>
    readonly status: FieldRef<"CaseRecord", 'String'>
    readonly resolutionSummary: FieldRef<"CaseRecord", 'String'>
    readonly requiresCustomerAction: FieldRef<"CaseRecord", 'Boolean'>
    readonly createdAt: FieldRef<"CaseRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"CaseRecord", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CaseRecord findUnique
   */
  export type CaseRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter, which CaseRecord to fetch.
     */
    where: CaseRecordWhereUniqueInput
  }

  /**
   * CaseRecord findUniqueOrThrow
   */
  export type CaseRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter, which CaseRecord to fetch.
     */
    where: CaseRecordWhereUniqueInput
  }

  /**
   * CaseRecord findFirst
   */
  export type CaseRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter, which CaseRecord to fetch.
     */
    where?: CaseRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseRecords to fetch.
     */
    orderBy?: CaseRecordOrderByWithRelationInput | CaseRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaseRecords.
     */
    cursor?: CaseRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaseRecords.
     */
    distinct?: CaseRecordScalarFieldEnum | CaseRecordScalarFieldEnum[]
  }

  /**
   * CaseRecord findFirstOrThrow
   */
  export type CaseRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter, which CaseRecord to fetch.
     */
    where?: CaseRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseRecords to fetch.
     */
    orderBy?: CaseRecordOrderByWithRelationInput | CaseRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaseRecords.
     */
    cursor?: CaseRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaseRecords.
     */
    distinct?: CaseRecordScalarFieldEnum | CaseRecordScalarFieldEnum[]
  }

  /**
   * CaseRecord findMany
   */
  export type CaseRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter, which CaseRecords to fetch.
     */
    where?: CaseRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseRecords to fetch.
     */
    orderBy?: CaseRecordOrderByWithRelationInput | CaseRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CaseRecords.
     */
    cursor?: CaseRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseRecords.
     */
    skip?: number
    distinct?: CaseRecordScalarFieldEnum | CaseRecordScalarFieldEnum[]
  }

  /**
   * CaseRecord create
   */
  export type CaseRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a CaseRecord.
     */
    data: XOR<CaseRecordCreateInput, CaseRecordUncheckedCreateInput>
  }

  /**
   * CaseRecord createMany
   */
  export type CaseRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CaseRecords.
     */
    data: CaseRecordCreateManyInput | CaseRecordCreateManyInput[]
  }

  /**
   * CaseRecord update
   */
  export type CaseRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a CaseRecord.
     */
    data: XOR<CaseRecordUpdateInput, CaseRecordUncheckedUpdateInput>
    /**
     * Choose, which CaseRecord to update.
     */
    where: CaseRecordWhereUniqueInput
  }

  /**
   * CaseRecord updateMany
   */
  export type CaseRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CaseRecords.
     */
    data: XOR<CaseRecordUpdateManyMutationInput, CaseRecordUncheckedUpdateManyInput>
    /**
     * Filter which CaseRecords to update
     */
    where?: CaseRecordWhereInput
    /**
     * Limit how many CaseRecords to update.
     */
    limit?: number
  }

  /**
   * CaseRecord upsert
   */
  export type CaseRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the CaseRecord to update in case it exists.
     */
    where: CaseRecordWhereUniqueInput
    /**
     * In case the CaseRecord found by the `where` argument doesn't exist, create a new CaseRecord with this data.
     */
    create: XOR<CaseRecordCreateInput, CaseRecordUncheckedCreateInput>
    /**
     * In case the CaseRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CaseRecordUpdateInput, CaseRecordUncheckedUpdateInput>
  }

  /**
   * CaseRecord delete
   */
  export type CaseRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
    /**
     * Filter which CaseRecord to delete.
     */
    where: CaseRecordWhereUniqueInput
  }

  /**
   * CaseRecord deleteMany
   */
  export type CaseRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaseRecords to delete
     */
    where?: CaseRecordWhereInput
    /**
     * Limit how many CaseRecords to delete.
     */
    limit?: number
  }

  /**
   * CaseRecord findRaw
   */
  export type CaseRecordFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * CaseRecord aggregateRaw
   */
  export type CaseRecordAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * CaseRecord without action
   */
  export type CaseRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseRecord
     */
    select?: CaseRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaseRecord
     */
    omit?: CaseRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseRecordInclude<ExtArgs> | null
  }


  /**
   * Model RefundTransaction
   */

  export type AggregateRefundTransaction = {
    _count: RefundTransactionCountAggregateOutputType | null
    _avg: RefundTransactionAvgAggregateOutputType | null
    _sum: RefundTransactionSumAggregateOutputType | null
    _min: RefundTransactionMinAggregateOutputType | null
    _max: RefundTransactionMaxAggregateOutputType | null
  }

  export type RefundTransactionAvgAggregateOutputType = {
    amount: number | null
  }

  export type RefundTransactionSumAggregateOutputType = {
    amount: number | null
  }

  export type RefundTransactionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    orderId: string | null
    amount: number | null
    currency: string | null
    status: string | null
    idempotencyKey: string | null
    createdAt: Date | null
  }

  export type RefundTransactionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    orderId: string | null
    amount: number | null
    currency: string | null
    status: string | null
    idempotencyKey: string | null
    createdAt: Date | null
  }

  export type RefundTransactionCountAggregateOutputType = {
    id: number
    tenantId: number
    orderId: number
    amount: number
    currency: number
    status: number
    idempotencyKey: number
    createdAt: number
    _all: number
  }


  export type RefundTransactionAvgAggregateInputType = {
    amount?: true
  }

  export type RefundTransactionSumAggregateInputType = {
    amount?: true
  }

  export type RefundTransactionMinAggregateInputType = {
    id?: true
    tenantId?: true
    orderId?: true
    amount?: true
    currency?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
  }

  export type RefundTransactionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    orderId?: true
    amount?: true
    currency?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
  }

  export type RefundTransactionCountAggregateInputType = {
    id?: true
    tenantId?: true
    orderId?: true
    amount?: true
    currency?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
    _all?: true
  }

  export type RefundTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefundTransaction to aggregate.
     */
    where?: RefundTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefundTransactions to fetch.
     */
    orderBy?: RefundTransactionOrderByWithRelationInput | RefundTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RefundTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefundTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefundTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RefundTransactions
    **/
    _count?: true | RefundTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RefundTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RefundTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RefundTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RefundTransactionMaxAggregateInputType
  }

  export type GetRefundTransactionAggregateType<T extends RefundTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateRefundTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRefundTransaction[P]>
      : GetScalarType<T[P], AggregateRefundTransaction[P]>
  }




  export type RefundTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefundTransactionWhereInput
    orderBy?: RefundTransactionOrderByWithAggregationInput | RefundTransactionOrderByWithAggregationInput[]
    by: RefundTransactionScalarFieldEnum[] | RefundTransactionScalarFieldEnum
    having?: RefundTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RefundTransactionCountAggregateInputType | true
    _avg?: RefundTransactionAvgAggregateInputType
    _sum?: RefundTransactionSumAggregateInputType
    _min?: RefundTransactionMinAggregateInputType
    _max?: RefundTransactionMaxAggregateInputType
  }

  export type RefundTransactionGroupByOutputType = {
    id: string
    tenantId: string
    orderId: string
    amount: number
    currency: string
    status: string
    idempotencyKey: string
    createdAt: Date
    _count: RefundTransactionCountAggregateOutputType | null
    _avg: RefundTransactionAvgAggregateOutputType | null
    _sum: RefundTransactionSumAggregateOutputType | null
    _min: RefundTransactionMinAggregateOutputType | null
    _max: RefundTransactionMaxAggregateOutputType | null
  }

  type GetRefundTransactionGroupByPayload<T extends RefundTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RefundTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RefundTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RefundTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], RefundTransactionGroupByOutputType[P]>
        }
      >
    >


  export type RefundTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    status?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refundTransaction"]>



  export type RefundTransactionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    status?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
  }

  export type RefundTransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "orderId" | "amount" | "currency" | "status" | "idempotencyKey" | "createdAt", ExtArgs["result"]["refundTransaction"]>
  export type RefundTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $RefundTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RefundTransaction"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      orderId: string
      amount: number
      currency: string
      status: string
      idempotencyKey: string
      createdAt: Date
    }, ExtArgs["result"]["refundTransaction"]>
    composites: {}
  }

  type RefundTransactionGetPayload<S extends boolean | null | undefined | RefundTransactionDefaultArgs> = $Result.GetResult<Prisma.$RefundTransactionPayload, S>

  type RefundTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RefundTransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RefundTransactionCountAggregateInputType | true
    }

  export interface RefundTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RefundTransaction'], meta: { name: 'RefundTransaction' } }
    /**
     * Find zero or one RefundTransaction that matches the filter.
     * @param {RefundTransactionFindUniqueArgs} args - Arguments to find a RefundTransaction
     * @example
     * // Get one RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RefundTransactionFindUniqueArgs>(args: SelectSubset<T, RefundTransactionFindUniqueArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one RefundTransaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RefundTransactionFindUniqueOrThrowArgs} args - Arguments to find a RefundTransaction
     * @example
     * // Get one RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RefundTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, RefundTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first RefundTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionFindFirstArgs} args - Arguments to find a RefundTransaction
     * @example
     * // Get one RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RefundTransactionFindFirstArgs>(args?: SelectSubset<T, RefundTransactionFindFirstArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first RefundTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionFindFirstOrThrowArgs} args - Arguments to find a RefundTransaction
     * @example
     * // Get one RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RefundTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, RefundTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more RefundTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RefundTransactions
     * const refundTransactions = await prisma.refundTransaction.findMany()
     * 
     * // Get first 10 RefundTransactions
     * const refundTransactions = await prisma.refundTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const refundTransactionWithIdOnly = await prisma.refundTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RefundTransactionFindManyArgs>(args?: SelectSubset<T, RefundTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a RefundTransaction.
     * @param {RefundTransactionCreateArgs} args - Arguments to create a RefundTransaction.
     * @example
     * // Create one RefundTransaction
     * const RefundTransaction = await prisma.refundTransaction.create({
     *   data: {
     *     // ... data to create a RefundTransaction
     *   }
     * })
     * 
     */
    create<T extends RefundTransactionCreateArgs>(args: SelectSubset<T, RefundTransactionCreateArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many RefundTransactions.
     * @param {RefundTransactionCreateManyArgs} args - Arguments to create many RefundTransactions.
     * @example
     * // Create many RefundTransactions
     * const refundTransaction = await prisma.refundTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RefundTransactionCreateManyArgs>(args?: SelectSubset<T, RefundTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a RefundTransaction.
     * @param {RefundTransactionDeleteArgs} args - Arguments to delete one RefundTransaction.
     * @example
     * // Delete one RefundTransaction
     * const RefundTransaction = await prisma.refundTransaction.delete({
     *   where: {
     *     // ... filter to delete one RefundTransaction
     *   }
     * })
     * 
     */
    delete<T extends RefundTransactionDeleteArgs>(args: SelectSubset<T, RefundTransactionDeleteArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one RefundTransaction.
     * @param {RefundTransactionUpdateArgs} args - Arguments to update one RefundTransaction.
     * @example
     * // Update one RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RefundTransactionUpdateArgs>(args: SelectSubset<T, RefundTransactionUpdateArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more RefundTransactions.
     * @param {RefundTransactionDeleteManyArgs} args - Arguments to filter RefundTransactions to delete.
     * @example
     * // Delete a few RefundTransactions
     * const { count } = await prisma.refundTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RefundTransactionDeleteManyArgs>(args?: SelectSubset<T, RefundTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RefundTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RefundTransactions
     * const refundTransaction = await prisma.refundTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RefundTransactionUpdateManyArgs>(args: SelectSubset<T, RefundTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RefundTransaction.
     * @param {RefundTransactionUpsertArgs} args - Arguments to update or create a RefundTransaction.
     * @example
     * // Update or create a RefundTransaction
     * const refundTransaction = await prisma.refundTransaction.upsert({
     *   create: {
     *     // ... data to create a RefundTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RefundTransaction we want to update
     *   }
     * })
     */
    upsert<T extends RefundTransactionUpsertArgs>(args: SelectSubset<T, RefundTransactionUpsertArgs<ExtArgs>>): Prisma__RefundTransactionClient<$Result.GetResult<Prisma.$RefundTransactionPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more RefundTransactions that matches the filter.
     * @param {RefundTransactionFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const refundTransaction = await prisma.refundTransaction.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: RefundTransactionFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a RefundTransaction.
     * @param {RefundTransactionAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const refundTransaction = await prisma.refundTransaction.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: RefundTransactionAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of RefundTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionCountArgs} args - Arguments to filter RefundTransactions to count.
     * @example
     * // Count the number of RefundTransactions
     * const count = await prisma.refundTransaction.count({
     *   where: {
     *     // ... the filter for the RefundTransactions we want to count
     *   }
     * })
    **/
    count<T extends RefundTransactionCountArgs>(
      args?: Subset<T, RefundTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RefundTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RefundTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RefundTransactionAggregateArgs>(args: Subset<T, RefundTransactionAggregateArgs>): Prisma.PrismaPromise<GetRefundTransactionAggregateType<T>>

    /**
     * Group by RefundTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefundTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RefundTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RefundTransactionGroupByArgs['orderBy'] }
        : { orderBy?: RefundTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RefundTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRefundTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RefundTransaction model
   */
  readonly fields: RefundTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RefundTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RefundTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RefundTransaction model
   */ 
  interface RefundTransactionFieldRefs {
    readonly id: FieldRef<"RefundTransaction", 'String'>
    readonly tenantId: FieldRef<"RefundTransaction", 'String'>
    readonly orderId: FieldRef<"RefundTransaction", 'String'>
    readonly amount: FieldRef<"RefundTransaction", 'Float'>
    readonly currency: FieldRef<"RefundTransaction", 'String'>
    readonly status: FieldRef<"RefundTransaction", 'String'>
    readonly idempotencyKey: FieldRef<"RefundTransaction", 'String'>
    readonly createdAt: FieldRef<"RefundTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RefundTransaction findUnique
   */
  export type RefundTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter, which RefundTransaction to fetch.
     */
    where: RefundTransactionWhereUniqueInput
  }

  /**
   * RefundTransaction findUniqueOrThrow
   */
  export type RefundTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter, which RefundTransaction to fetch.
     */
    where: RefundTransactionWhereUniqueInput
  }

  /**
   * RefundTransaction findFirst
   */
  export type RefundTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter, which RefundTransaction to fetch.
     */
    where?: RefundTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefundTransactions to fetch.
     */
    orderBy?: RefundTransactionOrderByWithRelationInput | RefundTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefundTransactions.
     */
    cursor?: RefundTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefundTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefundTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefundTransactions.
     */
    distinct?: RefundTransactionScalarFieldEnum | RefundTransactionScalarFieldEnum[]
  }

  /**
   * RefundTransaction findFirstOrThrow
   */
  export type RefundTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter, which RefundTransaction to fetch.
     */
    where?: RefundTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefundTransactions to fetch.
     */
    orderBy?: RefundTransactionOrderByWithRelationInput | RefundTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefundTransactions.
     */
    cursor?: RefundTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefundTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefundTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefundTransactions.
     */
    distinct?: RefundTransactionScalarFieldEnum | RefundTransactionScalarFieldEnum[]
  }

  /**
   * RefundTransaction findMany
   */
  export type RefundTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter, which RefundTransactions to fetch.
     */
    where?: RefundTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefundTransactions to fetch.
     */
    orderBy?: RefundTransactionOrderByWithRelationInput | RefundTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RefundTransactions.
     */
    cursor?: RefundTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefundTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefundTransactions.
     */
    skip?: number
    distinct?: RefundTransactionScalarFieldEnum | RefundTransactionScalarFieldEnum[]
  }

  /**
   * RefundTransaction create
   */
  export type RefundTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a RefundTransaction.
     */
    data: XOR<RefundTransactionCreateInput, RefundTransactionUncheckedCreateInput>
  }

  /**
   * RefundTransaction createMany
   */
  export type RefundTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RefundTransactions.
     */
    data: RefundTransactionCreateManyInput | RefundTransactionCreateManyInput[]
  }

  /**
   * RefundTransaction update
   */
  export type RefundTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a RefundTransaction.
     */
    data: XOR<RefundTransactionUpdateInput, RefundTransactionUncheckedUpdateInput>
    /**
     * Choose, which RefundTransaction to update.
     */
    where: RefundTransactionWhereUniqueInput
  }

  /**
   * RefundTransaction updateMany
   */
  export type RefundTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RefundTransactions.
     */
    data: XOR<RefundTransactionUpdateManyMutationInput, RefundTransactionUncheckedUpdateManyInput>
    /**
     * Filter which RefundTransactions to update
     */
    where?: RefundTransactionWhereInput
    /**
     * Limit how many RefundTransactions to update.
     */
    limit?: number
  }

  /**
   * RefundTransaction upsert
   */
  export type RefundTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the RefundTransaction to update in case it exists.
     */
    where: RefundTransactionWhereUniqueInput
    /**
     * In case the RefundTransaction found by the `where` argument doesn't exist, create a new RefundTransaction with this data.
     */
    create: XOR<RefundTransactionCreateInput, RefundTransactionUncheckedCreateInput>
    /**
     * In case the RefundTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RefundTransactionUpdateInput, RefundTransactionUncheckedUpdateInput>
  }

  /**
   * RefundTransaction delete
   */
  export type RefundTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
    /**
     * Filter which RefundTransaction to delete.
     */
    where: RefundTransactionWhereUniqueInput
  }

  /**
   * RefundTransaction deleteMany
   */
  export type RefundTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefundTransactions to delete
     */
    where?: RefundTransactionWhereInput
    /**
     * Limit how many RefundTransactions to delete.
     */
    limit?: number
  }

  /**
   * RefundTransaction findRaw
   */
  export type RefundTransactionFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * RefundTransaction aggregateRaw
   */
  export type RefundTransactionAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * RefundTransaction without action
   */
  export type RefundTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefundTransaction
     */
    select?: RefundTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefundTransaction
     */
    omit?: RefundTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefundTransactionInclude<ExtArgs> | null
  }


  /**
   * Model Coupon
   */

  export type AggregateCoupon = {
    _count: CouponCountAggregateOutputType | null
    _avg: CouponAvgAggregateOutputType | null
    _sum: CouponSumAggregateOutputType | null
    _min: CouponMinAggregateOutputType | null
    _max: CouponMaxAggregateOutputType | null
  }

  export type CouponAvgAggregateOutputType = {
    discount: number | null
  }

  export type CouponSumAggregateOutputType = {
    discount: number | null
  }

  export type CouponMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    code: string | null
    discount: number | null
    isRedeemed: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type CouponMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    code: string | null
    discount: number | null
    isRedeemed: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type CouponCountAggregateOutputType = {
    id: number
    tenantId: number
    customerId: number
    code: number
    discount: number
    isRedeemed: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type CouponAvgAggregateInputType = {
    discount?: true
  }

  export type CouponSumAggregateInputType = {
    discount?: true
  }

  export type CouponMinAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    code?: true
    discount?: true
    isRedeemed?: true
    expiresAt?: true
    createdAt?: true
  }

  export type CouponMaxAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    code?: true
    discount?: true
    isRedeemed?: true
    expiresAt?: true
    createdAt?: true
  }

  export type CouponCountAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    code?: true
    discount?: true
    isRedeemed?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type CouponAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coupon to aggregate.
     */
    where?: CouponWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: CouponOrderByWithRelationInput | CouponOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CouponWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Coupons
    **/
    _count?: true | CouponCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CouponAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CouponSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CouponMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CouponMaxAggregateInputType
  }

  export type GetCouponAggregateType<T extends CouponAggregateArgs> = {
        [P in keyof T & keyof AggregateCoupon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoupon[P]>
      : GetScalarType<T[P], AggregateCoupon[P]>
  }




  export type CouponGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CouponWhereInput
    orderBy?: CouponOrderByWithAggregationInput | CouponOrderByWithAggregationInput[]
    by: CouponScalarFieldEnum[] | CouponScalarFieldEnum
    having?: CouponScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CouponCountAggregateInputType | true
    _avg?: CouponAvgAggregateInputType
    _sum?: CouponSumAggregateInputType
    _min?: CouponMinAggregateInputType
    _max?: CouponMaxAggregateInputType
  }

  export type CouponGroupByOutputType = {
    id: string
    tenantId: string
    customerId: string
    code: string
    discount: number
    isRedeemed: boolean
    expiresAt: Date | null
    createdAt: Date
    _count: CouponCountAggregateOutputType | null
    _avg: CouponAvgAggregateOutputType | null
    _sum: CouponSumAggregateOutputType | null
    _min: CouponMinAggregateOutputType | null
    _max: CouponMaxAggregateOutputType | null
  }

  type GetCouponGroupByPayload<T extends CouponGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CouponGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CouponGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CouponGroupByOutputType[P]>
            : GetScalarType<T[P], CouponGroupByOutputType[P]>
        }
      >
    >


  export type CouponSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    code?: boolean
    discount?: boolean
    isRedeemed?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coupon"]>



  export type CouponSelectScalar = {
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    code?: boolean
    discount?: boolean
    isRedeemed?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type CouponOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "customerId" | "code" | "discount" | "isRedeemed" | "expiresAt" | "createdAt", ExtArgs["result"]["coupon"]>
  export type CouponInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $CouponPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Coupon"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      customerId: string
      code: string
      discount: number
      isRedeemed: boolean
      expiresAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["coupon"]>
    composites: {}
  }

  type CouponGetPayload<S extends boolean | null | undefined | CouponDefaultArgs> = $Result.GetResult<Prisma.$CouponPayload, S>

  type CouponCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CouponFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CouponCountAggregateInputType | true
    }

  export interface CouponDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Coupon'], meta: { name: 'Coupon' } }
    /**
     * Find zero or one Coupon that matches the filter.
     * @param {CouponFindUniqueArgs} args - Arguments to find a Coupon
     * @example
     * // Get one Coupon
     * const coupon = await prisma.coupon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CouponFindUniqueArgs>(args: SelectSubset<T, CouponFindUniqueArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Coupon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CouponFindUniqueOrThrowArgs} args - Arguments to find a Coupon
     * @example
     * // Get one Coupon
     * const coupon = await prisma.coupon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CouponFindUniqueOrThrowArgs>(args: SelectSubset<T, CouponFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Coupon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponFindFirstArgs} args - Arguments to find a Coupon
     * @example
     * // Get one Coupon
     * const coupon = await prisma.coupon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CouponFindFirstArgs>(args?: SelectSubset<T, CouponFindFirstArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Coupon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponFindFirstOrThrowArgs} args - Arguments to find a Coupon
     * @example
     * // Get one Coupon
     * const coupon = await prisma.coupon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CouponFindFirstOrThrowArgs>(args?: SelectSubset<T, CouponFindFirstOrThrowArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Coupons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coupons
     * const coupons = await prisma.coupon.findMany()
     * 
     * // Get first 10 Coupons
     * const coupons = await prisma.coupon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const couponWithIdOnly = await prisma.coupon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CouponFindManyArgs>(args?: SelectSubset<T, CouponFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Coupon.
     * @param {CouponCreateArgs} args - Arguments to create a Coupon.
     * @example
     * // Create one Coupon
     * const Coupon = await prisma.coupon.create({
     *   data: {
     *     // ... data to create a Coupon
     *   }
     * })
     * 
     */
    create<T extends CouponCreateArgs>(args: SelectSubset<T, CouponCreateArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Coupons.
     * @param {CouponCreateManyArgs} args - Arguments to create many Coupons.
     * @example
     * // Create many Coupons
     * const coupon = await prisma.coupon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CouponCreateManyArgs>(args?: SelectSubset<T, CouponCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Coupon.
     * @param {CouponDeleteArgs} args - Arguments to delete one Coupon.
     * @example
     * // Delete one Coupon
     * const Coupon = await prisma.coupon.delete({
     *   where: {
     *     // ... filter to delete one Coupon
     *   }
     * })
     * 
     */
    delete<T extends CouponDeleteArgs>(args: SelectSubset<T, CouponDeleteArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Coupon.
     * @param {CouponUpdateArgs} args - Arguments to update one Coupon.
     * @example
     * // Update one Coupon
     * const coupon = await prisma.coupon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CouponUpdateArgs>(args: SelectSubset<T, CouponUpdateArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Coupons.
     * @param {CouponDeleteManyArgs} args - Arguments to filter Coupons to delete.
     * @example
     * // Delete a few Coupons
     * const { count } = await prisma.coupon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CouponDeleteManyArgs>(args?: SelectSubset<T, CouponDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coupons
     * const coupon = await prisma.coupon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CouponUpdateManyArgs>(args: SelectSubset<T, CouponUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Coupon.
     * @param {CouponUpsertArgs} args - Arguments to update or create a Coupon.
     * @example
     * // Update or create a Coupon
     * const coupon = await prisma.coupon.upsert({
     *   create: {
     *     // ... data to create a Coupon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coupon we want to update
     *   }
     * })
     */
    upsert<T extends CouponUpsertArgs>(args: SelectSubset<T, CouponUpsertArgs<ExtArgs>>): Prisma__CouponClient<$Result.GetResult<Prisma.$CouponPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Coupons that matches the filter.
     * @param {CouponFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const coupon = await prisma.coupon.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: CouponFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Coupon.
     * @param {CouponAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const coupon = await prisma.coupon.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: CouponAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponCountArgs} args - Arguments to filter Coupons to count.
     * @example
     * // Count the number of Coupons
     * const count = await prisma.coupon.count({
     *   where: {
     *     // ... the filter for the Coupons we want to count
     *   }
     * })
    **/
    count<T extends CouponCountArgs>(
      args?: Subset<T, CouponCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CouponCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coupon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CouponAggregateArgs>(args: Subset<T, CouponAggregateArgs>): Prisma.PrismaPromise<GetCouponAggregateType<T>>

    /**
     * Group by Coupon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CouponGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CouponGroupByArgs['orderBy'] }
        : { orderBy?: CouponGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CouponGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCouponGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Coupon model
   */
  readonly fields: CouponFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Coupon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CouponClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Coupon model
   */ 
  interface CouponFieldRefs {
    readonly id: FieldRef<"Coupon", 'String'>
    readonly tenantId: FieldRef<"Coupon", 'String'>
    readonly customerId: FieldRef<"Coupon", 'String'>
    readonly code: FieldRef<"Coupon", 'String'>
    readonly discount: FieldRef<"Coupon", 'Float'>
    readonly isRedeemed: FieldRef<"Coupon", 'Boolean'>
    readonly expiresAt: FieldRef<"Coupon", 'DateTime'>
    readonly createdAt: FieldRef<"Coupon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Coupon findUnique
   */
  export type CouponFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter, which Coupon to fetch.
     */
    where: CouponWhereUniqueInput
  }

  /**
   * Coupon findUniqueOrThrow
   */
  export type CouponFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter, which Coupon to fetch.
     */
    where: CouponWhereUniqueInput
  }

  /**
   * Coupon findFirst
   */
  export type CouponFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter, which Coupon to fetch.
     */
    where?: CouponWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: CouponOrderByWithRelationInput | CouponOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coupons.
     */
    cursor?: CouponWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coupons.
     */
    distinct?: CouponScalarFieldEnum | CouponScalarFieldEnum[]
  }

  /**
   * Coupon findFirstOrThrow
   */
  export type CouponFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter, which Coupon to fetch.
     */
    where?: CouponWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: CouponOrderByWithRelationInput | CouponOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coupons.
     */
    cursor?: CouponWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coupons.
     */
    distinct?: CouponScalarFieldEnum | CouponScalarFieldEnum[]
  }

  /**
   * Coupon findMany
   */
  export type CouponFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter, which Coupons to fetch.
     */
    where?: CouponWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: CouponOrderByWithRelationInput | CouponOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Coupons.
     */
    cursor?: CouponWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    distinct?: CouponScalarFieldEnum | CouponScalarFieldEnum[]
  }

  /**
   * Coupon create
   */
  export type CouponCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * The data needed to create a Coupon.
     */
    data: XOR<CouponCreateInput, CouponUncheckedCreateInput>
  }

  /**
   * Coupon createMany
   */
  export type CouponCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Coupons.
     */
    data: CouponCreateManyInput | CouponCreateManyInput[]
  }

  /**
   * Coupon update
   */
  export type CouponUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * The data needed to update a Coupon.
     */
    data: XOR<CouponUpdateInput, CouponUncheckedUpdateInput>
    /**
     * Choose, which Coupon to update.
     */
    where: CouponWhereUniqueInput
  }

  /**
   * Coupon updateMany
   */
  export type CouponUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Coupons.
     */
    data: XOR<CouponUpdateManyMutationInput, CouponUncheckedUpdateManyInput>
    /**
     * Filter which Coupons to update
     */
    where?: CouponWhereInput
    /**
     * Limit how many Coupons to update.
     */
    limit?: number
  }

  /**
   * Coupon upsert
   */
  export type CouponUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * The filter to search for the Coupon to update in case it exists.
     */
    where: CouponWhereUniqueInput
    /**
     * In case the Coupon found by the `where` argument doesn't exist, create a new Coupon with this data.
     */
    create: XOR<CouponCreateInput, CouponUncheckedCreateInput>
    /**
     * In case the Coupon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CouponUpdateInput, CouponUncheckedUpdateInput>
  }

  /**
   * Coupon delete
   */
  export type CouponDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
    /**
     * Filter which Coupon to delete.
     */
    where: CouponWhereUniqueInput
  }

  /**
   * Coupon deleteMany
   */
  export type CouponDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coupons to delete
     */
    where?: CouponWhereInput
    /**
     * Limit how many Coupons to delete.
     */
    limit?: number
  }

  /**
   * Coupon findRaw
   */
  export type CouponFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Coupon aggregateRaw
   */
  export type CouponAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Coupon without action
   */
  export type CouponDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coupon
     */
    select?: CouponSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coupon
     */
    omit?: CouponOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    type: string | null
    message: string | null
    channel: string | null
    status: string | null
    idempotencyKey: string | null
    createdAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    customerId: string | null
    type: string | null
    message: string | null
    channel: string | null
    status: string | null
    idempotencyKey: string | null
    createdAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    tenantId: number
    customerId: number
    type: number
    message: number
    channel: number
    status: number
    idempotencyKey: number
    createdAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    type?: true
    message?: true
    channel?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    type?: true
    message?: true
    channel?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    tenantId?: true
    customerId?: true
    type?: true
    message?: true
    channel?: true
    status?: true
    idempotencyKey?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    tenantId: string
    customerId: string
    type: string
    message: string
    channel: string
    status: string
    idempotencyKey: string
    createdAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    type?: boolean
    message?: boolean
    channel?: boolean
    status?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>



  export type NotificationSelectScalar = {
    id?: boolean
    tenantId?: boolean
    customerId?: boolean
    type?: boolean
    message?: boolean
    channel?: boolean
    status?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "customerId" | "type" | "message" | "channel" | "status" | "idempotencyKey" | "createdAt", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      customerId: string
      type: string
      message: string
      channel: string
      status: string
      idempotencyKey: string
      createdAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * @param {NotificationFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const notification = await prisma.notification.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: NotificationFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Notification.
     * @param {NotificationAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const notification = await prisma.notification.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: NotificationAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */ 
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly tenantId: FieldRef<"Notification", 'String'>
    readonly customerId: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly channel: FieldRef<"Notification", 'String'>
    readonly status: FieldRef<"Notification", 'String'>
    readonly idempotencyKey: FieldRef<"Notification", 'String'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification findRaw
   */
  export type NotificationFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Notification aggregateRaw
   */
  export type NotificationAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model ExecutionJob
   */

  export type AggregateExecutionJob = {
    _count: ExecutionJobCountAggregateOutputType | null
    _avg: ExecutionJobAvgAggregateOutputType | null
    _sum: ExecutionJobSumAggregateOutputType | null
    _min: ExecutionJobMinAggregateOutputType | null
    _max: ExecutionJobMaxAggregateOutputType | null
  }

  export type ExecutionJobAvgAggregateOutputType = {
    attemptCount: number | null
    maxAttempts: number | null
    leaseGeneration: number | null
  }

  export type ExecutionJobSumAggregateOutputType = {
    attemptCount: number | null
    maxAttempts: number | null
    leaseGeneration: number | null
  }

  export type ExecutionJobMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    runId: string | null
    status: string | null
    payloadJson: string | null
    attemptCount: number | null
    maxAttempts: number | null
    lastError: string | null
    workerId: string | null
    leaseGeneration: number | null
    leaseExpiresAt: Date | null
    idempotencyKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ExecutionJobMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    runId: string | null
    status: string | null
    payloadJson: string | null
    attemptCount: number | null
    maxAttempts: number | null
    lastError: string | null
    workerId: string | null
    leaseGeneration: number | null
    leaseExpiresAt: Date | null
    idempotencyKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ExecutionJobCountAggregateOutputType = {
    id: number
    tenantId: number
    runId: number
    status: number
    payloadJson: number
    attemptCount: number
    maxAttempts: number
    lastError: number
    workerId: number
    leaseGeneration: number
    leaseExpiresAt: number
    idempotencyKey: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ExecutionJobAvgAggregateInputType = {
    attemptCount?: true
    maxAttempts?: true
    leaseGeneration?: true
  }

  export type ExecutionJobSumAggregateInputType = {
    attemptCount?: true
    maxAttempts?: true
    leaseGeneration?: true
  }

  export type ExecutionJobMinAggregateInputType = {
    id?: true
    tenantId?: true
    runId?: true
    status?: true
    payloadJson?: true
    attemptCount?: true
    maxAttempts?: true
    lastError?: true
    workerId?: true
    leaseGeneration?: true
    leaseExpiresAt?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ExecutionJobMaxAggregateInputType = {
    id?: true
    tenantId?: true
    runId?: true
    status?: true
    payloadJson?: true
    attemptCount?: true
    maxAttempts?: true
    lastError?: true
    workerId?: true
    leaseGeneration?: true
    leaseExpiresAt?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ExecutionJobCountAggregateInputType = {
    id?: true
    tenantId?: true
    runId?: true
    status?: true
    payloadJson?: true
    attemptCount?: true
    maxAttempts?: true
    lastError?: true
    workerId?: true
    leaseGeneration?: true
    leaseExpiresAt?: true
    idempotencyKey?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ExecutionJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionJob to aggregate.
     */
    where?: ExecutionJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionJobs to fetch.
     */
    orderBy?: ExecutionJobOrderByWithRelationInput | ExecutionJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExecutionJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExecutionJobs
    **/
    _count?: true | ExecutionJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExecutionJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExecutionJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExecutionJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExecutionJobMaxAggregateInputType
  }

  export type GetExecutionJobAggregateType<T extends ExecutionJobAggregateArgs> = {
        [P in keyof T & keyof AggregateExecutionJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExecutionJob[P]>
      : GetScalarType<T[P], AggregateExecutionJob[P]>
  }




  export type ExecutionJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExecutionJobWhereInput
    orderBy?: ExecutionJobOrderByWithAggregationInput | ExecutionJobOrderByWithAggregationInput[]
    by: ExecutionJobScalarFieldEnum[] | ExecutionJobScalarFieldEnum
    having?: ExecutionJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExecutionJobCountAggregateInputType | true
    _avg?: ExecutionJobAvgAggregateInputType
    _sum?: ExecutionJobSumAggregateInputType
    _min?: ExecutionJobMinAggregateInputType
    _max?: ExecutionJobMaxAggregateInputType
  }

  export type ExecutionJobGroupByOutputType = {
    id: string
    tenantId: string
    runId: string
    status: string
    payloadJson: string
    attemptCount: number
    maxAttempts: number
    lastError: string | null
    workerId: string | null
    leaseGeneration: number
    leaseExpiresAt: Date | null
    idempotencyKey: string
    createdAt: Date
    updatedAt: Date
    _count: ExecutionJobCountAggregateOutputType | null
    _avg: ExecutionJobAvgAggregateOutputType | null
    _sum: ExecutionJobSumAggregateOutputType | null
    _min: ExecutionJobMinAggregateOutputType | null
    _max: ExecutionJobMaxAggregateOutputType | null
  }

  type GetExecutionJobGroupByPayload<T extends ExecutionJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExecutionJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExecutionJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExecutionJobGroupByOutputType[P]>
            : GetScalarType<T[P], ExecutionJobGroupByOutputType[P]>
        }
      >
    >


  export type ExecutionJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    runId?: boolean
    status?: boolean
    payloadJson?: boolean
    attemptCount?: boolean
    maxAttempts?: boolean
    lastError?: boolean
    workerId?: boolean
    leaseGeneration?: boolean
    leaseExpiresAt?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["executionJob"]>



  export type ExecutionJobSelectScalar = {
    id?: boolean
    tenantId?: boolean
    runId?: boolean
    status?: boolean
    payloadJson?: boolean
    attemptCount?: boolean
    maxAttempts?: boolean
    lastError?: boolean
    workerId?: boolean
    leaseGeneration?: boolean
    leaseExpiresAt?: boolean
    idempotencyKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ExecutionJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "runId" | "status" | "payloadJson" | "attemptCount" | "maxAttempts" | "lastError" | "workerId" | "leaseGeneration" | "leaseExpiresAt" | "idempotencyKey" | "createdAt" | "updatedAt", ExtArgs["result"]["executionJob"]>

  export type $ExecutionJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExecutionJob"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      runId: string
      status: string
      payloadJson: string
      attemptCount: number
      maxAttempts: number
      lastError: string | null
      workerId: string | null
      leaseGeneration: number
      leaseExpiresAt: Date | null
      idempotencyKey: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["executionJob"]>
    composites: {}
  }

  type ExecutionJobGetPayload<S extends boolean | null | undefined | ExecutionJobDefaultArgs> = $Result.GetResult<Prisma.$ExecutionJobPayload, S>

  type ExecutionJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExecutionJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExecutionJobCountAggregateInputType | true
    }

  export interface ExecutionJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExecutionJob'], meta: { name: 'ExecutionJob' } }
    /**
     * Find zero or one ExecutionJob that matches the filter.
     * @param {ExecutionJobFindUniqueArgs} args - Arguments to find a ExecutionJob
     * @example
     * // Get one ExecutionJob
     * const executionJob = await prisma.executionJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExecutionJobFindUniqueArgs>(args: SelectSubset<T, ExecutionJobFindUniqueArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one ExecutionJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExecutionJobFindUniqueOrThrowArgs} args - Arguments to find a ExecutionJob
     * @example
     * // Get one ExecutionJob
     * const executionJob = await prisma.executionJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExecutionJobFindUniqueOrThrowArgs>(args: SelectSubset<T, ExecutionJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first ExecutionJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobFindFirstArgs} args - Arguments to find a ExecutionJob
     * @example
     * // Get one ExecutionJob
     * const executionJob = await prisma.executionJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExecutionJobFindFirstArgs>(args?: SelectSubset<T, ExecutionJobFindFirstArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first ExecutionJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobFindFirstOrThrowArgs} args - Arguments to find a ExecutionJob
     * @example
     * // Get one ExecutionJob
     * const executionJob = await prisma.executionJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExecutionJobFindFirstOrThrowArgs>(args?: SelectSubset<T, ExecutionJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more ExecutionJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExecutionJobs
     * const executionJobs = await prisma.executionJob.findMany()
     * 
     * // Get first 10 ExecutionJobs
     * const executionJobs = await prisma.executionJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const executionJobWithIdOnly = await prisma.executionJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExecutionJobFindManyArgs>(args?: SelectSubset<T, ExecutionJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a ExecutionJob.
     * @param {ExecutionJobCreateArgs} args - Arguments to create a ExecutionJob.
     * @example
     * // Create one ExecutionJob
     * const ExecutionJob = await prisma.executionJob.create({
     *   data: {
     *     // ... data to create a ExecutionJob
     *   }
     * })
     * 
     */
    create<T extends ExecutionJobCreateArgs>(args: SelectSubset<T, ExecutionJobCreateArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many ExecutionJobs.
     * @param {ExecutionJobCreateManyArgs} args - Arguments to create many ExecutionJobs.
     * @example
     * // Create many ExecutionJobs
     * const executionJob = await prisma.executionJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExecutionJobCreateManyArgs>(args?: SelectSubset<T, ExecutionJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ExecutionJob.
     * @param {ExecutionJobDeleteArgs} args - Arguments to delete one ExecutionJob.
     * @example
     * // Delete one ExecutionJob
     * const ExecutionJob = await prisma.executionJob.delete({
     *   where: {
     *     // ... filter to delete one ExecutionJob
     *   }
     * })
     * 
     */
    delete<T extends ExecutionJobDeleteArgs>(args: SelectSubset<T, ExecutionJobDeleteArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one ExecutionJob.
     * @param {ExecutionJobUpdateArgs} args - Arguments to update one ExecutionJob.
     * @example
     * // Update one ExecutionJob
     * const executionJob = await prisma.executionJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExecutionJobUpdateArgs>(args: SelectSubset<T, ExecutionJobUpdateArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more ExecutionJobs.
     * @param {ExecutionJobDeleteManyArgs} args - Arguments to filter ExecutionJobs to delete.
     * @example
     * // Delete a few ExecutionJobs
     * const { count } = await prisma.executionJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExecutionJobDeleteManyArgs>(args?: SelectSubset<T, ExecutionJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExecutionJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExecutionJobs
     * const executionJob = await prisma.executionJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExecutionJobUpdateManyArgs>(args: SelectSubset<T, ExecutionJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExecutionJob.
     * @param {ExecutionJobUpsertArgs} args - Arguments to update or create a ExecutionJob.
     * @example
     * // Update or create a ExecutionJob
     * const executionJob = await prisma.executionJob.upsert({
     *   create: {
     *     // ... data to create a ExecutionJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExecutionJob we want to update
     *   }
     * })
     */
    upsert<T extends ExecutionJobUpsertArgs>(args: SelectSubset<T, ExecutionJobUpsertArgs<ExtArgs>>): Prisma__ExecutionJobClient<$Result.GetResult<Prisma.$ExecutionJobPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more ExecutionJobs that matches the filter.
     * @param {ExecutionJobFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const executionJob = await prisma.executionJob.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ExecutionJobFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ExecutionJob.
     * @param {ExecutionJobAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const executionJob = await prisma.executionJob.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ExecutionJobAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ExecutionJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobCountArgs} args - Arguments to filter ExecutionJobs to count.
     * @example
     * // Count the number of ExecutionJobs
     * const count = await prisma.executionJob.count({
     *   where: {
     *     // ... the filter for the ExecutionJobs we want to count
     *   }
     * })
    **/
    count<T extends ExecutionJobCountArgs>(
      args?: Subset<T, ExecutionJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExecutionJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExecutionJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExecutionJobAggregateArgs>(args: Subset<T, ExecutionJobAggregateArgs>): Prisma.PrismaPromise<GetExecutionJobAggregateType<T>>

    /**
     * Group by ExecutionJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExecutionJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExecutionJobGroupByArgs['orderBy'] }
        : { orderBy?: ExecutionJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExecutionJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExecutionJob model
   */
  readonly fields: ExecutionJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExecutionJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExecutionJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExecutionJob model
   */ 
  interface ExecutionJobFieldRefs {
    readonly id: FieldRef<"ExecutionJob", 'String'>
    readonly tenantId: FieldRef<"ExecutionJob", 'String'>
    readonly runId: FieldRef<"ExecutionJob", 'String'>
    readonly status: FieldRef<"ExecutionJob", 'String'>
    readonly payloadJson: FieldRef<"ExecutionJob", 'String'>
    readonly attemptCount: FieldRef<"ExecutionJob", 'Int'>
    readonly maxAttempts: FieldRef<"ExecutionJob", 'Int'>
    readonly lastError: FieldRef<"ExecutionJob", 'String'>
    readonly workerId: FieldRef<"ExecutionJob", 'String'>
    readonly leaseGeneration: FieldRef<"ExecutionJob", 'Int'>
    readonly leaseExpiresAt: FieldRef<"ExecutionJob", 'DateTime'>
    readonly idempotencyKey: FieldRef<"ExecutionJob", 'String'>
    readonly createdAt: FieldRef<"ExecutionJob", 'DateTime'>
    readonly updatedAt: FieldRef<"ExecutionJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ExecutionJob findUnique
   */
  export type ExecutionJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter, which ExecutionJob to fetch.
     */
    where: ExecutionJobWhereUniqueInput
  }

  /**
   * ExecutionJob findUniqueOrThrow
   */
  export type ExecutionJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter, which ExecutionJob to fetch.
     */
    where: ExecutionJobWhereUniqueInput
  }

  /**
   * ExecutionJob findFirst
   */
  export type ExecutionJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter, which ExecutionJob to fetch.
     */
    where?: ExecutionJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionJobs to fetch.
     */
    orderBy?: ExecutionJobOrderByWithRelationInput | ExecutionJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExecutionJobs.
     */
    cursor?: ExecutionJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExecutionJobs.
     */
    distinct?: ExecutionJobScalarFieldEnum | ExecutionJobScalarFieldEnum[]
  }

  /**
   * ExecutionJob findFirstOrThrow
   */
  export type ExecutionJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter, which ExecutionJob to fetch.
     */
    where?: ExecutionJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionJobs to fetch.
     */
    orderBy?: ExecutionJobOrderByWithRelationInput | ExecutionJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExecutionJobs.
     */
    cursor?: ExecutionJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExecutionJobs.
     */
    distinct?: ExecutionJobScalarFieldEnum | ExecutionJobScalarFieldEnum[]
  }

  /**
   * ExecutionJob findMany
   */
  export type ExecutionJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter, which ExecutionJobs to fetch.
     */
    where?: ExecutionJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionJobs to fetch.
     */
    orderBy?: ExecutionJobOrderByWithRelationInput | ExecutionJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExecutionJobs.
     */
    cursor?: ExecutionJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionJobs.
     */
    skip?: number
    distinct?: ExecutionJobScalarFieldEnum | ExecutionJobScalarFieldEnum[]
  }

  /**
   * ExecutionJob create
   */
  export type ExecutionJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * The data needed to create a ExecutionJob.
     */
    data: XOR<ExecutionJobCreateInput, ExecutionJobUncheckedCreateInput>
  }

  /**
   * ExecutionJob createMany
   */
  export type ExecutionJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExecutionJobs.
     */
    data: ExecutionJobCreateManyInput | ExecutionJobCreateManyInput[]
  }

  /**
   * ExecutionJob update
   */
  export type ExecutionJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * The data needed to update a ExecutionJob.
     */
    data: XOR<ExecutionJobUpdateInput, ExecutionJobUncheckedUpdateInput>
    /**
     * Choose, which ExecutionJob to update.
     */
    where: ExecutionJobWhereUniqueInput
  }

  /**
   * ExecutionJob updateMany
   */
  export type ExecutionJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExecutionJobs.
     */
    data: XOR<ExecutionJobUpdateManyMutationInput, ExecutionJobUncheckedUpdateManyInput>
    /**
     * Filter which ExecutionJobs to update
     */
    where?: ExecutionJobWhereInput
    /**
     * Limit how many ExecutionJobs to update.
     */
    limit?: number
  }

  /**
   * ExecutionJob upsert
   */
  export type ExecutionJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * The filter to search for the ExecutionJob to update in case it exists.
     */
    where: ExecutionJobWhereUniqueInput
    /**
     * In case the ExecutionJob found by the `where` argument doesn't exist, create a new ExecutionJob with this data.
     */
    create: XOR<ExecutionJobCreateInput, ExecutionJobUncheckedCreateInput>
    /**
     * In case the ExecutionJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExecutionJobUpdateInput, ExecutionJobUncheckedUpdateInput>
  }

  /**
   * ExecutionJob delete
   */
  export type ExecutionJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
    /**
     * Filter which ExecutionJob to delete.
     */
    where: ExecutionJobWhereUniqueInput
  }

  /**
   * ExecutionJob deleteMany
   */
  export type ExecutionJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionJobs to delete
     */
    where?: ExecutionJobWhereInput
    /**
     * Limit how many ExecutionJobs to delete.
     */
    limit?: number
  }

  /**
   * ExecutionJob findRaw
   */
  export type ExecutionJobFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ExecutionJob aggregateRaw
   */
  export type ExecutionJobAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ExecutionJob without action
   */
  export type ExecutionJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionJob
     */
    select?: ExecutionJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionJob
     */
    omit?: ExecutionJobOmit<ExtArgs> | null
  }


  /**
   * Model MetricSnapshot
   */

  export type AggregateMetricSnapshot = {
    _count: MetricSnapshotCountAggregateOutputType | null
    _avg: MetricSnapshotAvgAggregateOutputType | null
    _sum: MetricSnapshotSumAggregateOutputType | null
    _min: MetricSnapshotMinAggregateOutputType | null
    _max: MetricSnapshotMaxAggregateOutputType | null
  }

  export type MetricSnapshotAvgAggregateOutputType = {
    value: number | null
  }

  export type MetricSnapshotSumAggregateOutputType = {
    value: number | null
  }

  export type MetricSnapshotMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    metricName: string | null
    value: number | null
    labelsJson: string | null
    timestamp: Date | null
  }

  export type MetricSnapshotMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    metricName: string | null
    value: number | null
    labelsJson: string | null
    timestamp: Date | null
  }

  export type MetricSnapshotCountAggregateOutputType = {
    id: number
    tenantId: number
    metricName: number
    value: number
    labelsJson: number
    timestamp: number
    _all: number
  }


  export type MetricSnapshotAvgAggregateInputType = {
    value?: true
  }

  export type MetricSnapshotSumAggregateInputType = {
    value?: true
  }

  export type MetricSnapshotMinAggregateInputType = {
    id?: true
    tenantId?: true
    metricName?: true
    value?: true
    labelsJson?: true
    timestamp?: true
  }

  export type MetricSnapshotMaxAggregateInputType = {
    id?: true
    tenantId?: true
    metricName?: true
    value?: true
    labelsJson?: true
    timestamp?: true
  }

  export type MetricSnapshotCountAggregateInputType = {
    id?: true
    tenantId?: true
    metricName?: true
    value?: true
    labelsJson?: true
    timestamp?: true
    _all?: true
  }

  export type MetricSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricSnapshot to aggregate.
     */
    where?: MetricSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricSnapshots to fetch.
     */
    orderBy?: MetricSnapshotOrderByWithRelationInput | MetricSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MetricSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MetricSnapshots
    **/
    _count?: true | MetricSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MetricSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MetricSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MetricSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MetricSnapshotMaxAggregateInputType
  }

  export type GetMetricSnapshotAggregateType<T extends MetricSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateMetricSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMetricSnapshot[P]>
      : GetScalarType<T[P], AggregateMetricSnapshot[P]>
  }




  export type MetricSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricSnapshotWhereInput
    orderBy?: MetricSnapshotOrderByWithAggregationInput | MetricSnapshotOrderByWithAggregationInput[]
    by: MetricSnapshotScalarFieldEnum[] | MetricSnapshotScalarFieldEnum
    having?: MetricSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MetricSnapshotCountAggregateInputType | true
    _avg?: MetricSnapshotAvgAggregateInputType
    _sum?: MetricSnapshotSumAggregateInputType
    _min?: MetricSnapshotMinAggregateInputType
    _max?: MetricSnapshotMaxAggregateInputType
  }

  export type MetricSnapshotGroupByOutputType = {
    id: string
    tenantId: string
    metricName: string
    value: number
    labelsJson: string
    timestamp: Date
    _count: MetricSnapshotCountAggregateOutputType | null
    _avg: MetricSnapshotAvgAggregateOutputType | null
    _sum: MetricSnapshotSumAggregateOutputType | null
    _min: MetricSnapshotMinAggregateOutputType | null
    _max: MetricSnapshotMaxAggregateOutputType | null
  }

  type GetMetricSnapshotGroupByPayload<T extends MetricSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MetricSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MetricSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MetricSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], MetricSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type MetricSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    metricName?: boolean
    value?: boolean
    labelsJson?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["metricSnapshot"]>



  export type MetricSnapshotSelectScalar = {
    id?: boolean
    tenantId?: boolean
    metricName?: boolean
    value?: boolean
    labelsJson?: boolean
    timestamp?: boolean
  }

  export type MetricSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "metricName" | "value" | "labelsJson" | "timestamp", ExtArgs["result"]["metricSnapshot"]>

  export type $MetricSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MetricSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      metricName: string
      value: number
      labelsJson: string
      timestamp: Date
    }, ExtArgs["result"]["metricSnapshot"]>
    composites: {}
  }

  type MetricSnapshotGetPayload<S extends boolean | null | undefined | MetricSnapshotDefaultArgs> = $Result.GetResult<Prisma.$MetricSnapshotPayload, S>

  type MetricSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MetricSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MetricSnapshotCountAggregateInputType | true
    }

  export interface MetricSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MetricSnapshot'], meta: { name: 'MetricSnapshot' } }
    /**
     * Find zero or one MetricSnapshot that matches the filter.
     * @param {MetricSnapshotFindUniqueArgs} args - Arguments to find a MetricSnapshot
     * @example
     * // Get one MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MetricSnapshotFindUniqueArgs>(args: SelectSubset<T, MetricSnapshotFindUniqueArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one MetricSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MetricSnapshotFindUniqueOrThrowArgs} args - Arguments to find a MetricSnapshot
     * @example
     * // Get one MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MetricSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, MetricSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first MetricSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotFindFirstArgs} args - Arguments to find a MetricSnapshot
     * @example
     * // Get one MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MetricSnapshotFindFirstArgs>(args?: SelectSubset<T, MetricSnapshotFindFirstArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first MetricSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotFindFirstOrThrowArgs} args - Arguments to find a MetricSnapshot
     * @example
     * // Get one MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MetricSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, MetricSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more MetricSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MetricSnapshots
     * const metricSnapshots = await prisma.metricSnapshot.findMany()
     * 
     * // Get first 10 MetricSnapshots
     * const metricSnapshots = await prisma.metricSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const metricSnapshotWithIdOnly = await prisma.metricSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MetricSnapshotFindManyArgs>(args?: SelectSubset<T, MetricSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a MetricSnapshot.
     * @param {MetricSnapshotCreateArgs} args - Arguments to create a MetricSnapshot.
     * @example
     * // Create one MetricSnapshot
     * const MetricSnapshot = await prisma.metricSnapshot.create({
     *   data: {
     *     // ... data to create a MetricSnapshot
     *   }
     * })
     * 
     */
    create<T extends MetricSnapshotCreateArgs>(args: SelectSubset<T, MetricSnapshotCreateArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many MetricSnapshots.
     * @param {MetricSnapshotCreateManyArgs} args - Arguments to create many MetricSnapshots.
     * @example
     * // Create many MetricSnapshots
     * const metricSnapshot = await prisma.metricSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MetricSnapshotCreateManyArgs>(args?: SelectSubset<T, MetricSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MetricSnapshot.
     * @param {MetricSnapshotDeleteArgs} args - Arguments to delete one MetricSnapshot.
     * @example
     * // Delete one MetricSnapshot
     * const MetricSnapshot = await prisma.metricSnapshot.delete({
     *   where: {
     *     // ... filter to delete one MetricSnapshot
     *   }
     * })
     * 
     */
    delete<T extends MetricSnapshotDeleteArgs>(args: SelectSubset<T, MetricSnapshotDeleteArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one MetricSnapshot.
     * @param {MetricSnapshotUpdateArgs} args - Arguments to update one MetricSnapshot.
     * @example
     * // Update one MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MetricSnapshotUpdateArgs>(args: SelectSubset<T, MetricSnapshotUpdateArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more MetricSnapshots.
     * @param {MetricSnapshotDeleteManyArgs} args - Arguments to filter MetricSnapshots to delete.
     * @example
     * // Delete a few MetricSnapshots
     * const { count } = await prisma.metricSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MetricSnapshotDeleteManyArgs>(args?: SelectSubset<T, MetricSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MetricSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MetricSnapshots
     * const metricSnapshot = await prisma.metricSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MetricSnapshotUpdateManyArgs>(args: SelectSubset<T, MetricSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MetricSnapshot.
     * @param {MetricSnapshotUpsertArgs} args - Arguments to update or create a MetricSnapshot.
     * @example
     * // Update or create a MetricSnapshot
     * const metricSnapshot = await prisma.metricSnapshot.upsert({
     *   create: {
     *     // ... data to create a MetricSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MetricSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends MetricSnapshotUpsertArgs>(args: SelectSubset<T, MetricSnapshotUpsertArgs<ExtArgs>>): Prisma__MetricSnapshotClient<$Result.GetResult<Prisma.$MetricSnapshotPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more MetricSnapshots that matches the filter.
     * @param {MetricSnapshotFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const metricSnapshot = await prisma.metricSnapshot.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: MetricSnapshotFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a MetricSnapshot.
     * @param {MetricSnapshotAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const metricSnapshot = await prisma.metricSnapshot.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: MetricSnapshotAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of MetricSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotCountArgs} args - Arguments to filter MetricSnapshots to count.
     * @example
     * // Count the number of MetricSnapshots
     * const count = await prisma.metricSnapshot.count({
     *   where: {
     *     // ... the filter for the MetricSnapshots we want to count
     *   }
     * })
    **/
    count<T extends MetricSnapshotCountArgs>(
      args?: Subset<T, MetricSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MetricSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MetricSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MetricSnapshotAggregateArgs>(args: Subset<T, MetricSnapshotAggregateArgs>): Prisma.PrismaPromise<GetMetricSnapshotAggregateType<T>>

    /**
     * Group by MetricSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MetricSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MetricSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: MetricSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MetricSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMetricSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MetricSnapshot model
   */
  readonly fields: MetricSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MetricSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MetricSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MetricSnapshot model
   */ 
  interface MetricSnapshotFieldRefs {
    readonly id: FieldRef<"MetricSnapshot", 'String'>
    readonly tenantId: FieldRef<"MetricSnapshot", 'String'>
    readonly metricName: FieldRef<"MetricSnapshot", 'String'>
    readonly value: FieldRef<"MetricSnapshot", 'Float'>
    readonly labelsJson: FieldRef<"MetricSnapshot", 'String'>
    readonly timestamp: FieldRef<"MetricSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MetricSnapshot findUnique
   */
  export type MetricSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which MetricSnapshot to fetch.
     */
    where: MetricSnapshotWhereUniqueInput
  }

  /**
   * MetricSnapshot findUniqueOrThrow
   */
  export type MetricSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which MetricSnapshot to fetch.
     */
    where: MetricSnapshotWhereUniqueInput
  }

  /**
   * MetricSnapshot findFirst
   */
  export type MetricSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which MetricSnapshot to fetch.
     */
    where?: MetricSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricSnapshots to fetch.
     */
    orderBy?: MetricSnapshotOrderByWithRelationInput | MetricSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricSnapshots.
     */
    cursor?: MetricSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricSnapshots.
     */
    distinct?: MetricSnapshotScalarFieldEnum | MetricSnapshotScalarFieldEnum[]
  }

  /**
   * MetricSnapshot findFirstOrThrow
   */
  export type MetricSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which MetricSnapshot to fetch.
     */
    where?: MetricSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricSnapshots to fetch.
     */
    orderBy?: MetricSnapshotOrderByWithRelationInput | MetricSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricSnapshots.
     */
    cursor?: MetricSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricSnapshots.
     */
    distinct?: MetricSnapshotScalarFieldEnum | MetricSnapshotScalarFieldEnum[]
  }

  /**
   * MetricSnapshot findMany
   */
  export type MetricSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which MetricSnapshots to fetch.
     */
    where?: MetricSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricSnapshots to fetch.
     */
    orderBy?: MetricSnapshotOrderByWithRelationInput | MetricSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MetricSnapshots.
     */
    cursor?: MetricSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricSnapshots.
     */
    skip?: number
    distinct?: MetricSnapshotScalarFieldEnum | MetricSnapshotScalarFieldEnum[]
  }

  /**
   * MetricSnapshot create
   */
  export type MetricSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a MetricSnapshot.
     */
    data: XOR<MetricSnapshotCreateInput, MetricSnapshotUncheckedCreateInput>
  }

  /**
   * MetricSnapshot createMany
   */
  export type MetricSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MetricSnapshots.
     */
    data: MetricSnapshotCreateManyInput | MetricSnapshotCreateManyInput[]
  }

  /**
   * MetricSnapshot update
   */
  export type MetricSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a MetricSnapshot.
     */
    data: XOR<MetricSnapshotUpdateInput, MetricSnapshotUncheckedUpdateInput>
    /**
     * Choose, which MetricSnapshot to update.
     */
    where: MetricSnapshotWhereUniqueInput
  }

  /**
   * MetricSnapshot updateMany
   */
  export type MetricSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MetricSnapshots.
     */
    data: XOR<MetricSnapshotUpdateManyMutationInput, MetricSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which MetricSnapshots to update
     */
    where?: MetricSnapshotWhereInput
    /**
     * Limit how many MetricSnapshots to update.
     */
    limit?: number
  }

  /**
   * MetricSnapshot upsert
   */
  export type MetricSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the MetricSnapshot to update in case it exists.
     */
    where: MetricSnapshotWhereUniqueInput
    /**
     * In case the MetricSnapshot found by the `where` argument doesn't exist, create a new MetricSnapshot with this data.
     */
    create: XOR<MetricSnapshotCreateInput, MetricSnapshotUncheckedCreateInput>
    /**
     * In case the MetricSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MetricSnapshotUpdateInput, MetricSnapshotUncheckedUpdateInput>
  }

  /**
   * MetricSnapshot delete
   */
  export type MetricSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
    /**
     * Filter which MetricSnapshot to delete.
     */
    where: MetricSnapshotWhereUniqueInput
  }

  /**
   * MetricSnapshot deleteMany
   */
  export type MetricSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricSnapshots to delete
     */
    where?: MetricSnapshotWhereInput
    /**
     * Limit how many MetricSnapshots to delete.
     */
    limit?: number
  }

  /**
   * MetricSnapshot findRaw
   */
  export type MetricSnapshotFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * MetricSnapshot aggregateRaw
   */
  export type MetricSnapshotAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * MetricSnapshot without action
   */
  export type MetricSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricSnapshot
     */
    select?: MetricSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricSnapshot
     */
    omit?: MetricSnapshotOmit<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    correlationId: string | null
    action: string | null
    actor: string | null
    detailsJson: string | null
    timestamp: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    correlationId: string | null
    action: string | null
    actor: string | null
    detailsJson: string | null
    timestamp: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    tenantId: number
    correlationId: number
    action: number
    actor: number
    detailsJson: number
    timestamp: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    tenantId?: true
    correlationId?: true
    action?: true
    actor?: true
    detailsJson?: true
    timestamp?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    tenantId?: true
    correlationId?: true
    action?: true
    actor?: true
    detailsJson?: true
    timestamp?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    tenantId?: true
    correlationId?: true
    action?: true
    actor?: true
    detailsJson?: true
    timestamp?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    tenantId: string
    correlationId: string
    action: string
    actor: string
    detailsJson: string
    timestamp: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    correlationId?: boolean
    action?: boolean
    actor?: boolean
    detailsJson?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["auditLog"]>



  export type AuditLogSelectScalar = {
    id?: boolean
    tenantId?: boolean
    correlationId?: boolean
    action?: boolean
    actor?: boolean
    detailsJson?: boolean
    timestamp?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "correlationId" | "action" | "actor" | "detailsJson" | "timestamp", ExtArgs["result"]["auditLog"]>

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      correlationId: string
      action: string
      actor: string
      detailsJson: string
      timestamp: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * @param {AuditLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const auditLog = await prisma.auditLog.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AuditLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AuditLog.
     * @param {AuditLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const auditLog = await prisma.auditLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AuditLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */ 
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly tenantId: FieldRef<"AuditLog", 'String'>
    readonly correlationId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly actor: FieldRef<"AuditLog", 'String'>
    readonly detailsJson: FieldRef<"AuditLog", 'String'>
    readonly timestamp: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog findRaw
   */
  export type AuditLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AuditLog aggregateRaw
   */
  export type AuditLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const CustomerScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    email: 'email',
    tier: 'tier',
    riskScore: 'riskScore',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    price: 'price',
    stockQuantity: 'stockQuantity',
    replacementEligible: 'replacementEligible',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const OrderScalarFieldEnum: {
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

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderItemScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    quantity: 'quantity',
    unitPrice: 'unitPrice'
  };

  export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum]


  export const TicketScalarFieldEnum: {
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

  export type TicketScalarFieldEnum = (typeof TicketScalarFieldEnum)[keyof typeof TicketScalarFieldEnum]


  export const PolicyVersionScalarFieldEnum: {
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

  export type PolicyVersionScalarFieldEnum = (typeof PolicyVersionScalarFieldEnum)[keyof typeof PolicyVersionScalarFieldEnum]


  export const AgentRunScalarFieldEnum: {
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

  export type AgentRunScalarFieldEnum = (typeof AgentRunScalarFieldEnum)[keyof typeof AgentRunScalarFieldEnum]


  export const AgentTraceScalarFieldEnum: {
    id: 'id',
    agentRunId: 'agentRunId',
    ticketId: 'ticketId',
    step: 'step',
    evidenceDetails: 'evidenceDetails',
    actor: 'actor',
    timestamp: 'timestamp'
  };

  export type AgentTraceScalarFieldEnum = (typeof AgentTraceScalarFieldEnum)[keyof typeof AgentTraceScalarFieldEnum]


  export const CaseRecordScalarFieldEnum: {
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

  export type CaseRecordScalarFieldEnum = (typeof CaseRecordScalarFieldEnum)[keyof typeof CaseRecordScalarFieldEnum]


  export const RefundTransactionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    orderId: 'orderId',
    amount: 'amount',
    currency: 'currency',
    status: 'status',
    idempotencyKey: 'idempotencyKey',
    createdAt: 'createdAt'
  };

  export type RefundTransactionScalarFieldEnum = (typeof RefundTransactionScalarFieldEnum)[keyof typeof RefundTransactionScalarFieldEnum]


  export const CouponScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    customerId: 'customerId',
    code: 'code',
    discount: 'discount',
    isRedeemed: 'isRedeemed',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type CouponScalarFieldEnum = (typeof CouponScalarFieldEnum)[keyof typeof CouponScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
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

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const ExecutionJobScalarFieldEnum: {
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

  export type ExecutionJobScalarFieldEnum = (typeof ExecutionJobScalarFieldEnum)[keyof typeof ExecutionJobScalarFieldEnum]


  export const MetricSnapshotScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    metricName: 'metricName',
    value: 'value',
    labelsJson: 'labelsJson',
    timestamp: 'timestamp'
  };

  export type MetricSnapshotScalarFieldEnum = (typeof MetricSnapshotScalarFieldEnum)[keyof typeof MetricSnapshotScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    correlationId: 'correlationId',
    action: 'action',
    actor: 'actor',
    detailsJson: 'detailsJson',
    timestamp: 'timestamp'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: StringFilter<"Customer"> | string
    tenantId?: StringFilter<"Customer"> | string
    name?: StringFilter<"Customer"> | string
    email?: StringFilter<"Customer"> | string
    tier?: StringFilter<"Customer"> | string
    riskScore?: FloatFilter<"Customer"> | number
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    orders?: OrderListRelationFilter
    tickets?: TicketListRelationFilter
    coupons?: CouponListRelationFilter
    notifications?: NotificationListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    riskScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orders?: OrderOrderByRelationAggregateInput
    tickets?: TicketOrderByRelationAggregateInput
    coupons?: CouponOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    tenantId?: StringFilter<"Customer"> | string
    name?: StringFilter<"Customer"> | string
    tier?: StringFilter<"Customer"> | string
    riskScore?: FloatFilter<"Customer"> | number
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    orders?: OrderListRelationFilter
    tickets?: TicketListRelationFilter
    coupons?: CouponListRelationFilter
    notifications?: NotificationListRelationFilter
  }, "id" | "email">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    riskScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _avg?: CustomerAvgOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
    _sum?: CustomerSumOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Customer"> | string
    tenantId?: StringWithAggregatesFilter<"Customer"> | string
    name?: StringWithAggregatesFilter<"Customer"> | string
    email?: StringWithAggregatesFilter<"Customer"> | string
    tier?: StringWithAggregatesFilter<"Customer"> | string
    riskScore?: FloatWithAggregatesFilter<"Customer"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    price?: FloatFilter<"Product"> | number
    stockQuantity?: IntFilter<"Product"> | number
    replacementEligible?: BoolFilter<"Product"> | boolean
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    replacementEligible?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orderItems?: OrderItemOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    price?: FloatFilter<"Product"> | number
    stockQuantity?: IntFilter<"Product"> | number
    replacementEligible?: BoolFilter<"Product"> | boolean
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    replacementEligible?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    category?: StringWithAggregatesFilter<"Product"> | string
    price?: FloatWithAggregatesFilter<"Product"> | number
    stockQuantity?: IntWithAggregatesFilter<"Product"> | number
    replacementEligible?: BoolWithAggregatesFilter<"Product"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    tenantId?: StringFilter<"Order"> | string
    customerId?: StringFilter<"Order"> | string
    status?: StringFilter<"Order"> | string
    totalAmount?: FloatFilter<"Order"> | number
    currency?: StringFilter<"Order"> | string
    deliveryDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    shippingStatus?: StringFilter<"Order"> | string
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    items?: OrderItemListRelationFilter
    tickets?: TicketListRelationFilter
    refunds?: RefundTransactionListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    deliveryDate?: SortOrder
    shippingStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    customer?: CustomerOrderByWithRelationInput
    items?: OrderItemOrderByRelationAggregateInput
    tickets?: TicketOrderByRelationAggregateInput
    refunds?: RefundTransactionOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    tenantId?: StringFilter<"Order"> | string
    customerId?: StringFilter<"Order"> | string
    status?: StringFilter<"Order"> | string
    totalAmount?: FloatFilter<"Order"> | number
    currency?: StringFilter<"Order"> | string
    deliveryDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    shippingStatus?: StringFilter<"Order"> | string
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    items?: OrderItemListRelationFilter
    tickets?: TicketListRelationFilter
    refunds?: RefundTransactionListRelationFilter
  }, "id">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    deliveryDate?: SortOrder
    shippingStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    tenantId?: StringWithAggregatesFilter<"Order"> | string
    customerId?: StringWithAggregatesFilter<"Order"> | string
    status?: StringWithAggregatesFilter<"Order"> | string
    totalAmount?: FloatWithAggregatesFilter<"Order"> | number
    currency?: StringWithAggregatesFilter<"Order"> | string
    deliveryDate?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    shippingStatus?: StringWithAggregatesFilter<"Order"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderItemWhereInput = {
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    unitPrice?: FloatFilter<"OrderItem"> | number
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type OrderItemOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    order?: OrderOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type OrderItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    unitPrice?: FloatFilter<"OrderItem"> | number
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type OrderItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    _count?: OrderItemCountOrderByAggregateInput
    _avg?: OrderItemAvgOrderByAggregateInput
    _max?: OrderItemMaxOrderByAggregateInput
    _min?: OrderItemMinOrderByAggregateInput
    _sum?: OrderItemSumOrderByAggregateInput
  }

  export type OrderItemScalarWhereWithAggregatesInput = {
    AND?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    OR?: OrderItemScalarWhereWithAggregatesInput[]
    NOT?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrderItem"> | string
    orderId?: StringWithAggregatesFilter<"OrderItem"> | string
    productId?: StringWithAggregatesFilter<"OrderItem"> | string
    quantity?: IntWithAggregatesFilter<"OrderItem"> | number
    unitPrice?: FloatWithAggregatesFilter<"OrderItem"> | number
  }

  export type TicketWhereInput = {
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    id?: StringFilter<"Ticket"> | string
    tenantId?: StringFilter<"Ticket"> | string
    customerId?: StringFilter<"Ticket"> | string
    orderId?: StringNullableFilter<"Ticket"> | string | null
    issueType?: StringFilter<"Ticket"> | string
    customerMessage?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    resolutionSummary?: StringNullableFilter<"Ticket"> | string | null
    refundAmount?: FloatNullableFilter<"Ticket"> | number | null
    replacementSku?: StringNullableFilter<"Ticket"> | string | null
    requiresApproval?: BoolFilter<"Ticket"> | boolean
    requiresConsent?: BoolFilter<"Ticket"> | boolean
    approvalStatus?: StringNullableFilter<"Ticket"> | string | null
    consentStatus?: StringNullableFilter<"Ticket"> | string | null
    approvalToken?: StringNullableFilter<"Ticket"> | string | null
    idempotencyKey?: StringNullableFilter<"Ticket"> | string | null
    resolvedAt?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    order?: XOR<OrderNullableScalarRelationFilter, OrderWhereInput> | null
    agentRuns?: AgentRunListRelationFilter
    traces?: AgentTraceListRelationFilter
    caseRecords?: CaseRecordListRelationFilter
  }

  export type TicketOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    refundAmount?: SortOrder
    replacementSku?: SortOrder
    requiresApproval?: SortOrder
    requiresConsent?: SortOrder
    approvalStatus?: SortOrder
    consentStatus?: SortOrder
    approvalToken?: SortOrder
    idempotencyKey?: SortOrder
    resolvedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    customer?: CustomerOrderByWithRelationInput
    order?: OrderOrderByWithRelationInput
    agentRuns?: AgentRunOrderByRelationAggregateInput
    traces?: AgentTraceOrderByRelationAggregateInput
    caseRecords?: CaseRecordOrderByRelationAggregateInput
  }

  export type TicketWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    tenantId?: StringFilter<"Ticket"> | string
    customerId?: StringFilter<"Ticket"> | string
    orderId?: StringNullableFilter<"Ticket"> | string | null
    issueType?: StringFilter<"Ticket"> | string
    customerMessage?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    resolutionSummary?: StringNullableFilter<"Ticket"> | string | null
    refundAmount?: FloatNullableFilter<"Ticket"> | number | null
    replacementSku?: StringNullableFilter<"Ticket"> | string | null
    requiresApproval?: BoolFilter<"Ticket"> | boolean
    requiresConsent?: BoolFilter<"Ticket"> | boolean
    approvalStatus?: StringNullableFilter<"Ticket"> | string | null
    consentStatus?: StringNullableFilter<"Ticket"> | string | null
    approvalToken?: StringNullableFilter<"Ticket"> | string | null
    resolvedAt?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    order?: XOR<OrderNullableScalarRelationFilter, OrderWhereInput> | null
    agentRuns?: AgentRunListRelationFilter
    traces?: AgentTraceListRelationFilter
    caseRecords?: CaseRecordListRelationFilter
  }, "id" | "idempotencyKey">

  export type TicketOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    refundAmount?: SortOrder
    replacementSku?: SortOrder
    requiresApproval?: SortOrder
    requiresConsent?: SortOrder
    approvalStatus?: SortOrder
    consentStatus?: SortOrder
    approvalToken?: SortOrder
    idempotencyKey?: SortOrder
    resolvedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TicketCountOrderByAggregateInput
    _avg?: TicketAvgOrderByAggregateInput
    _max?: TicketMaxOrderByAggregateInput
    _min?: TicketMinOrderByAggregateInput
    _sum?: TicketSumOrderByAggregateInput
  }

  export type TicketScalarWhereWithAggregatesInput = {
    AND?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    OR?: TicketScalarWhereWithAggregatesInput[]
    NOT?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Ticket"> | string
    tenantId?: StringWithAggregatesFilter<"Ticket"> | string
    customerId?: StringWithAggregatesFilter<"Ticket"> | string
    orderId?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    issueType?: StringWithAggregatesFilter<"Ticket"> | string
    customerMessage?: StringWithAggregatesFilter<"Ticket"> | string
    status?: StringWithAggregatesFilter<"Ticket"> | string
    resolutionSummary?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    refundAmount?: FloatNullableWithAggregatesFilter<"Ticket"> | number | null
    replacementSku?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    requiresApproval?: BoolWithAggregatesFilter<"Ticket"> | boolean
    requiresConsent?: BoolWithAggregatesFilter<"Ticket"> | boolean
    approvalStatus?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    consentStatus?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    approvalToken?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    idempotencyKey?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"Ticket"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Ticket"> | Date | string
  }

  export type PolicyVersionWhereInput = {
    AND?: PolicyVersionWhereInput | PolicyVersionWhereInput[]
    OR?: PolicyVersionWhereInput[]
    NOT?: PolicyVersionWhereInput | PolicyVersionWhereInput[]
    id?: StringFilter<"PolicyVersion"> | string
    tenantId?: StringFilter<"PolicyVersion"> | string
    policyId?: StringFilter<"PolicyVersion"> | string
    version?: IntFilter<"PolicyVersion"> | number
    rulesJson?: StringFilter<"PolicyVersion"> | string
    isActive?: BoolFilter<"PolicyVersion"> | boolean
    createdById?: StringFilter<"PolicyVersion"> | string
    createdAt?: DateTimeFilter<"PolicyVersion"> | Date | string
    updatedAt?: DateTimeFilter<"PolicyVersion"> | Date | string
  }

  export type PolicyVersionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    policyId?: SortOrder
    version?: SortOrder
    rulesJson?: SortOrder
    isActive?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PolicyVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    policyId_version?: PolicyVersionPolicyIdVersionCompoundUniqueInput
    AND?: PolicyVersionWhereInput | PolicyVersionWhereInput[]
    OR?: PolicyVersionWhereInput[]
    NOT?: PolicyVersionWhereInput | PolicyVersionWhereInput[]
    tenantId?: StringFilter<"PolicyVersion"> | string
    policyId?: StringFilter<"PolicyVersion"> | string
    version?: IntFilter<"PolicyVersion"> | number
    rulesJson?: StringFilter<"PolicyVersion"> | string
    isActive?: BoolFilter<"PolicyVersion"> | boolean
    createdById?: StringFilter<"PolicyVersion"> | string
    createdAt?: DateTimeFilter<"PolicyVersion"> | Date | string
    updatedAt?: DateTimeFilter<"PolicyVersion"> | Date | string
  }, "id" | "policyId_version">

  export type PolicyVersionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    policyId?: SortOrder
    version?: SortOrder
    rulesJson?: SortOrder
    isActive?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PolicyVersionCountOrderByAggregateInput
    _avg?: PolicyVersionAvgOrderByAggregateInput
    _max?: PolicyVersionMaxOrderByAggregateInput
    _min?: PolicyVersionMinOrderByAggregateInput
    _sum?: PolicyVersionSumOrderByAggregateInput
  }

  export type PolicyVersionScalarWhereWithAggregatesInput = {
    AND?: PolicyVersionScalarWhereWithAggregatesInput | PolicyVersionScalarWhereWithAggregatesInput[]
    OR?: PolicyVersionScalarWhereWithAggregatesInput[]
    NOT?: PolicyVersionScalarWhereWithAggregatesInput | PolicyVersionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PolicyVersion"> | string
    tenantId?: StringWithAggregatesFilter<"PolicyVersion"> | string
    policyId?: StringWithAggregatesFilter<"PolicyVersion"> | string
    version?: IntWithAggregatesFilter<"PolicyVersion"> | number
    rulesJson?: StringWithAggregatesFilter<"PolicyVersion"> | string
    isActive?: BoolWithAggregatesFilter<"PolicyVersion"> | boolean
    createdById?: StringWithAggregatesFilter<"PolicyVersion"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PolicyVersion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PolicyVersion"> | Date | string
  }

  export type AgentRunWhereInput = {
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    tenantId?: StringFilter<"AgentRun"> | string
    ticketId?: StringFilter<"AgentRun"> | string
    status?: StringFilter<"AgentRun"> | string
    intent?: StringNullableFilter<"AgentRun"> | string | null
    confidence?: FloatNullableFilter<"AgentRun"> | number | null
    executedTools?: StringNullableFilter<"AgentRun"> | string | null
    overallOutcome?: StringNullableFilter<"AgentRun"> | string | null
    idempotencyKey?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
    traces?: AgentTraceListRelationFilter
  }

  export type AgentRunOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    status?: SortOrder
    intent?: SortOrder
    confidence?: SortOrder
    executedTools?: SortOrder
    overallOutcome?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ticket?: TicketOrderByWithRelationInput
    traces?: AgentTraceOrderByRelationAggregateInput
  }

  export type AgentRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    tenantId?: StringFilter<"AgentRun"> | string
    ticketId?: StringFilter<"AgentRun"> | string
    status?: StringFilter<"AgentRun"> | string
    intent?: StringNullableFilter<"AgentRun"> | string | null
    confidence?: FloatNullableFilter<"AgentRun"> | number | null
    executedTools?: StringNullableFilter<"AgentRun"> | string | null
    overallOutcome?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
    traces?: AgentTraceListRelationFilter
  }, "id" | "idempotencyKey">

  export type AgentRunOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    status?: SortOrder
    intent?: SortOrder
    confidence?: SortOrder
    executedTools?: SortOrder
    overallOutcome?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AgentRunCountOrderByAggregateInput
    _avg?: AgentRunAvgOrderByAggregateInput
    _max?: AgentRunMaxOrderByAggregateInput
    _min?: AgentRunMinOrderByAggregateInput
    _sum?: AgentRunSumOrderByAggregateInput
  }

  export type AgentRunScalarWhereWithAggregatesInput = {
    AND?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    OR?: AgentRunScalarWhereWithAggregatesInput[]
    NOT?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentRun"> | string
    tenantId?: StringWithAggregatesFilter<"AgentRun"> | string
    ticketId?: StringWithAggregatesFilter<"AgentRun"> | string
    status?: StringWithAggregatesFilter<"AgentRun"> | string
    intent?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    confidence?: FloatNullableWithAggregatesFilter<"AgentRun"> | number | null
    executedTools?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    overallOutcome?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    idempotencyKey?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
  }

  export type AgentTraceWhereInput = {
    AND?: AgentTraceWhereInput | AgentTraceWhereInput[]
    OR?: AgentTraceWhereInput[]
    NOT?: AgentTraceWhereInput | AgentTraceWhereInput[]
    id?: StringFilter<"AgentTrace"> | string
    agentRunId?: StringFilter<"AgentTrace"> | string
    ticketId?: StringNullableFilter<"AgentTrace"> | string | null
    step?: StringFilter<"AgentTrace"> | string
    evidenceDetails?: StringFilter<"AgentTrace"> | string
    actor?: StringFilter<"AgentTrace"> | string
    timestamp?: DateTimeFilter<"AgentTrace"> | Date | string
    agentRun?: XOR<AgentRunScalarRelationFilter, AgentRunWhereInput>
    ticket?: XOR<TicketNullableScalarRelationFilter, TicketWhereInput> | null
  }

  export type AgentTraceOrderByWithRelationInput = {
    id?: SortOrder
    agentRunId?: SortOrder
    ticketId?: SortOrder
    step?: SortOrder
    evidenceDetails?: SortOrder
    actor?: SortOrder
    timestamp?: SortOrder
    agentRun?: AgentRunOrderByWithRelationInput
    ticket?: TicketOrderByWithRelationInput
  }

  export type AgentTraceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentTraceWhereInput | AgentTraceWhereInput[]
    OR?: AgentTraceWhereInput[]
    NOT?: AgentTraceWhereInput | AgentTraceWhereInput[]
    agentRunId?: StringFilter<"AgentTrace"> | string
    ticketId?: StringNullableFilter<"AgentTrace"> | string | null
    step?: StringFilter<"AgentTrace"> | string
    evidenceDetails?: StringFilter<"AgentTrace"> | string
    actor?: StringFilter<"AgentTrace"> | string
    timestamp?: DateTimeFilter<"AgentTrace"> | Date | string
    agentRun?: XOR<AgentRunScalarRelationFilter, AgentRunWhereInput>
    ticket?: XOR<TicketNullableScalarRelationFilter, TicketWhereInput> | null
  }, "id">

  export type AgentTraceOrderByWithAggregationInput = {
    id?: SortOrder
    agentRunId?: SortOrder
    ticketId?: SortOrder
    step?: SortOrder
    evidenceDetails?: SortOrder
    actor?: SortOrder
    timestamp?: SortOrder
    _count?: AgentTraceCountOrderByAggregateInput
    _max?: AgentTraceMaxOrderByAggregateInput
    _min?: AgentTraceMinOrderByAggregateInput
  }

  export type AgentTraceScalarWhereWithAggregatesInput = {
    AND?: AgentTraceScalarWhereWithAggregatesInput | AgentTraceScalarWhereWithAggregatesInput[]
    OR?: AgentTraceScalarWhereWithAggregatesInput[]
    NOT?: AgentTraceScalarWhereWithAggregatesInput | AgentTraceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentTrace"> | string
    agentRunId?: StringWithAggregatesFilter<"AgentTrace"> | string
    ticketId?: StringNullableWithAggregatesFilter<"AgentTrace"> | string | null
    step?: StringWithAggregatesFilter<"AgentTrace"> | string
    evidenceDetails?: StringWithAggregatesFilter<"AgentTrace"> | string
    actor?: StringWithAggregatesFilter<"AgentTrace"> | string
    timestamp?: DateTimeWithAggregatesFilter<"AgentTrace"> | Date | string
  }

  export type CaseRecordWhereInput = {
    AND?: CaseRecordWhereInput | CaseRecordWhereInput[]
    OR?: CaseRecordWhereInput[]
    NOT?: CaseRecordWhereInput | CaseRecordWhereInput[]
    id?: StringFilter<"CaseRecord"> | string
    tenantId?: StringFilter<"CaseRecord"> | string
    ticketId?: StringFilter<"CaseRecord"> | string
    orderId?: StringNullableFilter<"CaseRecord"> | string | null
    customerId?: StringFilter<"CaseRecord"> | string
    issueType?: StringFilter<"CaseRecord"> | string
    customerMessage?: StringFilter<"CaseRecord"> | string
    status?: StringFilter<"CaseRecord"> | string
    resolutionSummary?: StringNullableFilter<"CaseRecord"> | string | null
    requiresCustomerAction?: BoolFilter<"CaseRecord"> | boolean
    createdAt?: DateTimeFilter<"CaseRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CaseRecord"> | Date | string
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
  }

  export type CaseRecordOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    requiresCustomerAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ticket?: TicketOrderByWithRelationInput
  }

  export type CaseRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CaseRecordWhereInput | CaseRecordWhereInput[]
    OR?: CaseRecordWhereInput[]
    NOT?: CaseRecordWhereInput | CaseRecordWhereInput[]
    tenantId?: StringFilter<"CaseRecord"> | string
    ticketId?: StringFilter<"CaseRecord"> | string
    orderId?: StringNullableFilter<"CaseRecord"> | string | null
    customerId?: StringFilter<"CaseRecord"> | string
    issueType?: StringFilter<"CaseRecord"> | string
    customerMessage?: StringFilter<"CaseRecord"> | string
    status?: StringFilter<"CaseRecord"> | string
    resolutionSummary?: StringNullableFilter<"CaseRecord"> | string | null
    requiresCustomerAction?: BoolFilter<"CaseRecord"> | boolean
    createdAt?: DateTimeFilter<"CaseRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CaseRecord"> | Date | string
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
  }, "id">

  export type CaseRecordOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    requiresCustomerAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CaseRecordCountOrderByAggregateInput
    _max?: CaseRecordMaxOrderByAggregateInput
    _min?: CaseRecordMinOrderByAggregateInput
  }

  export type CaseRecordScalarWhereWithAggregatesInput = {
    AND?: CaseRecordScalarWhereWithAggregatesInput | CaseRecordScalarWhereWithAggregatesInput[]
    OR?: CaseRecordScalarWhereWithAggregatesInput[]
    NOT?: CaseRecordScalarWhereWithAggregatesInput | CaseRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CaseRecord"> | string
    tenantId?: StringWithAggregatesFilter<"CaseRecord"> | string
    ticketId?: StringWithAggregatesFilter<"CaseRecord"> | string
    orderId?: StringNullableWithAggregatesFilter<"CaseRecord"> | string | null
    customerId?: StringWithAggregatesFilter<"CaseRecord"> | string
    issueType?: StringWithAggregatesFilter<"CaseRecord"> | string
    customerMessage?: StringWithAggregatesFilter<"CaseRecord"> | string
    status?: StringWithAggregatesFilter<"CaseRecord"> | string
    resolutionSummary?: StringNullableWithAggregatesFilter<"CaseRecord"> | string | null
    requiresCustomerAction?: BoolWithAggregatesFilter<"CaseRecord"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CaseRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CaseRecord"> | Date | string
  }

  export type RefundTransactionWhereInput = {
    AND?: RefundTransactionWhereInput | RefundTransactionWhereInput[]
    OR?: RefundTransactionWhereInput[]
    NOT?: RefundTransactionWhereInput | RefundTransactionWhereInput[]
    id?: StringFilter<"RefundTransaction"> | string
    tenantId?: StringFilter<"RefundTransaction"> | string
    orderId?: StringFilter<"RefundTransaction"> | string
    amount?: FloatFilter<"RefundTransaction"> | number
    currency?: StringFilter<"RefundTransaction"> | string
    status?: StringFilter<"RefundTransaction"> | string
    idempotencyKey?: StringFilter<"RefundTransaction"> | string
    createdAt?: DateTimeFilter<"RefundTransaction"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }

  export type RefundTransactionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type RefundTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: RefundTransactionWhereInput | RefundTransactionWhereInput[]
    OR?: RefundTransactionWhereInput[]
    NOT?: RefundTransactionWhereInput | RefundTransactionWhereInput[]
    tenantId?: StringFilter<"RefundTransaction"> | string
    orderId?: StringFilter<"RefundTransaction"> | string
    amount?: FloatFilter<"RefundTransaction"> | number
    currency?: StringFilter<"RefundTransaction"> | string
    status?: StringFilter<"RefundTransaction"> | string
    createdAt?: DateTimeFilter<"RefundTransaction"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }, "id" | "idempotencyKey">

  export type RefundTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    _count?: RefundTransactionCountOrderByAggregateInput
    _avg?: RefundTransactionAvgOrderByAggregateInput
    _max?: RefundTransactionMaxOrderByAggregateInput
    _min?: RefundTransactionMinOrderByAggregateInput
    _sum?: RefundTransactionSumOrderByAggregateInput
  }

  export type RefundTransactionScalarWhereWithAggregatesInput = {
    AND?: RefundTransactionScalarWhereWithAggregatesInput | RefundTransactionScalarWhereWithAggregatesInput[]
    OR?: RefundTransactionScalarWhereWithAggregatesInput[]
    NOT?: RefundTransactionScalarWhereWithAggregatesInput | RefundTransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RefundTransaction"> | string
    tenantId?: StringWithAggregatesFilter<"RefundTransaction"> | string
    orderId?: StringWithAggregatesFilter<"RefundTransaction"> | string
    amount?: FloatWithAggregatesFilter<"RefundTransaction"> | number
    currency?: StringWithAggregatesFilter<"RefundTransaction"> | string
    status?: StringWithAggregatesFilter<"RefundTransaction"> | string
    idempotencyKey?: StringWithAggregatesFilter<"RefundTransaction"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RefundTransaction"> | Date | string
  }

  export type CouponWhereInput = {
    AND?: CouponWhereInput | CouponWhereInput[]
    OR?: CouponWhereInput[]
    NOT?: CouponWhereInput | CouponWhereInput[]
    id?: StringFilter<"Coupon"> | string
    tenantId?: StringFilter<"Coupon"> | string
    customerId?: StringFilter<"Coupon"> | string
    code?: StringFilter<"Coupon"> | string
    discount?: FloatFilter<"Coupon"> | number
    isRedeemed?: BoolFilter<"Coupon"> | boolean
    expiresAt?: DateTimeNullableFilter<"Coupon"> | Date | string | null
    createdAt?: DateTimeFilter<"Coupon"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }

  export type CouponOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    code?: SortOrder
    discount?: SortOrder
    isRedeemed?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    customer?: CustomerOrderByWithRelationInput
  }

  export type CouponWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: CouponWhereInput | CouponWhereInput[]
    OR?: CouponWhereInput[]
    NOT?: CouponWhereInput | CouponWhereInput[]
    tenantId?: StringFilter<"Coupon"> | string
    customerId?: StringFilter<"Coupon"> | string
    discount?: FloatFilter<"Coupon"> | number
    isRedeemed?: BoolFilter<"Coupon"> | boolean
    expiresAt?: DateTimeNullableFilter<"Coupon"> | Date | string | null
    createdAt?: DateTimeFilter<"Coupon"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }, "id" | "code">

  export type CouponOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    code?: SortOrder
    discount?: SortOrder
    isRedeemed?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: CouponCountOrderByAggregateInput
    _avg?: CouponAvgOrderByAggregateInput
    _max?: CouponMaxOrderByAggregateInput
    _min?: CouponMinOrderByAggregateInput
    _sum?: CouponSumOrderByAggregateInput
  }

  export type CouponScalarWhereWithAggregatesInput = {
    AND?: CouponScalarWhereWithAggregatesInput | CouponScalarWhereWithAggregatesInput[]
    OR?: CouponScalarWhereWithAggregatesInput[]
    NOT?: CouponScalarWhereWithAggregatesInput | CouponScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Coupon"> | string
    tenantId?: StringWithAggregatesFilter<"Coupon"> | string
    customerId?: StringWithAggregatesFilter<"Coupon"> | string
    code?: StringWithAggregatesFilter<"Coupon"> | string
    discount?: FloatWithAggregatesFilter<"Coupon"> | number
    isRedeemed?: BoolWithAggregatesFilter<"Coupon"> | boolean
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Coupon"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Coupon"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    tenantId?: StringFilter<"Notification"> | string
    customerId?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    channel?: StringFilter<"Notification"> | string
    status?: StringFilter<"Notification"> | string
    idempotencyKey?: StringFilter<"Notification"> | string
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    message?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    customer?: CustomerOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    tenantId?: StringFilter<"Notification"> | string
    customerId?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    channel?: StringFilter<"Notification"> | string
    status?: StringFilter<"Notification"> | string
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }, "id" | "idempotencyKey">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    message?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    tenantId?: StringWithAggregatesFilter<"Notification"> | string
    customerId?: StringWithAggregatesFilter<"Notification"> | string
    type?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    channel?: StringWithAggregatesFilter<"Notification"> | string
    status?: StringWithAggregatesFilter<"Notification"> | string
    idempotencyKey?: StringWithAggregatesFilter<"Notification"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type ExecutionJobWhereInput = {
    AND?: ExecutionJobWhereInput | ExecutionJobWhereInput[]
    OR?: ExecutionJobWhereInput[]
    NOT?: ExecutionJobWhereInput | ExecutionJobWhereInput[]
    id?: StringFilter<"ExecutionJob"> | string
    tenantId?: StringFilter<"ExecutionJob"> | string
    runId?: StringFilter<"ExecutionJob"> | string
    status?: StringFilter<"ExecutionJob"> | string
    payloadJson?: StringFilter<"ExecutionJob"> | string
    attemptCount?: IntFilter<"ExecutionJob"> | number
    maxAttempts?: IntFilter<"ExecutionJob"> | number
    lastError?: StringNullableFilter<"ExecutionJob"> | string | null
    workerId?: StringNullableFilter<"ExecutionJob"> | string | null
    leaseGeneration?: IntFilter<"ExecutionJob"> | number
    leaseExpiresAt?: DateTimeNullableFilter<"ExecutionJob"> | Date | string | null
    idempotencyKey?: StringFilter<"ExecutionJob"> | string
    createdAt?: DateTimeFilter<"ExecutionJob"> | Date | string
    updatedAt?: DateTimeFilter<"ExecutionJob"> | Date | string
  }

  export type ExecutionJobOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    runId?: SortOrder
    status?: SortOrder
    payloadJson?: SortOrder
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    lastError?: SortOrder
    workerId?: SortOrder
    leaseGeneration?: SortOrder
    leaseExpiresAt?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExecutionJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    runId?: string
    idempotencyKey?: string
    AND?: ExecutionJobWhereInput | ExecutionJobWhereInput[]
    OR?: ExecutionJobWhereInput[]
    NOT?: ExecutionJobWhereInput | ExecutionJobWhereInput[]
    tenantId?: StringFilter<"ExecutionJob"> | string
    status?: StringFilter<"ExecutionJob"> | string
    payloadJson?: StringFilter<"ExecutionJob"> | string
    attemptCount?: IntFilter<"ExecutionJob"> | number
    maxAttempts?: IntFilter<"ExecutionJob"> | number
    lastError?: StringNullableFilter<"ExecutionJob"> | string | null
    workerId?: StringNullableFilter<"ExecutionJob"> | string | null
    leaseGeneration?: IntFilter<"ExecutionJob"> | number
    leaseExpiresAt?: DateTimeNullableFilter<"ExecutionJob"> | Date | string | null
    createdAt?: DateTimeFilter<"ExecutionJob"> | Date | string
    updatedAt?: DateTimeFilter<"ExecutionJob"> | Date | string
  }, "id" | "runId" | "idempotencyKey">

  export type ExecutionJobOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    runId?: SortOrder
    status?: SortOrder
    payloadJson?: SortOrder
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    lastError?: SortOrder
    workerId?: SortOrder
    leaseGeneration?: SortOrder
    leaseExpiresAt?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ExecutionJobCountOrderByAggregateInput
    _avg?: ExecutionJobAvgOrderByAggregateInput
    _max?: ExecutionJobMaxOrderByAggregateInput
    _min?: ExecutionJobMinOrderByAggregateInput
    _sum?: ExecutionJobSumOrderByAggregateInput
  }

  export type ExecutionJobScalarWhereWithAggregatesInput = {
    AND?: ExecutionJobScalarWhereWithAggregatesInput | ExecutionJobScalarWhereWithAggregatesInput[]
    OR?: ExecutionJobScalarWhereWithAggregatesInput[]
    NOT?: ExecutionJobScalarWhereWithAggregatesInput | ExecutionJobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExecutionJob"> | string
    tenantId?: StringWithAggregatesFilter<"ExecutionJob"> | string
    runId?: StringWithAggregatesFilter<"ExecutionJob"> | string
    status?: StringWithAggregatesFilter<"ExecutionJob"> | string
    payloadJson?: StringWithAggregatesFilter<"ExecutionJob"> | string
    attemptCount?: IntWithAggregatesFilter<"ExecutionJob"> | number
    maxAttempts?: IntWithAggregatesFilter<"ExecutionJob"> | number
    lastError?: StringNullableWithAggregatesFilter<"ExecutionJob"> | string | null
    workerId?: StringNullableWithAggregatesFilter<"ExecutionJob"> | string | null
    leaseGeneration?: IntWithAggregatesFilter<"ExecutionJob"> | number
    leaseExpiresAt?: DateTimeNullableWithAggregatesFilter<"ExecutionJob"> | Date | string | null
    idempotencyKey?: StringWithAggregatesFilter<"ExecutionJob"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ExecutionJob"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ExecutionJob"> | Date | string
  }

  export type MetricSnapshotWhereInput = {
    AND?: MetricSnapshotWhereInput | MetricSnapshotWhereInput[]
    OR?: MetricSnapshotWhereInput[]
    NOT?: MetricSnapshotWhereInput | MetricSnapshotWhereInput[]
    id?: StringFilter<"MetricSnapshot"> | string
    tenantId?: StringFilter<"MetricSnapshot"> | string
    metricName?: StringFilter<"MetricSnapshot"> | string
    value?: FloatFilter<"MetricSnapshot"> | number
    labelsJson?: StringFilter<"MetricSnapshot"> | string
    timestamp?: DateTimeFilter<"MetricSnapshot"> | Date | string
  }

  export type MetricSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    labelsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type MetricSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MetricSnapshotWhereInput | MetricSnapshotWhereInput[]
    OR?: MetricSnapshotWhereInput[]
    NOT?: MetricSnapshotWhereInput | MetricSnapshotWhereInput[]
    tenantId?: StringFilter<"MetricSnapshot"> | string
    metricName?: StringFilter<"MetricSnapshot"> | string
    value?: FloatFilter<"MetricSnapshot"> | number
    labelsJson?: StringFilter<"MetricSnapshot"> | string
    timestamp?: DateTimeFilter<"MetricSnapshot"> | Date | string
  }, "id">

  export type MetricSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    labelsJson?: SortOrder
    timestamp?: SortOrder
    _count?: MetricSnapshotCountOrderByAggregateInput
    _avg?: MetricSnapshotAvgOrderByAggregateInput
    _max?: MetricSnapshotMaxOrderByAggregateInput
    _min?: MetricSnapshotMinOrderByAggregateInput
    _sum?: MetricSnapshotSumOrderByAggregateInput
  }

  export type MetricSnapshotScalarWhereWithAggregatesInput = {
    AND?: MetricSnapshotScalarWhereWithAggregatesInput | MetricSnapshotScalarWhereWithAggregatesInput[]
    OR?: MetricSnapshotScalarWhereWithAggregatesInput[]
    NOT?: MetricSnapshotScalarWhereWithAggregatesInput | MetricSnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MetricSnapshot"> | string
    tenantId?: StringWithAggregatesFilter<"MetricSnapshot"> | string
    metricName?: StringWithAggregatesFilter<"MetricSnapshot"> | string
    value?: FloatWithAggregatesFilter<"MetricSnapshot"> | number
    labelsJson?: StringWithAggregatesFilter<"MetricSnapshot"> | string
    timestamp?: DateTimeWithAggregatesFilter<"MetricSnapshot"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    tenantId?: StringFilter<"AuditLog"> | string
    correlationId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    actor?: StringFilter<"AuditLog"> | string
    detailsJson?: StringFilter<"AuditLog"> | string
    timestamp?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    correlationId?: SortOrder
    action?: SortOrder
    actor?: SortOrder
    detailsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    tenantId?: StringFilter<"AuditLog"> | string
    correlationId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    actor?: StringFilter<"AuditLog"> | string
    detailsJson?: StringFilter<"AuditLog"> | string
    timestamp?: DateTimeFilter<"AuditLog"> | Date | string
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    correlationId?: SortOrder
    action?: SortOrder
    actor?: SortOrder
    detailsJson?: SortOrder
    timestamp?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    tenantId?: StringWithAggregatesFilter<"AuditLog"> | string
    correlationId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    actor?: StringWithAggregatesFilter<"AuditLog"> | string
    detailsJson?: StringWithAggregatesFilter<"AuditLog"> | string
    timestamp?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type CustomerCreateInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutCustomerInput
    tickets?: TicketCreateNestedManyWithoutCustomerInput
    coupons?: CouponCreateNestedManyWithoutCustomerInput
    notifications?: NotificationCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    tickets?: TicketUncheckedCreateNestedManyWithoutCustomerInput
    coupons?: CouponUncheckedCreateNestedManyWithoutCustomerInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUncheckedUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateManyInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity?: number
    replacementEligible?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity?: number
    replacementEligible?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity?: number
    replacementEligible?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    tickets?: TicketCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id: string
    tenantId?: string
    customerId: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    tickets?: TicketUncheckedCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    tickets?: TicketUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id: string
    tenantId?: string
    customerId: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateInput = {
    id: string
    quantity: number
    unitPrice: number
    order: OrderCreateNestedOneWithoutItemsInput
    product: ProductCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateInput = {
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: number
  }

  export type OrderItemUpdateInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    order?: OrderUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateInput = {
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type OrderItemCreateManyInput = {
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: number
  }

  export type OrderItemUpdateManyMutationInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type OrderItemUncheckedUpdateManyInput = {
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type TicketCreateInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutTicketsInput
    order?: OrderCreateNestedOneWithoutTicketsInput
    agentRuns?: AgentRunCreateNestedManyWithoutTicketInput
    traces?: AgentTraceCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateInput = {
    id: string
    tenantId?: string
    customerId: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutTicketInput
    traces?: AgentTraceUncheckedCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutTicketsNestedInput
    order?: OrderUpdateOneWithoutTicketsNestedInput
    agentRuns?: AgentRunUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRuns?: AgentRunUncheckedUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUncheckedUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketCreateManyInput = {
    id: string
    tenantId?: string
    customerId: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyVersionCreateInput = {
    id: string
    tenantId?: string
    policyId: string
    version?: number
    rulesJson: string
    isActive?: boolean
    createdById?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PolicyVersionUncheckedCreateInput = {
    id: string
    tenantId?: string
    policyId: string
    version?: number
    rulesJson: string
    isActive?: boolean
    createdById?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PolicyVersionUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    policyId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    rulesJson?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyVersionUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    policyId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    rulesJson?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyVersionCreateManyInput = {
    id: string
    tenantId?: string
    policyId: string
    version?: number
    rulesJson: string
    isActive?: boolean
    createdById?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PolicyVersionUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    policyId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    rulesJson?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyVersionUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    policyId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    rulesJson?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateInput = {
    id: string
    tenantId?: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ticket: TicketCreateNestedOneWithoutAgentRunsInput
    traces?: AgentTraceCreateNestedManyWithoutAgentRunInput
  }

  export type AgentRunUncheckedCreateInput = {
    id: string
    tenantId?: string
    ticketId: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    traces?: AgentTraceUncheckedCreateNestedManyWithoutAgentRunInput
  }

  export type AgentRunUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ticket?: TicketUpdateOneRequiredWithoutAgentRunsNestedInput
    traces?: AgentTraceUpdateManyWithoutAgentRunNestedInput
  }

  export type AgentRunUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    traces?: AgentTraceUncheckedUpdateManyWithoutAgentRunNestedInput
  }

  export type AgentRunCreateManyInput = {
    id: string
    tenantId?: string
    ticketId: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceCreateInput = {
    id: string
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
    agentRun: AgentRunCreateNestedOneWithoutTracesInput
    ticket?: TicketCreateNestedOneWithoutTracesInput
  }

  export type AgentTraceUncheckedCreateInput = {
    id: string
    agentRunId: string
    ticketId?: string | null
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type AgentTraceUpdateInput = {
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRun?: AgentRunUpdateOneRequiredWithoutTracesNestedInput
    ticket?: TicketUpdateOneWithoutTracesNestedInput
  }

  export type AgentTraceUncheckedUpdateInput = {
    agentRunId?: StringFieldUpdateOperationsInput | string
    ticketId?: NullableStringFieldUpdateOperationsInput | string | null
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceCreateManyInput = {
    id: string
    agentRunId: string
    ticketId?: string | null
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type AgentTraceUpdateManyMutationInput = {
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceUncheckedUpdateManyInput = {
    agentRunId?: StringFieldUpdateOperationsInput | string
    ticketId?: NullableStringFieldUpdateOperationsInput | string | null
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordCreateInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ticket: TicketCreateNestedOneWithoutCaseRecordsInput
  }

  export type CaseRecordUncheckedCreateInput = {
    id: string
    tenantId?: string
    ticketId: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaseRecordUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ticket?: TicketUpdateOneRequiredWithoutCaseRecordsNestedInput
  }

  export type CaseRecordUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordCreateManyInput = {
    id: string
    tenantId?: string
    ticketId: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaseRecordUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionCreateInput = {
    id: string
    tenantId?: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
    order: OrderCreateNestedOneWithoutRefundsInput
  }

  export type RefundTransactionUncheckedCreateInput = {
    id: string
    tenantId?: string
    orderId: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type RefundTransactionUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutRefundsNestedInput
  }

  export type RefundTransactionUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionCreateManyInput = {
    id: string
    tenantId?: string
    orderId: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type RefundTransactionUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponCreateInput = {
    id: string
    tenantId?: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
    customer: CustomerCreateNestedOneWithoutCouponsInput
  }

  export type CouponUncheckedCreateInput = {
    id: string
    tenantId?: string
    customerId: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CouponUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutCouponsNestedInput
  }

  export type CouponUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponCreateManyInput = {
    id: string
    tenantId?: string
    customerId: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CouponUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    id: string
    tenantId?: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
    customer: CustomerCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id: string
    tenantId?: string
    customerId: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type NotificationUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id: string
    tenantId?: string
    customerId: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExecutionJobCreateInput = {
    id: string
    tenantId?: string
    runId: string
    status?: string
    payloadJson: string
    attemptCount?: number
    maxAttempts?: number
    lastError?: string | null
    workerId?: string | null
    leaseGeneration?: number
    leaseExpiresAt?: Date | string | null
    idempotencyKey: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExecutionJobUncheckedCreateInput = {
    id: string
    tenantId?: string
    runId: string
    status?: string
    payloadJson: string
    attemptCount?: number
    maxAttempts?: number
    lastError?: string | null
    workerId?: string | null
    leaseGeneration?: number
    leaseExpiresAt?: Date | string | null
    idempotencyKey: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExecutionJobUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    workerId?: NullableStringFieldUpdateOperationsInput | string | null
    leaseGeneration?: IntFieldUpdateOperationsInput | number
    leaseExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExecutionJobUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    workerId?: NullableStringFieldUpdateOperationsInput | string | null
    leaseGeneration?: IntFieldUpdateOperationsInput | number
    leaseExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExecutionJobCreateManyInput = {
    id: string
    tenantId?: string
    runId: string
    status?: string
    payloadJson: string
    attemptCount?: number
    maxAttempts?: number
    lastError?: string | null
    workerId?: string | null
    leaseGeneration?: number
    leaseExpiresAt?: Date | string | null
    idempotencyKey: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExecutionJobUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    workerId?: NullableStringFieldUpdateOperationsInput | string | null
    leaseGeneration?: IntFieldUpdateOperationsInput | number
    leaseExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExecutionJobUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    workerId?: NullableStringFieldUpdateOperationsInput | string | null
    leaseGeneration?: IntFieldUpdateOperationsInput | number
    leaseExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricSnapshotCreateInput = {
    id: string
    tenantId?: string
    metricName: string
    value: number
    labelsJson: string
    timestamp?: Date | string
  }

  export type MetricSnapshotUncheckedCreateInput = {
    id: string
    tenantId?: string
    metricName: string
    value: number
    labelsJson: string
    timestamp?: Date | string
  }

  export type MetricSnapshotUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    labelsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricSnapshotUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    labelsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricSnapshotCreateManyInput = {
    id: string
    tenantId?: string
    metricName: string
    value: number
    labelsJson: string
    timestamp?: Date | string
  }

  export type MetricSnapshotUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    labelsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricSnapshotUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    labelsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id: string
    tenantId?: string
    correlationId: string
    action: string
    actor: string
    detailsJson: string
    timestamp?: Date | string
  }

  export type AuditLogUncheckedCreateInput = {
    id: string
    tenantId?: string
    correlationId: string
    action: string
    actor: string
    detailsJson: string
    timestamp?: Date | string
  }

  export type AuditLogUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    correlationId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    detailsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    correlationId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    detailsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id: string
    tenantId?: string
    correlationId: string
    action: string
    actor: string
    detailsJson: string
    timestamp?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    correlationId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    detailsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    correlationId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    detailsJson?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type TicketListRelationFilter = {
    every?: TicketWhereInput
    some?: TicketWhereInput
    none?: TicketWhereInput
  }

  export type CouponListRelationFilter = {
    every?: CouponWhereInput
    some?: CouponWhereInput
    none?: CouponWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TicketOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CouponOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    riskScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerAvgOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    riskScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    riskScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerSumOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type OrderItemListRelationFilter = {
    every?: OrderItemWhereInput
    some?: OrderItemWhereInput
    none?: OrderItemWhereInput
  }

  export type OrderItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    replacementEligible?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    price?: SortOrder
    stockQuantity?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    replacementEligible?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    replacementEligible?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    price?: SortOrder
    stockQuantity?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type CustomerScalarRelationFilter = {
    is?: CustomerWhereInput
    isNot?: CustomerWhereInput
  }

  export type RefundTransactionListRelationFilter = {
    every?: RefundTransactionWhereInput
    some?: RefundTransactionWhereInput
    none?: RefundTransactionWhereInput
  }

  export type RefundTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    deliveryDate?: SortOrder
    shippingStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    deliveryDate?: SortOrder
    shippingStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    deliveryDate?: SortOrder
    shippingStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    totalAmount?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type OrderScalarRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type OrderItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type OrderItemAvgOrderByAggregateInput = {
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type OrderItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type OrderItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type OrderItemSumOrderByAggregateInput = {
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type OrderNullableScalarRelationFilter = {
    is?: OrderWhereInput | null
    isNot?: OrderWhereInput | null
  }

  export type AgentRunListRelationFilter = {
    every?: AgentRunWhereInput
    some?: AgentRunWhereInput
    none?: AgentRunWhereInput
  }

  export type AgentTraceListRelationFilter = {
    every?: AgentTraceWhereInput
    some?: AgentTraceWhereInput
    none?: AgentTraceWhereInput
  }

  export type CaseRecordListRelationFilter = {
    every?: CaseRecordWhereInput
    some?: CaseRecordWhereInput
    none?: CaseRecordWhereInput
  }

  export type AgentRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentTraceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CaseRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TicketCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    refundAmount?: SortOrder
    replacementSku?: SortOrder
    requiresApproval?: SortOrder
    requiresConsent?: SortOrder
    approvalStatus?: SortOrder
    consentStatus?: SortOrder
    approvalToken?: SortOrder
    idempotencyKey?: SortOrder
    resolvedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketAvgOrderByAggregateInput = {
    refundAmount?: SortOrder
  }

  export type TicketMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    refundAmount?: SortOrder
    replacementSku?: SortOrder
    requiresApproval?: SortOrder
    requiresConsent?: SortOrder
    approvalStatus?: SortOrder
    consentStatus?: SortOrder
    approvalToken?: SortOrder
    idempotencyKey?: SortOrder
    resolvedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    refundAmount?: SortOrder
    replacementSku?: SortOrder
    requiresApproval?: SortOrder
    requiresConsent?: SortOrder
    approvalStatus?: SortOrder
    consentStatus?: SortOrder
    approvalToken?: SortOrder
    idempotencyKey?: SortOrder
    resolvedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketSumOrderByAggregateInput = {
    refundAmount?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type PolicyVersionPolicyIdVersionCompoundUniqueInput = {
    policyId: string
    version: number
  }

  export type PolicyVersionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    policyId?: SortOrder
    version?: SortOrder
    rulesJson?: SortOrder
    isActive?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PolicyVersionAvgOrderByAggregateInput = {
    version?: SortOrder
  }

  export type PolicyVersionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    policyId?: SortOrder
    version?: SortOrder
    rulesJson?: SortOrder
    isActive?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PolicyVersionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    policyId?: SortOrder
    version?: SortOrder
    rulesJson?: SortOrder
    isActive?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PolicyVersionSumOrderByAggregateInput = {
    version?: SortOrder
  }

  export type TicketScalarRelationFilter = {
    is?: TicketWhereInput
    isNot?: TicketWhereInput
  }

  export type AgentRunCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    status?: SortOrder
    intent?: SortOrder
    confidence?: SortOrder
    executedTools?: SortOrder
    overallOutcome?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type AgentRunMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    status?: SortOrder
    intent?: SortOrder
    confidence?: SortOrder
    executedTools?: SortOrder
    overallOutcome?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    status?: SortOrder
    intent?: SortOrder
    confidence?: SortOrder
    executedTools?: SortOrder
    overallOutcome?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunSumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type AgentRunScalarRelationFilter = {
    is?: AgentRunWhereInput
    isNot?: AgentRunWhereInput
  }

  export type TicketNullableScalarRelationFilter = {
    is?: TicketWhereInput | null
    isNot?: TicketWhereInput | null
  }

  export type AgentTraceCountOrderByAggregateInput = {
    id?: SortOrder
    agentRunId?: SortOrder
    ticketId?: SortOrder
    step?: SortOrder
    evidenceDetails?: SortOrder
    actor?: SortOrder
    timestamp?: SortOrder
  }

  export type AgentTraceMaxOrderByAggregateInput = {
    id?: SortOrder
    agentRunId?: SortOrder
    ticketId?: SortOrder
    step?: SortOrder
    evidenceDetails?: SortOrder
    actor?: SortOrder
    timestamp?: SortOrder
  }

  export type AgentTraceMinOrderByAggregateInput = {
    id?: SortOrder
    agentRunId?: SortOrder
    ticketId?: SortOrder
    step?: SortOrder
    evidenceDetails?: SortOrder
    actor?: SortOrder
    timestamp?: SortOrder
  }

  export type CaseRecordCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    requiresCustomerAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CaseRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    requiresCustomerAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CaseRecordMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    ticketId?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    issueType?: SortOrder
    customerMessage?: SortOrder
    status?: SortOrder
    resolutionSummary?: SortOrder
    requiresCustomerAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RefundTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type RefundTransactionAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type RefundTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type RefundTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type RefundTransactionSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CouponCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    code?: SortOrder
    discount?: SortOrder
    isRedeemed?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CouponAvgOrderByAggregateInput = {
    discount?: SortOrder
  }

  export type CouponMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    code?: SortOrder
    discount?: SortOrder
    isRedeemed?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CouponMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    code?: SortOrder
    discount?: SortOrder
    isRedeemed?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CouponSumOrderByAggregateInput = {
    discount?: SortOrder
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    message?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    message?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    message?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
  }

  export type ExecutionJobCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    runId?: SortOrder
    status?: SortOrder
    payloadJson?: SortOrder
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    lastError?: SortOrder
    workerId?: SortOrder
    leaseGeneration?: SortOrder
    leaseExpiresAt?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExecutionJobAvgOrderByAggregateInput = {
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    leaseGeneration?: SortOrder
  }

  export type ExecutionJobMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    runId?: SortOrder
    status?: SortOrder
    payloadJson?: SortOrder
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    lastError?: SortOrder
    workerId?: SortOrder
    leaseGeneration?: SortOrder
    leaseExpiresAt?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExecutionJobMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    runId?: SortOrder
    status?: SortOrder
    payloadJson?: SortOrder
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    lastError?: SortOrder
    workerId?: SortOrder
    leaseGeneration?: SortOrder
    leaseExpiresAt?: SortOrder
    idempotencyKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExecutionJobSumOrderByAggregateInput = {
    attemptCount?: SortOrder
    maxAttempts?: SortOrder
    leaseGeneration?: SortOrder
  }

  export type MetricSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    labelsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type MetricSnapshotAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type MetricSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    labelsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type MetricSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    labelsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type MetricSnapshotSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    correlationId?: SortOrder
    action?: SortOrder
    actor?: SortOrder
    detailsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    correlationId?: SortOrder
    action?: SortOrder
    actor?: SortOrder
    detailsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    correlationId?: SortOrder
    action?: SortOrder
    actor?: SortOrder
    detailsJson?: SortOrder
    timestamp?: SortOrder
  }

  export type OrderCreateNestedManyWithoutCustomerInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type TicketCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput> | TicketCreateWithoutCustomerInput[] | TicketUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutCustomerInput | TicketCreateOrConnectWithoutCustomerInput[]
    createMany?: TicketCreateManyCustomerInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type CouponCreateNestedManyWithoutCustomerInput = {
    create?: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput> | CouponCreateWithoutCustomerInput[] | CouponUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: CouponCreateOrConnectWithoutCustomerInput | CouponCreateOrConnectWithoutCustomerInput[]
    createMany?: CouponCreateManyCustomerInputEnvelope
    connect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutCustomerInput = {
    create?: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput> | NotificationCreateWithoutCustomerInput[] | NotificationUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutCustomerInput | NotificationCreateOrConnectWithoutCustomerInput[]
    createMany?: NotificationCreateManyCustomerInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type TicketUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput> | TicketCreateWithoutCustomerInput[] | TicketUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutCustomerInput | TicketCreateOrConnectWithoutCustomerInput[]
    createMany?: TicketCreateManyCustomerInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type CouponUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput> | CouponCreateWithoutCustomerInput[] | CouponUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: CouponCreateOrConnectWithoutCustomerInput | CouponCreateOrConnectWithoutCustomerInput[]
    createMany?: CouponCreateManyCustomerInputEnvelope
    connect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput> | NotificationCreateWithoutCustomerInput[] | NotificationUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutCustomerInput | NotificationCreateOrConnectWithoutCustomerInput[]
    createMany?: NotificationCreateManyCustomerInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OrderUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutCustomerInput | OrderUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutCustomerInput | OrderUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutCustomerInput | OrderUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type TicketUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput> | TicketCreateWithoutCustomerInput[] | TicketUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutCustomerInput | TicketCreateOrConnectWithoutCustomerInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutCustomerInput | TicketUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TicketCreateManyCustomerInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutCustomerInput | TicketUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutCustomerInput | TicketUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type CouponUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput> | CouponCreateWithoutCustomerInput[] | CouponUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: CouponCreateOrConnectWithoutCustomerInput | CouponCreateOrConnectWithoutCustomerInput[]
    upsert?: CouponUpsertWithWhereUniqueWithoutCustomerInput | CouponUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: CouponCreateManyCustomerInputEnvelope
    set?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    disconnect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    delete?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    connect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    update?: CouponUpdateWithWhereUniqueWithoutCustomerInput | CouponUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: CouponUpdateManyWithWhereWithoutCustomerInput | CouponUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: CouponScalarWhereInput | CouponScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput> | NotificationCreateWithoutCustomerInput[] | NotificationUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutCustomerInput | NotificationCreateOrConnectWithoutCustomerInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutCustomerInput | NotificationUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: NotificationCreateManyCustomerInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutCustomerInput | NotificationUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutCustomerInput | NotificationUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutCustomerInput | OrderUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutCustomerInput | OrderUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutCustomerInput | OrderUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type TicketUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput> | TicketCreateWithoutCustomerInput[] | TicketUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutCustomerInput | TicketCreateOrConnectWithoutCustomerInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutCustomerInput | TicketUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TicketCreateManyCustomerInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutCustomerInput | TicketUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutCustomerInput | TicketUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type CouponUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput> | CouponCreateWithoutCustomerInput[] | CouponUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: CouponCreateOrConnectWithoutCustomerInput | CouponCreateOrConnectWithoutCustomerInput[]
    upsert?: CouponUpsertWithWhereUniqueWithoutCustomerInput | CouponUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: CouponCreateManyCustomerInputEnvelope
    set?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    disconnect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    delete?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    connect?: CouponWhereUniqueInput | CouponWhereUniqueInput[]
    update?: CouponUpdateWithWhereUniqueWithoutCustomerInput | CouponUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: CouponUpdateManyWithWhereWithoutCustomerInput | CouponUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: CouponScalarWhereInput | CouponScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput> | NotificationCreateWithoutCustomerInput[] | NotificationUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutCustomerInput | NotificationCreateOrConnectWithoutCustomerInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutCustomerInput | NotificationUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: NotificationCreateManyCustomerInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutCustomerInput | NotificationUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutCustomerInput | NotificationUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type OrderItemCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type OrderItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type CustomerCreateNestedOneWithoutOrdersInput = {
    create?: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutOrdersInput
    connect?: CustomerWhereUniqueInput
  }

  export type OrderItemCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type TicketCreateNestedManyWithoutOrderInput = {
    create?: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput> | TicketCreateWithoutOrderInput[] | TicketUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutOrderInput | TicketCreateOrConnectWithoutOrderInput[]
    createMany?: TicketCreateManyOrderInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type RefundTransactionCreateNestedManyWithoutOrderInput = {
    create?: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput> | RefundTransactionCreateWithoutOrderInput[] | RefundTransactionUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: RefundTransactionCreateOrConnectWithoutOrderInput | RefundTransactionCreateOrConnectWithoutOrderInput[]
    createMany?: RefundTransactionCreateManyOrderInputEnvelope
    connect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type TicketUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput> | TicketCreateWithoutOrderInput[] | TicketUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutOrderInput | TicketCreateOrConnectWithoutOrderInput[]
    createMany?: TicketCreateManyOrderInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type RefundTransactionUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput> | RefundTransactionCreateWithoutOrderInput[] | RefundTransactionUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: RefundTransactionCreateOrConnectWithoutOrderInput | RefundTransactionCreateOrConnectWithoutOrderInput[]
    createMany?: RefundTransactionCreateManyOrderInputEnvelope
    connect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type CustomerUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutOrdersInput
    upsert?: CustomerUpsertWithoutOrdersInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutOrdersInput, CustomerUpdateWithoutOrdersInput>, CustomerUncheckedUpdateWithoutOrdersInput>
  }

  export type OrderItemUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type TicketUpdateManyWithoutOrderNestedInput = {
    create?: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput> | TicketCreateWithoutOrderInput[] | TicketUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutOrderInput | TicketCreateOrConnectWithoutOrderInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutOrderInput | TicketUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: TicketCreateManyOrderInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutOrderInput | TicketUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutOrderInput | TicketUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type RefundTransactionUpdateManyWithoutOrderNestedInput = {
    create?: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput> | RefundTransactionCreateWithoutOrderInput[] | RefundTransactionUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: RefundTransactionCreateOrConnectWithoutOrderInput | RefundTransactionCreateOrConnectWithoutOrderInput[]
    upsert?: RefundTransactionUpsertWithWhereUniqueWithoutOrderInput | RefundTransactionUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: RefundTransactionCreateManyOrderInputEnvelope
    set?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    disconnect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    delete?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    connect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    update?: RefundTransactionUpdateWithWhereUniqueWithoutOrderInput | RefundTransactionUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: RefundTransactionUpdateManyWithWhereWithoutOrderInput | RefundTransactionUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: RefundTransactionScalarWhereInput | RefundTransactionScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type TicketUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput> | TicketCreateWithoutOrderInput[] | TicketUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutOrderInput | TicketCreateOrConnectWithoutOrderInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutOrderInput | TicketUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: TicketCreateManyOrderInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutOrderInput | TicketUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutOrderInput | TicketUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type RefundTransactionUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput> | RefundTransactionCreateWithoutOrderInput[] | RefundTransactionUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: RefundTransactionCreateOrConnectWithoutOrderInput | RefundTransactionCreateOrConnectWithoutOrderInput[]
    upsert?: RefundTransactionUpsertWithWhereUniqueWithoutOrderInput | RefundTransactionUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: RefundTransactionCreateManyOrderInputEnvelope
    set?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    disconnect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    delete?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    connect?: RefundTransactionWhereUniqueInput | RefundTransactionWhereUniqueInput[]
    update?: RefundTransactionUpdateWithWhereUniqueWithoutOrderInput | RefundTransactionUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: RefundTransactionUpdateManyWithWhereWithoutOrderInput | RefundTransactionUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: RefundTransactionScalarWhereInput | RefundTransactionScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutItemsInput = {
    create?: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutItemsInput
    connect?: OrderWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type OrderUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutItemsInput
    upsert?: OrderUpsertWithoutItemsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutItemsInput, OrderUpdateWithoutItemsInput>, OrderUncheckedUpdateWithoutItemsInput>
  }

  export type ProductUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderItemsInput
    upsert?: ProductUpsertWithoutOrderItemsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutOrderItemsInput, ProductUpdateWithoutOrderItemsInput>, ProductUncheckedUpdateWithoutOrderItemsInput>
  }

  export type CustomerCreateNestedOneWithoutTicketsInput = {
    create?: XOR<CustomerCreateWithoutTicketsInput, CustomerUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTicketsInput
    connect?: CustomerWhereUniqueInput
  }

  export type OrderCreateNestedOneWithoutTicketsInput = {
    create?: XOR<OrderCreateWithoutTicketsInput, OrderUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTicketsInput
    connect?: OrderWhereUniqueInput
  }

  export type AgentRunCreateNestedManyWithoutTicketInput = {
    create?: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput> | AgentRunCreateWithoutTicketInput[] | AgentRunUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutTicketInput | AgentRunCreateOrConnectWithoutTicketInput[]
    createMany?: AgentRunCreateManyTicketInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type AgentTraceCreateNestedManyWithoutTicketInput = {
    create?: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput> | AgentTraceCreateWithoutTicketInput[] | AgentTraceUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutTicketInput | AgentTraceCreateOrConnectWithoutTicketInput[]
    createMany?: AgentTraceCreateManyTicketInputEnvelope
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
  }

  export type CaseRecordCreateNestedManyWithoutTicketInput = {
    create?: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput> | CaseRecordCreateWithoutTicketInput[] | CaseRecordUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: CaseRecordCreateOrConnectWithoutTicketInput | CaseRecordCreateOrConnectWithoutTicketInput[]
    createMany?: CaseRecordCreateManyTicketInputEnvelope
    connect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
  }

  export type AgentRunUncheckedCreateNestedManyWithoutTicketInput = {
    create?: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput> | AgentRunCreateWithoutTicketInput[] | AgentRunUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutTicketInput | AgentRunCreateOrConnectWithoutTicketInput[]
    createMany?: AgentRunCreateManyTicketInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type AgentTraceUncheckedCreateNestedManyWithoutTicketInput = {
    create?: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput> | AgentTraceCreateWithoutTicketInput[] | AgentTraceUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutTicketInput | AgentTraceCreateOrConnectWithoutTicketInput[]
    createMany?: AgentTraceCreateManyTicketInputEnvelope
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
  }

  export type CaseRecordUncheckedCreateNestedManyWithoutTicketInput = {
    create?: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput> | CaseRecordCreateWithoutTicketInput[] | CaseRecordUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: CaseRecordCreateOrConnectWithoutTicketInput | CaseRecordCreateOrConnectWithoutTicketInput[]
    createMany?: CaseRecordCreateManyTicketInputEnvelope
    connect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type CustomerUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<CustomerCreateWithoutTicketsInput, CustomerUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTicketsInput
    upsert?: CustomerUpsertWithoutTicketsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutTicketsInput, CustomerUpdateWithoutTicketsInput>, CustomerUncheckedUpdateWithoutTicketsInput>
  }

  export type OrderUpdateOneWithoutTicketsNestedInput = {
    create?: XOR<OrderCreateWithoutTicketsInput, OrderUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTicketsInput
    upsert?: OrderUpsertWithoutTicketsInput
    disconnect?: boolean
    delete?: OrderWhereInput | boolean
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutTicketsInput, OrderUpdateWithoutTicketsInput>, OrderUncheckedUpdateWithoutTicketsInput>
  }

  export type AgentRunUpdateManyWithoutTicketNestedInput = {
    create?: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput> | AgentRunCreateWithoutTicketInput[] | AgentRunUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutTicketInput | AgentRunCreateOrConnectWithoutTicketInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutTicketInput | AgentRunUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: AgentRunCreateManyTicketInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutTicketInput | AgentRunUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutTicketInput | AgentRunUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type AgentTraceUpdateManyWithoutTicketNestedInput = {
    create?: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput> | AgentTraceCreateWithoutTicketInput[] | AgentTraceUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutTicketInput | AgentTraceCreateOrConnectWithoutTicketInput[]
    upsert?: AgentTraceUpsertWithWhereUniqueWithoutTicketInput | AgentTraceUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: AgentTraceCreateManyTicketInputEnvelope
    set?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    disconnect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    delete?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    update?: AgentTraceUpdateWithWhereUniqueWithoutTicketInput | AgentTraceUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: AgentTraceUpdateManyWithWhereWithoutTicketInput | AgentTraceUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
  }

  export type CaseRecordUpdateManyWithoutTicketNestedInput = {
    create?: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput> | CaseRecordCreateWithoutTicketInput[] | CaseRecordUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: CaseRecordCreateOrConnectWithoutTicketInput | CaseRecordCreateOrConnectWithoutTicketInput[]
    upsert?: CaseRecordUpsertWithWhereUniqueWithoutTicketInput | CaseRecordUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: CaseRecordCreateManyTicketInputEnvelope
    set?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    disconnect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    delete?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    connect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    update?: CaseRecordUpdateWithWhereUniqueWithoutTicketInput | CaseRecordUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: CaseRecordUpdateManyWithWhereWithoutTicketInput | CaseRecordUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: CaseRecordScalarWhereInput | CaseRecordScalarWhereInput[]
  }

  export type AgentRunUncheckedUpdateManyWithoutTicketNestedInput = {
    create?: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput> | AgentRunCreateWithoutTicketInput[] | AgentRunUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutTicketInput | AgentRunCreateOrConnectWithoutTicketInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutTicketInput | AgentRunUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: AgentRunCreateManyTicketInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutTicketInput | AgentRunUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutTicketInput | AgentRunUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type AgentTraceUncheckedUpdateManyWithoutTicketNestedInput = {
    create?: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput> | AgentTraceCreateWithoutTicketInput[] | AgentTraceUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutTicketInput | AgentTraceCreateOrConnectWithoutTicketInput[]
    upsert?: AgentTraceUpsertWithWhereUniqueWithoutTicketInput | AgentTraceUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: AgentTraceCreateManyTicketInputEnvelope
    set?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    disconnect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    delete?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    update?: AgentTraceUpdateWithWhereUniqueWithoutTicketInput | AgentTraceUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: AgentTraceUpdateManyWithWhereWithoutTicketInput | AgentTraceUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
  }

  export type CaseRecordUncheckedUpdateManyWithoutTicketNestedInput = {
    create?: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput> | CaseRecordCreateWithoutTicketInput[] | CaseRecordUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: CaseRecordCreateOrConnectWithoutTicketInput | CaseRecordCreateOrConnectWithoutTicketInput[]
    upsert?: CaseRecordUpsertWithWhereUniqueWithoutTicketInput | CaseRecordUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: CaseRecordCreateManyTicketInputEnvelope
    set?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    disconnect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    delete?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    connect?: CaseRecordWhereUniqueInput | CaseRecordWhereUniqueInput[]
    update?: CaseRecordUpdateWithWhereUniqueWithoutTicketInput | CaseRecordUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: CaseRecordUpdateManyWithWhereWithoutTicketInput | CaseRecordUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: CaseRecordScalarWhereInput | CaseRecordScalarWhereInput[]
  }

  export type TicketCreateNestedOneWithoutAgentRunsInput = {
    create?: XOR<TicketCreateWithoutAgentRunsInput, TicketUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutAgentRunsInput
    connect?: TicketWhereUniqueInput
  }

  export type AgentTraceCreateNestedManyWithoutAgentRunInput = {
    create?: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput> | AgentTraceCreateWithoutAgentRunInput[] | AgentTraceUncheckedCreateWithoutAgentRunInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutAgentRunInput | AgentTraceCreateOrConnectWithoutAgentRunInput[]
    createMany?: AgentTraceCreateManyAgentRunInputEnvelope
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
  }

  export type AgentTraceUncheckedCreateNestedManyWithoutAgentRunInput = {
    create?: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput> | AgentTraceCreateWithoutAgentRunInput[] | AgentTraceUncheckedCreateWithoutAgentRunInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutAgentRunInput | AgentTraceCreateOrConnectWithoutAgentRunInput[]
    createMany?: AgentTraceCreateManyAgentRunInputEnvelope
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
  }

  export type TicketUpdateOneRequiredWithoutAgentRunsNestedInput = {
    create?: XOR<TicketCreateWithoutAgentRunsInput, TicketUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutAgentRunsInput
    upsert?: TicketUpsertWithoutAgentRunsInput
    connect?: TicketWhereUniqueInput
    update?: XOR<XOR<TicketUpdateToOneWithWhereWithoutAgentRunsInput, TicketUpdateWithoutAgentRunsInput>, TicketUncheckedUpdateWithoutAgentRunsInput>
  }

  export type AgentTraceUpdateManyWithoutAgentRunNestedInput = {
    create?: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput> | AgentTraceCreateWithoutAgentRunInput[] | AgentTraceUncheckedCreateWithoutAgentRunInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutAgentRunInput | AgentTraceCreateOrConnectWithoutAgentRunInput[]
    upsert?: AgentTraceUpsertWithWhereUniqueWithoutAgentRunInput | AgentTraceUpsertWithWhereUniqueWithoutAgentRunInput[]
    createMany?: AgentTraceCreateManyAgentRunInputEnvelope
    set?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    disconnect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    delete?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    update?: AgentTraceUpdateWithWhereUniqueWithoutAgentRunInput | AgentTraceUpdateWithWhereUniqueWithoutAgentRunInput[]
    updateMany?: AgentTraceUpdateManyWithWhereWithoutAgentRunInput | AgentTraceUpdateManyWithWhereWithoutAgentRunInput[]
    deleteMany?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
  }

  export type AgentTraceUncheckedUpdateManyWithoutAgentRunNestedInput = {
    create?: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput> | AgentTraceCreateWithoutAgentRunInput[] | AgentTraceUncheckedCreateWithoutAgentRunInput[]
    connectOrCreate?: AgentTraceCreateOrConnectWithoutAgentRunInput | AgentTraceCreateOrConnectWithoutAgentRunInput[]
    upsert?: AgentTraceUpsertWithWhereUniqueWithoutAgentRunInput | AgentTraceUpsertWithWhereUniqueWithoutAgentRunInput[]
    createMany?: AgentTraceCreateManyAgentRunInputEnvelope
    set?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    disconnect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    delete?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    connect?: AgentTraceWhereUniqueInput | AgentTraceWhereUniqueInput[]
    update?: AgentTraceUpdateWithWhereUniqueWithoutAgentRunInput | AgentTraceUpdateWithWhereUniqueWithoutAgentRunInput[]
    updateMany?: AgentTraceUpdateManyWithWhereWithoutAgentRunInput | AgentTraceUpdateManyWithWhereWithoutAgentRunInput[]
    deleteMany?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
  }

  export type AgentRunCreateNestedOneWithoutTracesInput = {
    create?: XOR<AgentRunCreateWithoutTracesInput, AgentRunUncheckedCreateWithoutTracesInput>
    connectOrCreate?: AgentRunCreateOrConnectWithoutTracesInput
    connect?: AgentRunWhereUniqueInput
  }

  export type TicketCreateNestedOneWithoutTracesInput = {
    create?: XOR<TicketCreateWithoutTracesInput, TicketUncheckedCreateWithoutTracesInput>
    connectOrCreate?: TicketCreateOrConnectWithoutTracesInput
    connect?: TicketWhereUniqueInput
  }

  export type AgentRunUpdateOneRequiredWithoutTracesNestedInput = {
    create?: XOR<AgentRunCreateWithoutTracesInput, AgentRunUncheckedCreateWithoutTracesInput>
    connectOrCreate?: AgentRunCreateOrConnectWithoutTracesInput
    upsert?: AgentRunUpsertWithoutTracesInput
    connect?: AgentRunWhereUniqueInput
    update?: XOR<XOR<AgentRunUpdateToOneWithWhereWithoutTracesInput, AgentRunUpdateWithoutTracesInput>, AgentRunUncheckedUpdateWithoutTracesInput>
  }

  export type TicketUpdateOneWithoutTracesNestedInput = {
    create?: XOR<TicketCreateWithoutTracesInput, TicketUncheckedCreateWithoutTracesInput>
    connectOrCreate?: TicketCreateOrConnectWithoutTracesInput
    upsert?: TicketUpsertWithoutTracesInput
    disconnect?: boolean
    delete?: TicketWhereInput | boolean
    connect?: TicketWhereUniqueInput
    update?: XOR<XOR<TicketUpdateToOneWithWhereWithoutTracesInput, TicketUpdateWithoutTracesInput>, TicketUncheckedUpdateWithoutTracesInput>
  }

  export type TicketCreateNestedOneWithoutCaseRecordsInput = {
    create?: XOR<TicketCreateWithoutCaseRecordsInput, TicketUncheckedCreateWithoutCaseRecordsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutCaseRecordsInput
    connect?: TicketWhereUniqueInput
  }

  export type TicketUpdateOneRequiredWithoutCaseRecordsNestedInput = {
    create?: XOR<TicketCreateWithoutCaseRecordsInput, TicketUncheckedCreateWithoutCaseRecordsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutCaseRecordsInput
    upsert?: TicketUpsertWithoutCaseRecordsInput
    connect?: TicketWhereUniqueInput
    update?: XOR<XOR<TicketUpdateToOneWithWhereWithoutCaseRecordsInput, TicketUpdateWithoutCaseRecordsInput>, TicketUncheckedUpdateWithoutCaseRecordsInput>
  }

  export type OrderCreateNestedOneWithoutRefundsInput = {
    create?: XOR<OrderCreateWithoutRefundsInput, OrderUncheckedCreateWithoutRefundsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutRefundsInput
    connect?: OrderWhereUniqueInput
  }

  export type OrderUpdateOneRequiredWithoutRefundsNestedInput = {
    create?: XOR<OrderCreateWithoutRefundsInput, OrderUncheckedCreateWithoutRefundsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutRefundsInput
    upsert?: OrderUpsertWithoutRefundsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutRefundsInput, OrderUpdateWithoutRefundsInput>, OrderUncheckedUpdateWithoutRefundsInput>
  }

  export type CustomerCreateNestedOneWithoutCouponsInput = {
    create?: XOR<CustomerCreateWithoutCouponsInput, CustomerUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutCouponsInput
    connect?: CustomerWhereUniqueInput
  }

  export type CustomerUpdateOneRequiredWithoutCouponsNestedInput = {
    create?: XOR<CustomerCreateWithoutCouponsInput, CustomerUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutCouponsInput
    upsert?: CustomerUpsertWithoutCouponsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutCouponsInput, CustomerUpdateWithoutCouponsInput>, CustomerUncheckedUpdateWithoutCouponsInput>
  }

  export type CustomerCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<CustomerCreateWithoutNotificationsInput, CustomerUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutNotificationsInput
    connect?: CustomerWhereUniqueInput
  }

  export type CustomerUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<CustomerCreateWithoutNotificationsInput, CustomerUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutNotificationsInput
    upsert?: CustomerUpsertWithoutNotificationsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutNotificationsInput, CustomerUpdateWithoutNotificationsInput>, CustomerUncheckedUpdateWithoutNotificationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type OrderCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemCreateNestedManyWithoutOrderInput
    tickets?: TicketCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    tickets?: TicketUncheckedCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput>
  }

  export type OrderCreateManyCustomerInputEnvelope = {
    data: OrderCreateManyCustomerInput | OrderCreateManyCustomerInput[]
  }

  export type TicketCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order?: OrderCreateNestedOneWithoutTicketsInput
    agentRuns?: AgentRunCreateNestedManyWithoutTicketInput
    traces?: AgentTraceCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutTicketInput
    traces?: AgentTraceUncheckedCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutCustomerInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput>
  }

  export type TicketCreateManyCustomerInputEnvelope = {
    data: TicketCreateManyCustomerInput | TicketCreateManyCustomerInput[]
  }

  export type CouponCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CouponUncheckedCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CouponCreateOrConnectWithoutCustomerInput = {
    where: CouponWhereUniqueInput
    create: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput>
  }

  export type CouponCreateManyCustomerInputEnvelope = {
    data: CouponCreateManyCustomerInput | CouponCreateManyCustomerInput[]
  }

  export type NotificationCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutCustomerInput = {
    id: string
    tenantId?: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutCustomerInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput>
  }

  export type NotificationCreateManyCustomerInputEnvelope = {
    data: NotificationCreateManyCustomerInput | NotificationCreateManyCustomerInput[]
  }

  export type OrderUpsertWithWhereUniqueWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutCustomerInput, OrderUncheckedUpdateWithoutCustomerInput>
    create: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutCustomerInput, OrderUncheckedUpdateWithoutCustomerInput>
  }

  export type OrderUpdateManyWithWhereWithoutCustomerInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutCustomerInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    tenantId?: StringFilter<"Order"> | string
    customerId?: StringFilter<"Order"> | string
    status?: StringFilter<"Order"> | string
    totalAmount?: FloatFilter<"Order"> | number
    currency?: StringFilter<"Order"> | string
    deliveryDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    shippingStatus?: StringFilter<"Order"> | string
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type TicketUpsertWithWhereUniqueWithoutCustomerInput = {
    where: TicketWhereUniqueInput
    update: XOR<TicketUpdateWithoutCustomerInput, TicketUncheckedUpdateWithoutCustomerInput>
    create: XOR<TicketCreateWithoutCustomerInput, TicketUncheckedCreateWithoutCustomerInput>
  }

  export type TicketUpdateWithWhereUniqueWithoutCustomerInput = {
    where: TicketWhereUniqueInput
    data: XOR<TicketUpdateWithoutCustomerInput, TicketUncheckedUpdateWithoutCustomerInput>
  }

  export type TicketUpdateManyWithWhereWithoutCustomerInput = {
    where: TicketScalarWhereInput
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyWithoutCustomerInput>
  }

  export type TicketScalarWhereInput = {
    AND?: TicketScalarWhereInput | TicketScalarWhereInput[]
    OR?: TicketScalarWhereInput[]
    NOT?: TicketScalarWhereInput | TicketScalarWhereInput[]
    id?: StringFilter<"Ticket"> | string
    tenantId?: StringFilter<"Ticket"> | string
    customerId?: StringFilter<"Ticket"> | string
    orderId?: StringNullableFilter<"Ticket"> | string | null
    issueType?: StringFilter<"Ticket"> | string
    customerMessage?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    resolutionSummary?: StringNullableFilter<"Ticket"> | string | null
    refundAmount?: FloatNullableFilter<"Ticket"> | number | null
    replacementSku?: StringNullableFilter<"Ticket"> | string | null
    requiresApproval?: BoolFilter<"Ticket"> | boolean
    requiresConsent?: BoolFilter<"Ticket"> | boolean
    approvalStatus?: StringNullableFilter<"Ticket"> | string | null
    consentStatus?: StringNullableFilter<"Ticket"> | string | null
    approvalToken?: StringNullableFilter<"Ticket"> | string | null
    idempotencyKey?: StringNullableFilter<"Ticket"> | string | null
    resolvedAt?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
  }

  export type CouponUpsertWithWhereUniqueWithoutCustomerInput = {
    where: CouponWhereUniqueInput
    update: XOR<CouponUpdateWithoutCustomerInput, CouponUncheckedUpdateWithoutCustomerInput>
    create: XOR<CouponCreateWithoutCustomerInput, CouponUncheckedCreateWithoutCustomerInput>
  }

  export type CouponUpdateWithWhereUniqueWithoutCustomerInput = {
    where: CouponWhereUniqueInput
    data: XOR<CouponUpdateWithoutCustomerInput, CouponUncheckedUpdateWithoutCustomerInput>
  }

  export type CouponUpdateManyWithWhereWithoutCustomerInput = {
    where: CouponScalarWhereInput
    data: XOR<CouponUpdateManyMutationInput, CouponUncheckedUpdateManyWithoutCustomerInput>
  }

  export type CouponScalarWhereInput = {
    AND?: CouponScalarWhereInput | CouponScalarWhereInput[]
    OR?: CouponScalarWhereInput[]
    NOT?: CouponScalarWhereInput | CouponScalarWhereInput[]
    id?: StringFilter<"Coupon"> | string
    tenantId?: StringFilter<"Coupon"> | string
    customerId?: StringFilter<"Coupon"> | string
    code?: StringFilter<"Coupon"> | string
    discount?: FloatFilter<"Coupon"> | number
    isRedeemed?: BoolFilter<"Coupon"> | boolean
    expiresAt?: DateTimeNullableFilter<"Coupon"> | Date | string | null
    createdAt?: DateTimeFilter<"Coupon"> | Date | string
  }

  export type NotificationUpsertWithWhereUniqueWithoutCustomerInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutCustomerInput, NotificationUncheckedUpdateWithoutCustomerInput>
    create: XOR<NotificationCreateWithoutCustomerInput, NotificationUncheckedCreateWithoutCustomerInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutCustomerInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutCustomerInput, NotificationUncheckedUpdateWithoutCustomerInput>
  }

  export type NotificationUpdateManyWithWhereWithoutCustomerInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutCustomerInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: StringFilter<"Notification"> | string
    tenantId?: StringFilter<"Notification"> | string
    customerId?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    channel?: StringFilter<"Notification"> | string
    status?: StringFilter<"Notification"> | string
    idempotencyKey?: StringFilter<"Notification"> | string
    createdAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type OrderItemCreateWithoutProductInput = {
    id: string
    quantity: number
    unitPrice: number
    order: OrderCreateNestedOneWithoutItemsInput
  }

  export type OrderItemUncheckedCreateWithoutProductInput = {
    id: string
    orderId: string
    quantity: number
    unitPrice: number
  }

  export type OrderItemCreateOrConnectWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemCreateManyProductInputEnvelope = {
    data: OrderItemCreateManyProductInput | OrderItemCreateManyProductInput[]
  }

  export type OrderItemUpsertWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutProductInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutProductInput>
  }

  export type OrderItemScalarWhereInput = {
    AND?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    OR?: OrderItemScalarWhereInput[]
    NOT?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    unitPrice?: FloatFilter<"OrderItem"> | number
  }

  export type CustomerCreateWithoutOrdersInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tickets?: TicketCreateNestedManyWithoutCustomerInput
    coupons?: CouponCreateNestedManyWithoutCustomerInput
    notifications?: NotificationCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutOrdersInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tickets?: TicketUncheckedCreateNestedManyWithoutCustomerInput
    coupons?: CouponUncheckedCreateNestedManyWithoutCustomerInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutOrdersInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
  }

  export type OrderItemCreateWithoutOrderInput = {
    id: string
    quantity: number
    unitPrice: number
    product: ProductCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateWithoutOrderInput = {
    id: string
    productId: string
    quantity: number
    unitPrice: number
  }

  export type OrderItemCreateOrConnectWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemCreateManyOrderInputEnvelope = {
    data: OrderItemCreateManyOrderInput | OrderItemCreateManyOrderInput[]
  }

  export type TicketCreateWithoutOrderInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutTicketsInput
    agentRuns?: AgentRunCreateNestedManyWithoutTicketInput
    traces?: AgentTraceCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutOrderInput = {
    id: string
    tenantId?: string
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutTicketInput
    traces?: AgentTraceUncheckedCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutOrderInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput>
  }

  export type TicketCreateManyOrderInputEnvelope = {
    data: TicketCreateManyOrderInput | TicketCreateManyOrderInput[]
  }

  export type RefundTransactionCreateWithoutOrderInput = {
    id: string
    tenantId?: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type RefundTransactionUncheckedCreateWithoutOrderInput = {
    id: string
    tenantId?: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type RefundTransactionCreateOrConnectWithoutOrderInput = {
    where: RefundTransactionWhereUniqueInput
    create: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput>
  }

  export type RefundTransactionCreateManyOrderInputEnvelope = {
    data: RefundTransactionCreateManyOrderInput | RefundTransactionCreateManyOrderInput[]
  }

  export type CustomerUpsertWithoutOrdersInput = {
    update: XOR<CustomerUpdateWithoutOrdersInput, CustomerUncheckedUpdateWithoutOrdersInput>
    create: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutOrdersInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutOrdersInput, CustomerUncheckedUpdateWithoutOrdersInput>
  }

  export type CustomerUpdateWithoutOrdersInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutOrdersInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUncheckedUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUncheckedUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type OrderItemUpsertWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutOrderInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutOrderInput>
  }

  export type TicketUpsertWithWhereUniqueWithoutOrderInput = {
    where: TicketWhereUniqueInput
    update: XOR<TicketUpdateWithoutOrderInput, TicketUncheckedUpdateWithoutOrderInput>
    create: XOR<TicketCreateWithoutOrderInput, TicketUncheckedCreateWithoutOrderInput>
  }

  export type TicketUpdateWithWhereUniqueWithoutOrderInput = {
    where: TicketWhereUniqueInput
    data: XOR<TicketUpdateWithoutOrderInput, TicketUncheckedUpdateWithoutOrderInput>
  }

  export type TicketUpdateManyWithWhereWithoutOrderInput = {
    where: TicketScalarWhereInput
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyWithoutOrderInput>
  }

  export type RefundTransactionUpsertWithWhereUniqueWithoutOrderInput = {
    where: RefundTransactionWhereUniqueInput
    update: XOR<RefundTransactionUpdateWithoutOrderInput, RefundTransactionUncheckedUpdateWithoutOrderInput>
    create: XOR<RefundTransactionCreateWithoutOrderInput, RefundTransactionUncheckedCreateWithoutOrderInput>
  }

  export type RefundTransactionUpdateWithWhereUniqueWithoutOrderInput = {
    where: RefundTransactionWhereUniqueInput
    data: XOR<RefundTransactionUpdateWithoutOrderInput, RefundTransactionUncheckedUpdateWithoutOrderInput>
  }

  export type RefundTransactionUpdateManyWithWhereWithoutOrderInput = {
    where: RefundTransactionScalarWhereInput
    data: XOR<RefundTransactionUpdateManyMutationInput, RefundTransactionUncheckedUpdateManyWithoutOrderInput>
  }

  export type RefundTransactionScalarWhereInput = {
    AND?: RefundTransactionScalarWhereInput | RefundTransactionScalarWhereInput[]
    OR?: RefundTransactionScalarWhereInput[]
    NOT?: RefundTransactionScalarWhereInput | RefundTransactionScalarWhereInput[]
    id?: StringFilter<"RefundTransaction"> | string
    tenantId?: StringFilter<"RefundTransaction"> | string
    orderId?: StringFilter<"RefundTransaction"> | string
    amount?: FloatFilter<"RefundTransaction"> | number
    currency?: StringFilter<"RefundTransaction"> | string
    status?: StringFilter<"RefundTransaction"> | string
    idempotencyKey?: StringFilter<"RefundTransaction"> | string
    createdAt?: DateTimeFilter<"RefundTransaction"> | Date | string
  }

  export type OrderCreateWithoutItemsInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    tickets?: TicketCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutItemsInput = {
    id: string
    tenantId?: string
    customerId: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tickets?: TicketUncheckedCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutItemsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
  }

  export type ProductCreateWithoutOrderItemsInput = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity?: number
    replacementEligible?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUncheckedCreateWithoutOrderItemsInput = {
    id: string
    name: string
    category: string
    price: number
    stockQuantity?: number
    replacementEligible?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateOrConnectWithoutOrderItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
  }

  export type OrderUpsertWithoutItemsInput = {
    update: XOR<OrderUpdateWithoutItemsInput, OrderUncheckedUpdateWithoutItemsInput>
    create: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutItemsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutItemsInput, OrderUncheckedUpdateWithoutItemsInput>
  }

  export type OrderUpdateWithoutItemsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    tickets?: TicketUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutItemsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUncheckedUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type ProductUpsertWithoutOrderItemsInput = {
    update: XOR<ProductUpdateWithoutOrderItemsInput, ProductUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutOrderItemsInput, ProductUncheckedUpdateWithoutOrderItemsInput>
  }

  export type ProductUpdateWithoutOrderItemsInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateWithoutOrderItemsInput = {
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    stockQuantity?: IntFieldUpdateOperationsInput | number
    replacementEligible?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerCreateWithoutTicketsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutCustomerInput
    coupons?: CouponCreateNestedManyWithoutCustomerInput
    notifications?: NotificationCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutTicketsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    coupons?: CouponUncheckedCreateNestedManyWithoutCustomerInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutTicketsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutTicketsInput, CustomerUncheckedCreateWithoutTicketsInput>
  }

  export type OrderCreateWithoutTicketsInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutTicketsInput = {
    id: string
    tenantId?: string
    customerId: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    refunds?: RefundTransactionUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutTicketsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutTicketsInput, OrderUncheckedCreateWithoutTicketsInput>
  }

  export type AgentRunCreateWithoutTicketInput = {
    id: string
    tenantId?: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    traces?: AgentTraceCreateNestedManyWithoutAgentRunInput
  }

  export type AgentRunUncheckedCreateWithoutTicketInput = {
    id: string
    tenantId?: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    traces?: AgentTraceUncheckedCreateNestedManyWithoutAgentRunInput
  }

  export type AgentRunCreateOrConnectWithoutTicketInput = {
    where: AgentRunWhereUniqueInput
    create: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput>
  }

  export type AgentRunCreateManyTicketInputEnvelope = {
    data: AgentRunCreateManyTicketInput | AgentRunCreateManyTicketInput[]
  }

  export type AgentTraceCreateWithoutTicketInput = {
    id: string
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
    agentRun: AgentRunCreateNestedOneWithoutTracesInput
  }

  export type AgentTraceUncheckedCreateWithoutTicketInput = {
    id: string
    agentRunId: string
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type AgentTraceCreateOrConnectWithoutTicketInput = {
    where: AgentTraceWhereUniqueInput
    create: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput>
  }

  export type AgentTraceCreateManyTicketInputEnvelope = {
    data: AgentTraceCreateManyTicketInput | AgentTraceCreateManyTicketInput[]
  }

  export type CaseRecordCreateWithoutTicketInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaseRecordUncheckedCreateWithoutTicketInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaseRecordCreateOrConnectWithoutTicketInput = {
    where: CaseRecordWhereUniqueInput
    create: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput>
  }

  export type CaseRecordCreateManyTicketInputEnvelope = {
    data: CaseRecordCreateManyTicketInput | CaseRecordCreateManyTicketInput[]
  }

  export type CustomerUpsertWithoutTicketsInput = {
    update: XOR<CustomerUpdateWithoutTicketsInput, CustomerUncheckedUpdateWithoutTicketsInput>
    create: XOR<CustomerCreateWithoutTicketsInput, CustomerUncheckedCreateWithoutTicketsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutTicketsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutTicketsInput, CustomerUncheckedUpdateWithoutTicketsInput>
  }

  export type CustomerUpdateWithoutTicketsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutTicketsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUncheckedUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type OrderUpsertWithoutTicketsInput = {
    update: XOR<OrderUpdateWithoutTicketsInput, OrderUncheckedUpdateWithoutTicketsInput>
    create: XOR<OrderCreateWithoutTicketsInput, OrderUncheckedCreateWithoutTicketsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutTicketsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutTicketsInput, OrderUncheckedUpdateWithoutTicketsInput>
  }

  export type OrderUpdateWithoutTicketsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutTicketsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type AgentRunUpsertWithWhereUniqueWithoutTicketInput = {
    where: AgentRunWhereUniqueInput
    update: XOR<AgentRunUpdateWithoutTicketInput, AgentRunUncheckedUpdateWithoutTicketInput>
    create: XOR<AgentRunCreateWithoutTicketInput, AgentRunUncheckedCreateWithoutTicketInput>
  }

  export type AgentRunUpdateWithWhereUniqueWithoutTicketInput = {
    where: AgentRunWhereUniqueInput
    data: XOR<AgentRunUpdateWithoutTicketInput, AgentRunUncheckedUpdateWithoutTicketInput>
  }

  export type AgentRunUpdateManyWithWhereWithoutTicketInput = {
    where: AgentRunScalarWhereInput
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyWithoutTicketInput>
  }

  export type AgentRunScalarWhereInput = {
    AND?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    OR?: AgentRunScalarWhereInput[]
    NOT?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    tenantId?: StringFilter<"AgentRun"> | string
    ticketId?: StringFilter<"AgentRun"> | string
    status?: StringFilter<"AgentRun"> | string
    intent?: StringNullableFilter<"AgentRun"> | string | null
    confidence?: FloatNullableFilter<"AgentRun"> | number | null
    executedTools?: StringNullableFilter<"AgentRun"> | string | null
    overallOutcome?: StringNullableFilter<"AgentRun"> | string | null
    idempotencyKey?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
  }

  export type AgentTraceUpsertWithWhereUniqueWithoutTicketInput = {
    where: AgentTraceWhereUniqueInput
    update: XOR<AgentTraceUpdateWithoutTicketInput, AgentTraceUncheckedUpdateWithoutTicketInput>
    create: XOR<AgentTraceCreateWithoutTicketInput, AgentTraceUncheckedCreateWithoutTicketInput>
  }

  export type AgentTraceUpdateWithWhereUniqueWithoutTicketInput = {
    where: AgentTraceWhereUniqueInput
    data: XOR<AgentTraceUpdateWithoutTicketInput, AgentTraceUncheckedUpdateWithoutTicketInput>
  }

  export type AgentTraceUpdateManyWithWhereWithoutTicketInput = {
    where: AgentTraceScalarWhereInput
    data: XOR<AgentTraceUpdateManyMutationInput, AgentTraceUncheckedUpdateManyWithoutTicketInput>
  }

  export type AgentTraceScalarWhereInput = {
    AND?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
    OR?: AgentTraceScalarWhereInput[]
    NOT?: AgentTraceScalarWhereInput | AgentTraceScalarWhereInput[]
    id?: StringFilter<"AgentTrace"> | string
    agentRunId?: StringFilter<"AgentTrace"> | string
    ticketId?: StringNullableFilter<"AgentTrace"> | string | null
    step?: StringFilter<"AgentTrace"> | string
    evidenceDetails?: StringFilter<"AgentTrace"> | string
    actor?: StringFilter<"AgentTrace"> | string
    timestamp?: DateTimeFilter<"AgentTrace"> | Date | string
  }

  export type CaseRecordUpsertWithWhereUniqueWithoutTicketInput = {
    where: CaseRecordWhereUniqueInput
    update: XOR<CaseRecordUpdateWithoutTicketInput, CaseRecordUncheckedUpdateWithoutTicketInput>
    create: XOR<CaseRecordCreateWithoutTicketInput, CaseRecordUncheckedCreateWithoutTicketInput>
  }

  export type CaseRecordUpdateWithWhereUniqueWithoutTicketInput = {
    where: CaseRecordWhereUniqueInput
    data: XOR<CaseRecordUpdateWithoutTicketInput, CaseRecordUncheckedUpdateWithoutTicketInput>
  }

  export type CaseRecordUpdateManyWithWhereWithoutTicketInput = {
    where: CaseRecordScalarWhereInput
    data: XOR<CaseRecordUpdateManyMutationInput, CaseRecordUncheckedUpdateManyWithoutTicketInput>
  }

  export type CaseRecordScalarWhereInput = {
    AND?: CaseRecordScalarWhereInput | CaseRecordScalarWhereInput[]
    OR?: CaseRecordScalarWhereInput[]
    NOT?: CaseRecordScalarWhereInput | CaseRecordScalarWhereInput[]
    id?: StringFilter<"CaseRecord"> | string
    tenantId?: StringFilter<"CaseRecord"> | string
    ticketId?: StringFilter<"CaseRecord"> | string
    orderId?: StringNullableFilter<"CaseRecord"> | string | null
    customerId?: StringFilter<"CaseRecord"> | string
    issueType?: StringFilter<"CaseRecord"> | string
    customerMessage?: StringFilter<"CaseRecord"> | string
    status?: StringFilter<"CaseRecord"> | string
    resolutionSummary?: StringNullableFilter<"CaseRecord"> | string | null
    requiresCustomerAction?: BoolFilter<"CaseRecord"> | boolean
    createdAt?: DateTimeFilter<"CaseRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CaseRecord"> | Date | string
  }

  export type TicketCreateWithoutAgentRunsInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutTicketsInput
    order?: OrderCreateNestedOneWithoutTicketsInput
    traces?: AgentTraceCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutAgentRunsInput = {
    id: string
    tenantId?: string
    customerId: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    traces?: AgentTraceUncheckedCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutAgentRunsInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutAgentRunsInput, TicketUncheckedCreateWithoutAgentRunsInput>
  }

  export type AgentTraceCreateWithoutAgentRunInput = {
    id: string
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
    ticket?: TicketCreateNestedOneWithoutTracesInput
  }

  export type AgentTraceUncheckedCreateWithoutAgentRunInput = {
    id: string
    ticketId?: string | null
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type AgentTraceCreateOrConnectWithoutAgentRunInput = {
    where: AgentTraceWhereUniqueInput
    create: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput>
  }

  export type AgentTraceCreateManyAgentRunInputEnvelope = {
    data: AgentTraceCreateManyAgentRunInput | AgentTraceCreateManyAgentRunInput[]
  }

  export type TicketUpsertWithoutAgentRunsInput = {
    update: XOR<TicketUpdateWithoutAgentRunsInput, TicketUncheckedUpdateWithoutAgentRunsInput>
    create: XOR<TicketCreateWithoutAgentRunsInput, TicketUncheckedCreateWithoutAgentRunsInput>
    where?: TicketWhereInput
  }

  export type TicketUpdateToOneWithWhereWithoutAgentRunsInput = {
    where?: TicketWhereInput
    data: XOR<TicketUpdateWithoutAgentRunsInput, TicketUncheckedUpdateWithoutAgentRunsInput>
  }

  export type TicketUpdateWithoutAgentRunsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutTicketsNestedInput
    order?: OrderUpdateOneWithoutTicketsNestedInput
    traces?: AgentTraceUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutAgentRunsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    traces?: AgentTraceUncheckedUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type AgentTraceUpsertWithWhereUniqueWithoutAgentRunInput = {
    where: AgentTraceWhereUniqueInput
    update: XOR<AgentTraceUpdateWithoutAgentRunInput, AgentTraceUncheckedUpdateWithoutAgentRunInput>
    create: XOR<AgentTraceCreateWithoutAgentRunInput, AgentTraceUncheckedCreateWithoutAgentRunInput>
  }

  export type AgentTraceUpdateWithWhereUniqueWithoutAgentRunInput = {
    where: AgentTraceWhereUniqueInput
    data: XOR<AgentTraceUpdateWithoutAgentRunInput, AgentTraceUncheckedUpdateWithoutAgentRunInput>
  }

  export type AgentTraceUpdateManyWithWhereWithoutAgentRunInput = {
    where: AgentTraceScalarWhereInput
    data: XOR<AgentTraceUpdateManyMutationInput, AgentTraceUncheckedUpdateManyWithoutAgentRunInput>
  }

  export type AgentRunCreateWithoutTracesInput = {
    id: string
    tenantId?: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ticket: TicketCreateNestedOneWithoutAgentRunsInput
  }

  export type AgentRunUncheckedCreateWithoutTracesInput = {
    id: string
    tenantId?: string
    ticketId: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunCreateOrConnectWithoutTracesInput = {
    where: AgentRunWhereUniqueInput
    create: XOR<AgentRunCreateWithoutTracesInput, AgentRunUncheckedCreateWithoutTracesInput>
  }

  export type TicketCreateWithoutTracesInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutTicketsInput
    order?: OrderCreateNestedOneWithoutTicketsInput
    agentRuns?: AgentRunCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutTracesInput = {
    id: string
    tenantId?: string
    customerId: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutTicketInput
    caseRecords?: CaseRecordUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutTracesInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutTracesInput, TicketUncheckedCreateWithoutTracesInput>
  }

  export type AgentRunUpsertWithoutTracesInput = {
    update: XOR<AgentRunUpdateWithoutTracesInput, AgentRunUncheckedUpdateWithoutTracesInput>
    create: XOR<AgentRunCreateWithoutTracesInput, AgentRunUncheckedCreateWithoutTracesInput>
    where?: AgentRunWhereInput
  }

  export type AgentRunUpdateToOneWithWhereWithoutTracesInput = {
    where?: AgentRunWhereInput
    data: XOR<AgentRunUpdateWithoutTracesInput, AgentRunUncheckedUpdateWithoutTracesInput>
  }

  export type AgentRunUpdateWithoutTracesInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ticket?: TicketUpdateOneRequiredWithoutAgentRunsNestedInput
  }

  export type AgentRunUncheckedUpdateWithoutTracesInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUpsertWithoutTracesInput = {
    update: XOR<TicketUpdateWithoutTracesInput, TicketUncheckedUpdateWithoutTracesInput>
    create: XOR<TicketCreateWithoutTracesInput, TicketUncheckedCreateWithoutTracesInput>
    where?: TicketWhereInput
  }

  export type TicketUpdateToOneWithWhereWithoutTracesInput = {
    where?: TicketWhereInput
    data: XOR<TicketUpdateWithoutTracesInput, TicketUncheckedUpdateWithoutTracesInput>
  }

  export type TicketUpdateWithoutTracesInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutTicketsNestedInput
    order?: OrderUpdateOneWithoutTicketsNestedInput
    agentRuns?: AgentRunUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutTracesInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRuns?: AgentRunUncheckedUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketCreateWithoutCaseRecordsInput = {
    id: string
    tenantId?: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutTicketsInput
    order?: OrderCreateNestedOneWithoutTicketsInput
    agentRuns?: AgentRunCreateNestedManyWithoutTicketInput
    traces?: AgentTraceCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutCaseRecordsInput = {
    id: string
    tenantId?: string
    customerId: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutTicketInput
    traces?: AgentTraceUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutCaseRecordsInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutCaseRecordsInput, TicketUncheckedCreateWithoutCaseRecordsInput>
  }

  export type TicketUpsertWithoutCaseRecordsInput = {
    update: XOR<TicketUpdateWithoutCaseRecordsInput, TicketUncheckedUpdateWithoutCaseRecordsInput>
    create: XOR<TicketCreateWithoutCaseRecordsInput, TicketUncheckedCreateWithoutCaseRecordsInput>
    where?: TicketWhereInput
  }

  export type TicketUpdateToOneWithWhereWithoutCaseRecordsInput = {
    where?: TicketWhereInput
    data: XOR<TicketUpdateWithoutCaseRecordsInput, TicketUncheckedUpdateWithoutCaseRecordsInput>
  }

  export type TicketUpdateWithoutCaseRecordsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutTicketsNestedInput
    order?: OrderUpdateOneWithoutTicketsNestedInput
    agentRuns?: AgentRunUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutCaseRecordsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRuns?: AgentRunUncheckedUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type OrderCreateWithoutRefundsInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    tickets?: TicketCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutRefundsInput = {
    id: string
    tenantId?: string
    customerId: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    tickets?: TicketUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutRefundsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutRefundsInput, OrderUncheckedCreateWithoutRefundsInput>
  }

  export type OrderUpsertWithoutRefundsInput = {
    update: XOR<OrderUpdateWithoutRefundsInput, OrderUncheckedUpdateWithoutRefundsInput>
    create: XOR<OrderCreateWithoutRefundsInput, OrderUncheckedCreateWithoutRefundsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutRefundsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutRefundsInput, OrderUncheckedUpdateWithoutRefundsInput>
  }

  export type OrderUpdateWithoutRefundsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    tickets?: TicketUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutRefundsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type CustomerCreateWithoutCouponsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutCustomerInput
    tickets?: TicketCreateNestedManyWithoutCustomerInput
    notifications?: NotificationCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutCouponsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    tickets?: TicketUncheckedCreateNestedManyWithoutCustomerInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutCouponsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutCouponsInput, CustomerUncheckedCreateWithoutCouponsInput>
  }

  export type CustomerUpsertWithoutCouponsInput = {
    update: XOR<CustomerUpdateWithoutCouponsInput, CustomerUncheckedUpdateWithoutCouponsInput>
    create: XOR<CustomerCreateWithoutCouponsInput, CustomerUncheckedCreateWithoutCouponsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutCouponsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutCouponsInput, CustomerUncheckedUpdateWithoutCouponsInput>
  }

  export type CustomerUpdateWithoutCouponsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutCouponsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutCustomerNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateWithoutNotificationsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutCustomerInput
    tickets?: TicketCreateNestedManyWithoutCustomerInput
    coupons?: CouponCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutNotificationsInput = {
    id: string
    tenantId?: string
    name: string
    email: string
    tier?: string
    riskScore?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    tickets?: TicketUncheckedCreateNestedManyWithoutCustomerInput
    coupons?: CouponUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutNotificationsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutNotificationsInput, CustomerUncheckedCreateWithoutNotificationsInput>
  }

  export type CustomerUpsertWithoutNotificationsInput = {
    update: XOR<CustomerUpdateWithoutNotificationsInput, CustomerUncheckedUpdateWithoutNotificationsInput>
    create: XOR<CustomerCreateWithoutNotificationsInput, CustomerUncheckedCreateWithoutNotificationsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutNotificationsInput, CustomerUncheckedUpdateWithoutNotificationsInput>
  }

  export type CustomerUpdateWithoutNotificationsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutNotificationsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: StringFieldUpdateOperationsInput | string
    riskScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutCustomerNestedInput
    coupons?: CouponUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type OrderCreateManyCustomerInput = {
    id: string
    tenantId?: string
    status?: string
    totalAmount: number
    currency?: string
    deliveryDate?: Date | string | null
    shippingStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketCreateManyCustomerInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CouponCreateManyCustomerInput = {
    id: string
    tenantId?: string
    code: string
    discount: number
    isRedeemed?: boolean
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationCreateManyCustomerInput = {
    id: string
    tenantId?: string
    type: string
    message: string
    channel?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type OrderUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    tickets?: TicketUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutOrderNestedInput
    refunds?: RefundTransactionUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    totalAmount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    deliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shippingStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneWithoutTicketsNestedInput
    agentRuns?: AgentRunUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRuns?: AgentRunUncheckedUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUncheckedUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateManyWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUncheckedUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUncheckedUpdateManyWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    discount?: FloatFieldUpdateOperationsInput | number
    isRedeemed?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutCustomerInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateManyProductInput = {
    id: string
    orderId: string
    quantity: number
    unitPrice: number
  }

  export type OrderItemUpdateWithoutProductInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    order?: OrderUpdateOneRequiredWithoutItemsNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutProductInput = {
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type OrderItemUncheckedUpdateManyWithoutProductInput = {
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type OrderItemCreateManyOrderInput = {
    id: string
    productId: string
    quantity: number
    unitPrice: number
  }

  export type TicketCreateManyOrderInput = {
    id: string
    tenantId?: string
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    refundAmount?: number | null
    replacementSku?: string | null
    requiresApproval?: boolean
    requiresConsent?: boolean
    approvalStatus?: string | null
    consentStatus?: string | null
    approvalToken?: string | null
    idempotencyKey?: string | null
    resolvedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RefundTransactionCreateManyOrderInput = {
    id: string
    tenantId?: string
    amount: number
    currency?: string
    status?: string
    idempotencyKey: string
    createdAt?: Date | string
  }

  export type OrderItemUpdateWithoutOrderInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutOrderInput = {
    productId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderInput = {
    productId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type TicketUpdateWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutTicketsNestedInput
    agentRuns?: AgentRunUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRuns?: AgentRunUncheckedUpdateManyWithoutTicketNestedInput
    traces?: AgentTraceUncheckedUpdateManyWithoutTicketNestedInput
    caseRecords?: CaseRecordUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateManyWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    replacementSku?: NullableStringFieldUpdateOperationsInput | string | null
    requiresApproval?: BoolFieldUpdateOperationsInput | boolean
    requiresConsent?: BoolFieldUpdateOperationsInput | boolean
    approvalStatus?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionUpdateWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionUncheckedUpdateWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefundTransactionUncheckedUpdateManyWithoutOrderInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateManyTicketInput = {
    id: string
    tenantId?: string
    status?: string
    intent?: string | null
    confidence?: number | null
    executedTools?: string | null
    overallOutcome?: string | null
    idempotencyKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentTraceCreateManyTicketInput = {
    id: string
    agentRunId: string
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type CaseRecordCreateManyTicketInput = {
    id: string
    tenantId?: string
    orderId?: string | null
    customerId: string
    issueType: string
    customerMessage: string
    status?: string
    resolutionSummary?: string | null
    requiresCustomerAction?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    traces?: AgentTraceUpdateManyWithoutAgentRunNestedInput
  }

  export type AgentRunUncheckedUpdateWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    traces?: AgentTraceUncheckedUpdateManyWithoutAgentRunNestedInput
  }

  export type AgentRunUncheckedUpdateManyWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    intent?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    executedTools?: NullableStringFieldUpdateOperationsInput | string | null
    overallOutcome?: NullableStringFieldUpdateOperationsInput | string | null
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceUpdateWithoutTicketInput = {
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    agentRun?: AgentRunUpdateOneRequiredWithoutTracesNestedInput
  }

  export type AgentTraceUncheckedUpdateWithoutTicketInput = {
    agentRunId?: StringFieldUpdateOperationsInput | string
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceUncheckedUpdateManyWithoutTicketInput = {
    agentRunId?: StringFieldUpdateOperationsInput | string
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordUpdateWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordUncheckedUpdateWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseRecordUncheckedUpdateManyWithoutTicketInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    issueType?: StringFieldUpdateOperationsInput | string
    customerMessage?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolutionSummary?: NullableStringFieldUpdateOperationsInput | string | null
    requiresCustomerAction?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceCreateManyAgentRunInput = {
    id: string
    ticketId?: string | null
    step: string
    evidenceDetails: string
    actor?: string
    timestamp?: Date | string
  }

  export type AgentTraceUpdateWithoutAgentRunInput = {
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    ticket?: TicketUpdateOneWithoutTracesNestedInput
  }

  export type AgentTraceUncheckedUpdateWithoutAgentRunInput = {
    ticketId?: NullableStringFieldUpdateOperationsInput | string | null
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentTraceUncheckedUpdateManyWithoutAgentRunInput = {
    ticketId?: NullableStringFieldUpdateOperationsInput | string | null
    step?: StringFieldUpdateOperationsInput | string
    evidenceDetails?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}