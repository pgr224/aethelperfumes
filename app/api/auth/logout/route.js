import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear both storefront and admin auth cookies so the session fully ends.
    response.cookies.delete('auth_token');
    response.cookies.delete('admin_token');

    return response;
}
