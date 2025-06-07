import { NextResponse } from 'next/server';
import { validateCredentials } from '../../../../lib/auth';

export async function POST(req) {
    const { username, password } = await req.json();

    const user = await validateCredentials(username, password);

    if (user) {
        // Here you would typically set a session or a token
        return NextResponse.json({ message: 'Login successful', user });
    } else {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
}

export async function DELETE(req) {
    // Logic for logout can be implemented here
    return NextResponse.json({ message: 'Logout successful' });
}