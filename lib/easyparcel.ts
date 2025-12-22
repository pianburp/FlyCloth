/**
 * EasyParcel API Service
 * 
 * Handles all EasyParcel API interactions for shipment creation and payment.
 * Documentation: https://developers.easyparcel.com/
 */

// =============================================================================
// TYPES
// =============================================================================

export interface EasyParcelConfig {
  apiKey: string;
  apiUrl: string;
}

export interface ShippingAddress {
  name: string;
  contact: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country?: string;
}

export interface PickupAddress extends ShippingAddress {
  company?: string;
}

export interface CreateShipmentParams {
  pickup: PickupAddress;
  recipient: ShippingAddress;
  weight: number;
  content: string;
  value: number;
  reference: string;  // Our order ID
  collectDate: string; // YYYY-MM-DD format
}

export interface ShipmentResult {
  success: boolean;
  orderNo?: string;      // EasyParcel order number (e.g., "EI-5UFAI")
  parcelNo?: string;     // Parcel number (e.g., "EP-PQKTE")
  price?: number;
  courier?: string;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  orderNo?: string;
  awb?: string;          // Tracking number
  awbLabelUrl?: string;  // Label download URL
  trackingUrl?: string;  // Customer tracking URL
  error?: string;
}

export interface RateResult {
  success: boolean;
  rates?: CourierRate[];
  error?: string;
}

export interface CourierRate {
  serviceId: string;
  courierName: string;
  serviceName: string;
  price: number;
  estimatedDelivery: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

function getConfig(): EasyParcelConfig {
  const apiKey = process.env.EASYPARCEL_API_KEY;
  const apiUrl = process.env.EASYPARCEL_API_URL;

  if (!apiKey) {
    throw new Error('EASYPARCEL_API_KEY is not configured');
  }

  return {
    apiKey,
    apiUrl: apiUrl || 'https://demo.connect.easyparcel.my/?ac=',
  };
}

/**
 * Check if EasyParcel is properly configured
 */
export function isEasyParcelEnabled(): boolean {
  return !!process.env.EASYPARCEL_API_KEY;
}

// =============================================================================
// API HELPERS
// =============================================================================

async function callEasyParcelAPI(action: string, params: Record<string, any>): Promise<any> {
  const config = getConfig();
  const url = `${config.apiUrl}${action}`;

  const body = new URLSearchParams();
  body.append('api', config.apiKey);
  
  // Flatten nested objects for EasyParcel's expected format
  flattenParams(params, body, '');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`EasyParcel API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function flattenParams(obj: any, body: URLSearchParams, prefix: string): void {
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          flattenParams(item, body, `${newKey}[${index}]`);
        } else {
          body.append(`${newKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      flattenParams(value, body, newKey);
    } else if (value !== undefined && value !== null) {
      body.append(newKey, String(value));
    }
  }
}

// Malaysian state code mapping
const STATE_CODES: Record<string, string> = {
  'johor': 'jhr',
  'kedah': 'kdh',
  'kelantan': 'ktn',
  'melaka': 'mlk',
  'negeri sembilan': 'nsn',
  'pahang': 'phg',
  'perak': 'prk',
  'perlis': 'pls',
  'pulau pinang': 'png',
  'penang': 'png',
  'sabah': 'sbh',
  'sarawak': 'swk',
  'selangor': 'sgr',
  'terengganu': 'trg',
  'kuala lumpur': 'kul',
  'labuan': 'lbn',
  'putrajaya': 'pjy',
};

