/**
 * Pay Shipment API Route
 * POST /api/admin/shipments/pay
 * 
 * Pays for an EasyParcel shipment from account balance.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { payShipment, isEasyParcelEnabled, getTrackingUrl } from '@/lib/easyparcel';
import { z } from 'zod';

// =============================================================================
// INPUT VALIDATION SCHEMA
// =============================================================================
const payShipmentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

export async function POST(request: NextRequest) {
  // Check admin auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check EasyParcel configuration
  if (!isEasyParcelEnabled()) {
    return NextResponse.json({ error: 'EasyParcel is not configured' }, { status: 500 });
  }

  // =============================================================================
  // VALIDATE INPUT WITH ZOD
  // =============================================================================
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = payShipmentSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const { orderId } = validation.data;
  // =============================================================================

  const serviceClient = createServiceClient();

  // Get shipment record
  const { data: shipment, error: shipmentError } = await serviceClient
    .from('easyparcel_shipments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (shipmentError || !shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
  }

  if (shipment.payment_status === 'paid') {
    return NextResponse.json({ error: 'Shipment already paid' }, { status: 400 });
  }

  // Pay shipment via EasyParcel
  const result = await payShipment(shipment.easyparcel_order_no);

  if (!result.success) {
    // Update status to failed
    await serviceClient
      .from('easyparcel_shipments')
      .update({ payment_status: 'failed' })
      .eq('id', shipment.id);

    return NextResponse.json({ error: result.error || 'Payment failed' }, { status: 500 });
  }

  // Generate tracking URL
  const trackingUrl = result.trackingUrl || getTrackingUrl(shipment.courier_name, result.awb || '');

  // Update shipment record with AWB and tracking info
  const { error: updateError } = await serviceClient
    .from('easyparcel_shipments')
    .update({
      awb: result.awb,
      awb_label_url: result.awbLabelUrl,
      tracking_url: trackingUrl,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', shipment.id);

  if (updateError) {
    console.error('Failed to update shipment record:', updateError);
  }

  // Update order status to shipped
  await serviceClient
    .from('orders')
    .update({ status: 'shipped' })
    .eq('id', orderId);

  return NextResponse.json({
    success: true,
    shipment: {
      awb: result.awb,
      awbLabelUrl: result.awbLabelUrl,
      trackingUrl,
    },
  });
}
