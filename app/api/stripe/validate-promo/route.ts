import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' });
    }

    const result = await validatePromoCode(code);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate promo code' 
    });
  }
}
