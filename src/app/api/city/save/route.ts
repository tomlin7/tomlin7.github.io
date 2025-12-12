import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const filePath = path.join(process.cwd(), 'public', 'city', 'data.json');

        // Ensure directory exists (it should, but safety first)
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Pretty print

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save level data:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