function normalizeStateCode(state: string): string {
  const lower = state.toLowerCase().trim();
  return STATE_CODES[lower] || lower.substring(0, 3);
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Check shipping rates from multiple couriers
 */
export async function checkRates(
  pickup: PickupAddress,
  recipient: ShippingAddress,
  weight: number
): Promise<RateResult> {
  try {
    const response = await callEasyParcelAPI('EPRateCheckingBulk', {
      bulk: [{
        pick_code: pickup.postcode,
        pick_state: normalizeStateCode(pickup.state),
        pick_country: pickup.country || 'MY',
        send_code: recipient.postcode,
        send_state: normalizeStateCode(recipient.state),
        send_country: recipient.country || 'MY',
        weight: weight.toString(),
        width: '0',
        length: '0',
        height: '0',
        date_coll: new Date().toISOString().split('T')[0],
      }],
    });

    if (response.api_status !== 'Success') {
      return { success: false, error: response.error_remark || 'Rate check failed' };
    }

    const rates: CourierRate[] = [];
    const result = response.result?.[0];
    
    if (result?.rates) {
      for (const rate of result.rates) {
        rates.push({
          serviceId: rate.service_id,
          courierName: rate.courier_name,
          serviceName: rate.service_name,
          price: parseFloat(rate.price) || 0,
          estimatedDelivery: rate.delivery || 'N/A',
        });
      }
    }

    return { success: true, rates };
  } catch (error) {
    console.error('EasyParcel rate check error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create a shipment order with EasyParcel
 * Default courier: J&T Express (service_id: EP-CS0JNT)
 */
export async function createShipment(
  params: CreateShipmentParams,
  serviceId: string = 'EP-CS0JNT'  // J&T Express default
): Promise<ShipmentResult> {
  try {
    const response = await callEasyParcelAPI('EPSubmitOrderBulk', {
      bulk: [{
        weight: params.weight.toString(),
        width: '1',
        length: '1',
        height: '1',
        content: params.content,
        value: params.value.toString(),
        service_id: serviceId,
        
        // Pickup (sender) details
        pick_name: params.pickup.name,
        pick_company: params.pickup.company || '',
        pick_contact: params.pickup.contact,
        pick_mobile: params.pickup.contact,
        pick_addr1: params.pickup.line1,
        pick_addr2: params.pickup.line2 || '',
        pick_city: params.pickup.city,
        pick_state: normalizeStateCode(params.pickup.state),
        pick_code: params.pickup.postcode,
        pick_country: params.pickup.country || 'MY',
        
        // Recipient (receiver) details
        send_name: params.recipient.name,
        send_contact: params.recipient.contact,
        send_mobile: params.recipient.contact,
        send_addr1: params.recipient.line1,
        send_addr2: params.recipient.line2 || '',
        send_city: params.recipient.city,
        send_state: normalizeStateCode(params.recipient.state),
        send_code: params.recipient.postcode,
        send_country: params.recipient.country || 'MY',
        
        // Other
        collect_date: params.collectDate,
        sms: '0',
        reference: params.reference,
      }],
    });

    if (response.api_status !== 'Success') {
      return { success: false, error: response.error_remark || 'Shipment creation failed' };
    }

    const result = response.result?.[0];
    if (result?.status !== 'Success') {
      return { success: false, error: result?.remarks || 'Shipment creation failed' };
    }

    return {
      success: true,
      orderNo: result.order_number,
      parcelNo: result.parcel_number,
      price: parseFloat(result.price) || 0,
      courier: result.courier,
    };
  } catch (error) {
    console.error('EasyParcel shipment creation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Pay for shipment from EasyParcel credit balance
 */
export async function payShipment(orderNo: string): Promise<PaymentResult> {
  try {
    const response = await callEasyParcelAPI('EPPayOrderBulk', {
      bulk: [{ order_no: orderNo }],
    });

    if (response.api_status !== 'Success') {
      return { success: false, error: response.error_remark || 'Payment failed' };
    }

    const result = response.result?.[0];
    if (!result) {
      return { success: false, error: 'Empty response from EasyParcel' };
    }

    // Check for insufficient credit
    if (result.messagenow === 'Insufficient Credit') {
      return { success: false, error: 'Insufficient EasyParcel credit balance' };
    }

    const parcel = result.parcel?.[0];
    return {
      success: true,
      orderNo: result.orderno,
      awb: parcel?.awb,
      awbLabelUrl: parcel?.awb_id_link,
      trackingUrl: parcel?.tracking_url,
    };
  } catch (error) {
    console.error('EasyParcel payment error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check order status
 */
export async function getOrderStatus(orderNo: string): Promise<{
  success: boolean;
  status?: string;
  payable?: boolean;
  error?: string;
}> {
  try {
    const response = await callEasyParcelAPI('EPOrderStatusBulk', {
      bulk: [{ order_no: orderNo }],
    });

    if (response.api_status !== 'Success') {
      return { success: false, error: response.error_remark || 'Status check failed' };
    }

    const result = response.result?.[0];
    return {
      success: true,
      status: result?.order_status,
      payable: result?.order_payable === 'True',
    };
  } catch (error) {
    console.error('EasyParcel status check error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check parcel/shipment status (after payment)
 */
export async function getParcelStatus(orderNo: string): Promise<{
  success: boolean;
  parcelNo?: string;
  shipStatus?: string;
  awb?: string;
  awbLabelUrl?: string;
  error?: string;
}> {
  try {
    const response = await callEasyParcelAPI('EPParcelStatusBulk', {
      bulk: [{ order_no: orderNo }],
    });

    if (response.api_status !== 'Success') {
      return { success: false, error: response.error_remark || 'Parcel status check failed' };
    }

    const result = response.result?.[0];
    const parcel = result?.parcel?.[0];
    
    return {
      success: true,
      parcelNo: parcel?.parcel_number,
      shipStatus: parcel?.ship_status,
      awb: parcel?.awb,
      awbLabelUrl: parcel?.awb_id_link,
    };
  } catch (error) {
    console.error('EasyParcel parcel status error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate tracking URL for customer
 */
export function getTrackingUrl(courier: string, awb: string): string {
  return `https://easyparcel.com/my/en/track/details/?courier=${encodeURIComponent(courier)}&awb=${encodeURIComponent(awb)}`;
}
