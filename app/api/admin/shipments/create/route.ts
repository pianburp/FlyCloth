/**
 * Create Shipment API Route
 * POST /api/admin/shipments/create
 * 
 * Creates an EasyParcel shipment for an order.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { createShipment, isEasyParcelEnabled } from '@/lib/easyparcel';

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

  const body = await request.json();
  const { orderId, weight = 1.0, collectDate } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Get order details with shipping address
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('*, user_profile:profiles(full_name, phone, address)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Check if shipment already exists
  const { data: existingShipment } = await serviceClient
    .from('easyparcel_shipments')
    .select('id')
    .eq('order_id', orderId)
    .single();

  if (existingShipment) {
    return NextResponse.json({ error: 'Shipment already exists for this order' }, { status: 400 });
  }

  // Get store settings for pickup address
  const { data: settings, error: settingsError } = await serviceClient
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (settingsError || !settings?.pickup_postcode) {
    return NextResponse.json({ 
      error: 'Pickup address not configured. Please configure it in Admin Settings.' 
    }, { status: 400 });
  }

  // Parse shipping address from order
  const shippingAddr = order.shipping_address || {};
  
  // Build recipient address
  const recipient = {
    name: shippingAddr.name || order.user_profile?.full_name || 'Customer',
    contact: order.user_profile?.phone || '0000000000',
    line1: shippingAddr.line1 || shippingAddr.address || order.user_profile?.address || '',
    line2: shippingAddr.line2 || '',
    city: shippingAddr.city || 'Unknown',
    state: shippingAddr.state || 'Unknown',
    postcode: shippingAddr.postal_code || shippingAddr.postcode || '00000',
    country: shippingAddr.country || 'MY',
  };

  // Build pickup address from store settings
  const pickup = {
    name: settings.pickup_name || 'Store',
    company: settings.pickup_company || '',
    contact: settings.pickup_contact || '0000000000',
    line1: settings.pickup_addr1 || '',
    line2: settings.pickup_addr2 || '',
    city: settings.pickup_city || 'Unknown',
    state: settings.pickup_state || 'Unknown',
    postcode: settings.pickup_postcode,
    country: 'MY',
  };

  // Determine collect date (tomorrow if not specified)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const shipDate = collectDate || tomorrow.toISOString().split('T')[0];

  // Create shipment with EasyParcel
  const result = await createShipment({
    pickup,
    recipient,
    weight,
    content: 'Clothing',
    value: order.total_amount,
    reference: orderId,
    collectDate: shipDate,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to create shipment' }, { status: 500 });
  }

  // Save shipment record
  const { error: insertError } = await serviceClient
    .from('easyparcel_shipments')
    .insert({
      order_id: orderId,
      easyparcel_order_no: result.orderNo,
      parcel_no: result.parcelNo,
      courier_name: result.courier || 'J&T Express',
      service_id: 'EP-CS0JNT',
      shipping_cost: result.price || 0,
      weight,
      collect_date: shipDate,
      payment_status: 'pending',
    });

  if (insertError) {
    console.error('Failed to save shipment record:', insertError);
    return NextResponse.json({ error: 'Shipment created but failed to save record' }, { status: 500 });
  }

  // Update order status to awaiting_shipment
  await serviceClient
    .from('orders')
    .update({ status: 'awaiting_shipment' })
    .eq('id', orderId);

  return NextResponse.json({
    success: true,
    shipment: {
      orderNo: result.orderNo,
      parcelNo: result.parcelNo,
      courier: result.courier,
      price: result.price,
    },
  });
}
