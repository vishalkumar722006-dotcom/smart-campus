require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');

const resources = [
  { name: 'Computer Lab A', type: 'Computer Lab', description: 'Modern computer lab with 40 high-performance workstations', location: 'Block A, Floor 2', capacity: 40, facilities: ['AC', 'High-Speed Internet', 'Projector', 'Whiteboards'], image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800', availability: 'available' },
  { name: 'Seminar Hall 1', type: 'Seminar Hall', description: 'Large seminar hall ideal for conferences and workshops', location: 'Main Building, Ground Floor', capacity: 150, facilities: ['AC', 'Projector', 'Microphone', 'Sound System', 'Stage'], image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', availability: 'available' },
  { name: 'Central Auditorium', type: 'Auditorium', description: 'State-of-the-art auditorium for large events', location: 'Central Campus', capacity: 500, facilities: ['AC', 'Professional Sound', 'Stage Lighting', 'Live Streaming'], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', availability: 'available' },
  { name: 'Library Study Room 1', type: 'Library Study Room', description: 'Quiet study room in the main library', location: 'Central Library, Floor 1', capacity: 20, facilities: ['WiFi', 'Whiteboard', 'Power Outlets'], image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', availability: 'available' },
  { name: 'Classroom 201', type: 'Classroom', description: 'Standard classroom for lectures and tutorials', location: 'Academic Block B, Floor 2', capacity: 60, facilities: ['Projector', 'Whiteboard', 'Fan'], image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', availability: 'available' },
  { name: 'Conference Room A', type: 'Conference Room', description: 'Professional conference room for meetings', location: 'Admin Block, Floor 1', capacity: 20, facilities: ['AC', 'Video Conferencing', 'Projector', 'Whiteboard'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', availability: 'available' },
  { name: 'Physics Lab', type: 'Physics Laboratory', description: 'Fully equipped physics laboratory', location: 'Science Block, Floor 1', capacity: 30, facilities: ['Equipment Sets', 'Safety Gear', 'Workbenches'], image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', availability: 'available' },
  { name: 'Electronics Lab', type: 'Electronics Laboratory', description: 'Electronics and circuits laboratory', location: 'Engineering Block, Floor 2', capacity: 25, facilities: ['Oscilloscopes', 'Multimeters', 'Workbenches', 'Component Sets'], image: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=800', availability: 'available' },
  { name: 'Main Sports Ground', type: 'Sports Ground', description: 'Large outdoor sports ground', location: 'Campus Ground, East Wing', capacity: 200, facilities: ['Cricket Pitch', 'Football Field', 'Athletics Track', 'Changing Rooms'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', availability: 'available' },
  { name: 'Basketball Court', type: 'Basketball Court', description: 'Indoor/outdoor basketball court', location: 'Sports Complex', capacity: 50, facilities: ['Indoor Lighting', 'Scoreboards', 'Spectator Seating'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', availability: 'available' },
  { name: 'Innovation Lab', type: 'Innovation Lab', description: '3D printing and prototyping space', location: 'Tech Hub, Floor 3', capacity: 20, facilities: ['3D Printers', 'Laser Cutters', 'Soldering Stations', 'Computers'], image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', availability: 'available' },
  { name: 'Meeting Room B', type: 'Meeting Room', description: 'Small meeting room for group discussions', location: 'Admin Block, Floor 2', capacity: 10, facilities: ['AC', 'Whiteboard', 'TV Screen'], image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800', availability: 'available' },
  { name: 'Smart Board Room', type: 'Smart Board', description: 'Interactive smart board classroom', location: 'Academic Block A, Floor 1', capacity: 40, facilities: ['Smart Board', 'WiFi', 'AC', 'Webcam for recording'], image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', availability: 'available' },
  { name: 'Indoor Sports Hall', type: 'Indoor Sports Room', description: 'Indoor multipurpose sports hall', location: 'Sports Complex, Building 2', capacity: 100, facilities: ['Badminton Courts', 'Table Tennis', 'Changing Rooms', 'Showers'], image: 'https://images.unsplash.com/photo-1587384474963-5eca9cb9cdbc?w=800', availability: 'available' },
  { name: 'Mobile Projector Kit', type: 'Projector', description: 'Portable projector with screen for any classroom', location: 'Equipment Room, Block A', capacity: 1, facilities: ['HD Projector', 'Projection Screen', 'HDMI Cable', 'Carry Case'], image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', availability: 'available' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Resource.deleteMany({});
    await Resource.insertMany(resources);
    console.log(`Seeded ${resources.length} resources`);

    let admin = await User.findOne({ email: 'admin@campus.edu' });
    if (admin) {
      admin.password = 'Admin@123';
      admin.isVerified = true;
      await admin.save();
      console.log('Admin password updated to Admin@123');
    } else {
      await User.create({ name: 'Campus Admin', email: 'admin@campus.edu', password: 'Admin@123', userId: 'ADMIN001', role: 'admin', department: 'Administration', phone: '9876543210', isVerified: true });
      console.log('Admin created: admin@campus.edu / Admin@123');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) { console.error('Seed error:', err); process.exit(1); }
};

seedDB();
