import React from 'react';
import { User, Package, Ticket as TicketIcon, CreditCard, ShieldCheck } from 'lucide-react';
import { StructuredInvestigationResult } from '../../types';

interface CaseContextCardProps {
  investigation?: StructuredInvestigationResult;
  ticketId?: string;
  orderId?: string;
  message?: string;
}

export const CaseContextCard: React.FC<CaseContextCardProps> = ({
  investigation,
  ticketId,
  orderId,
  message,
}) => {
  const customer = investigation?.customer;
  const order = investigation?.order;
  const primaryProduct = investigation?.products?.[0];

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <TicketIcon size={18} color="#06b6d4" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>Active Case Context</h3>
      </div>

      {message && (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Customer Inquiry
          </span>
          <p style={{ fontSize: '13px', color: '#f8fafc', fontStyle: 'italic' }}>
            "{message}"
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Customer Info */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <User size={16} color="#3b82f6" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Customer Profile</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
            {customer?.name || (investigation ? 'N/A' : 'Pending Investigation...')}
          </p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              {customer?.tier ? `${customer.tier} TIER` : 'TIER: N/A'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              RISK: {customer?.riskScore !== undefined ? customer.riskScore : 'N/A'}
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CreditCard size={16} color="#10b981" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Order & Amount</span>
          </div>
          <p className="font-mono" style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '600' }}>
            {order?.id || orderId || 'Not Specified'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
              {order?.totalAmount
                ? `₹${order.totalAmount.toLocaleString()}`
                : investigation?.intent?.entities?.amount
                ? `₹${investigation.intent.entities.amount.toLocaleString()}`
                : '₹0'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
              {order?.status || 'N/A'}
            </span>
          </div>
        </div>

        {/* Product & Stock */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Package size={16} color="#8b5cf6" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Primary Product</span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {primaryProduct?.productName || primaryProduct?.name || (investigation ? 'N/A' : 'Pending Investigation...')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Stock Quantity:</span>
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: primaryProduct?.stockQuantity !== undefined ? (primaryProduct.stockQuantity > 0 ? '#10b981' : '#f43f5e') : '#64748b' }}>
              {primaryProduct?.stockQuantity !== undefined ? `${primaryProduct.stockQuantity} UNITS` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
