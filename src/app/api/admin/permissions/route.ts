import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, isAdminUser } from '@/lib/session';
import { connectToDatabase } from '@/lib/db';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const admins = await Admin.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'This email is already an admin' },
        { status: 400 }
      );
    }
    
    // Create new admin
    const newAdmin = new Admin({ email });
    await newAdmin.save();
    
    return NextResponse.json({
      success: true,
      admin: newAdmin,
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find admin to check if it's the default admin
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Prevent removing default admin
    if (admin.email === 'jobsicke282@gmail.com') {
      return NextResponse.json(
        { success: false, message: 'Cannot remove default admin' },
        { status: 403 }
      );
    }
    
    // Remove admin
    await Admin.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove admin' },
      { status: 500 }
    );
  }
}
